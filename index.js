#!/usr/bin/env node
import { GITHUB_ISSUE_LINK } from "./const.js";

const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
// const { GITHUB_ISSUE_LINK } = require("./const");

// Get command line arguments
const targetDir = process.argv[2] || ".";

// Convert relative path to absolute path
const folder = path.resolve(process.cwd(), targetDir);

/**
 * Processes the specified directory to find and rename PDF files.
 * @param {string} folderPath - The path of the folder to process.
 */
function processDirectory(folderPath) {
  console.log(`Processing folder: ${folderPath}`); // Log the folder being processed

  const typeLabels = ["餐饮", "医药", "客运", "设备"];
  fs.readdir(folderPath, async (err, files) => {
    if (err) {
      console.error(`Error reading folder: ${err}. Please create an issue [here](${GITHUB_ISSUE_LINK}) for assistance.`);
      return;
    }

    const pdfFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".pdf"
    );
    if (pdfFiles.length === 0) {
      console.log("未找到 PDF 文件。 (No PDF files found.)");
      return; // Log if no PDF files found
    }

    pdfFiles.forEach((file) => {
      const filePath = path.join(folderPath, file);
      let invoiceAmount, invoiceDate, invoiceType, invoiceCode;

      // Handle specific invoice type based on file name
      if (file.includes("高德打车电子发票")) {
        invoiceAmount = file.split("-")[1].slice(0, -1);
        invoiceCode = Date.now().toString() + "_";
        invoiceType = "客运发票";
        invoiceDate = new Date();
        renameFile({
          invoiceAmount,
          invoiceDate,
          invoiceType,
          invoiceCode,
          filePath,
          file,
          folderPath,
        });
      } else {
        // Process PDF content for other invoices
        fs.readFile(filePath, (err, data) => {
          if (err) {
            console.error(
              `读取文件 ${file} 时出错: ${err} (Error reading file ${file}: ${err}). Please create an issue [here](${GITHUB_ISSUE_LINK}) for assistance.`
            );
            return; // Log if error occurs while reading file
          }
          pdf(data)
            .then(function (pdfData) {
              const text = pdfData.text;

              // Extract date
              const regexDate = /(\d{4}[\s年]+\d{2}[\s月]+\d{2}[\s日]+)/;
              const dateMatch = text.match(regexDate);
              invoiceDate = dateMatch
                ? new Date(dateMatch[1].replaceAll(/[年月日]/g, "/"))
                : "";

              // Extract code
              const regexCode = /(\d{20})/;
              const codeMatch = text.match(regexCode);
              invoiceCode = codeMatch
                ? codeMatch[1]
                : Date.now().toString() + "_";

              // Extract amount
              const regexAmount = /[¥￥]\s*(\d+\.\d{2})/g;
              let maxAmount = 0;
              let amountMatch;
              while ((amountMatch = regexAmount.exec(text)) !== null) {
                const amount = parseFloat(amountMatch[1]);
                if (amount > maxAmount) {
                  maxAmount = amount;
                }
              }
              invoiceAmount = maxAmount ? `${maxAmount.toFixed(2)}` : "";

              if (!invoiceDate || !invoiceAmount) {
                console.log(
                  "信息提取失败，文件内容如下：\n\n" +
                    text +
                    "\n请在 GitHub 上创建问题以获取帮助。 (Extraction failed, file content is as follows:\n\n" +
                    text +
                    "\nPlease create an issue [here](" + GITHUB_ISSUE_LINK + ") for assistance.)"
                );
                return; // Exit if extraction fails
              }

              // Extract type
              invoiceType = "";
              typeLabels.forEach((i) => {
                if (!invoiceType && text.includes(i)) invoiceType = i + "发票";
              });
              renameFile({
                invoiceAmount,
                invoiceDate,
                invoiceType,
                invoiceCode,
                filePath,
                file,
                folderPath,
              });
            })
            .catch((err) => {
              console.error(`Error parsing PDF ${file}: ${err}. Please create an issue [here](${GITHUB_ISSUE_LINK}) for assistance.`); // Log if error occurs while parsing PDF
            });
        });
      }
    });
  });
}

processDirectory(folder);

/**
 * Parses a date object into a string format YYMMDD.
 * @param {Date} date - The date to parse.
 * @returns {string} - The formatted date string.
 */
function parseDate(date) {
  const year = date.getFullYear().toString().slice(2); // Get last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Get month and pad to two digits
  const day = date.getDate().toString().padStart(2, "0"); // Get day and pad to two digits
  return year + month + day;
}

/**
 * Renames a PDF file based on extracted invoice information.
 * @param {Object} invoiceData - The data containing invoice information.
 * @param {string} invoiceData.invoiceAmount - The amount of the invoice.
 * @param {Date} invoiceData.invoiceDate - The date of the invoice.
 * @param {string} invoiceData.invoiceType - The type of the invoice.
 * @param {string} invoiceData.invoiceCode - The code of the invoice.
 * @param {string} invoiceData.filePath - The original file path.
 * @param {string} invoiceData.file - The original file name.
 * @param {string} invoiceData.folderPath - The folder path where the file is located.
 */
function renameFile({
  invoiceAmount,
  invoiceDate,
  invoiceType,
  invoiceCode,
  filePath,
  file,
  folderPath,
}) {
  // Rename the PDF file based on extracted information
  const newFileName = `${parseDate(invoiceDate)}_${
    invoiceType || "其他发票"
  }_${invoiceAmount}_${invoiceCode.slice(-8)}.pdf`;
  const newFilePath = path.join(folderPath, newFileName);

  fs.rename(filePath, newFilePath, (err) => {
    if (err) {
      console.error(`Error renaming file ${file}: ${err}. Please create an issue [here](${GITHUB_ISSUE_LINK}) for assistance.`); // Log if error occurs while renaming
      return;
    }
    console.log(`File renamed: ${file} => ${newFileName}`);
  });
}

module.exports = {
  renameFile,
  parseDate,
  processDirectory,
};
