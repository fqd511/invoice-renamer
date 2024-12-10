// index.test.js
import { GITHUB_ISSUE_LINK } from "./const.js";

const { renameFile, parseDate, processDirectory } = require("./index");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

jest.mock("fs");
jest.mock("pdf-parse");

describe("Invoice PDF Renamer", () => {
  const mockFolderPath = path.resolve(__dirname, "mockFolder");
  const currentFolderPath = path.resolve(__dirname);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should process the current directory when no params are provided", () => {
    const targetDir = ".";
    expect(path.resolve(process.cwd(), targetDir)).toBe(currentFolderPath);
  });

  test("should handle valid parameters", () => {
    const validFile = "valid-invoice.pdf";
    const validFilePath = path.join(mockFolderPath, validFile);

    fs.readdir.mockImplementation((dir, callback) => {
      callback(null, [validFile]);
    });

    fs.readFile.mockImplementation((filePath, callback) => {
      callback(null, "mock PDF data");
    });

    pdf.mockImplementation(() => Promise.resolve({ text: "mock PDF text" }));

    processDirectory(mockFolderPath);
    expect(fs.readdir).toHaveBeenCalledWith(
      mockFolderPath,
      expect.any(Function)
    );
  });

  test("should handle invalid parameters", () => {
    const invalidFile = "invalid-invoice.txt";
    fs.readdir.mockImplementation((dir, callback) => {
      callback(null, [invalidFile]);
    });

    processDirectory(mockFolderPath);
    expect(fs.readdir).toHaveBeenCalledWith(
      mockFolderPath,
      expect.any(Function)
    );
    // Check that no PDF processing occurs
  });

  test("should log a message when no PDF files are found", () => {
    fs.readdir.mockImplementation((dir, callback) => {
      callback(null, ["file1.txt", "file2.txt"]);
    });

    console.log = jest.fn(); // Mock console.log
    processDirectory(mockFolderPath);
    expect(console.log).toHaveBeenCalledWith(
      "未找到 PDF 文件。 (No PDF files found.)"
    );
  });

  test("should handle errors when reading a file", () => {
    const errorFile = "error-invoice.pdf";
    fs.readdir.mockImplementation((dir, callback) => {
      callback(null, [errorFile]);
    });

    fs.readFile.mockImplementation((filePath, callback) => {
      callback(new Error("File read error"), null);
    });

    console.error = jest.fn(); // Mock console.error

    processDirectory(mockFolderPath);
    expect(console.error).toHaveBeenCalledWith(
      `读取文件 ${errorFile} 时出错: Error: File read error (Error reading file ${errorFile}: Error: File read error). Please create an issue [here](${GITHUB_ISSUE_LINK}) for assistance.`
    );
  });

  test("should rename the file correctly", () => {
    const invoiceData = {
      invoiceAmount: "100.00",
      invoiceDate: new Date("2023-09-01"),
      invoiceType: "客运发票",
      invoiceCode: "12345678901234567890",
      filePath: path.join(mockFolderPath, "invoice.pdf"),
      file: "invoice.pdf",
      folderPath: mockFolderPath,
    };

    const expectedNewFileName = `${parseDate(invoiceData.invoiceDate)}_${
      invoiceData.invoiceType
    }_${invoiceData.invoiceAmount}_${invoiceData.invoiceCode.slice(-8)}.pdf`;
    const expectedNewFilePath = path.join(mockFolderPath, expectedNewFileName);

    fs.rename.mockImplementation((oldPath, newPath, callback) => {
      callback(null);
    });

    renameFile(invoiceData);

    expect(fs.rename).toHaveBeenCalledWith(
      invoiceData.filePath,
      expectedNewFilePath,
      expect.any(Function)
    );
  });

  test("should handle errors during file renaming", () => {
    const invoiceData = {
      invoiceAmount: "100.00",
      invoiceDate: new Date("2023-09-01"),
      invoiceType: "客运发票",
      invoiceCode: "12345678901234567890",
      filePath: path.join(mockFolderPath, "invoice.pdf"),
      file: "invoice.pdf",
      folderPath: mockFolderPath,
    };

    fs.rename.mockImplementation((oldPath, newPath, callback) => {
      callback(new Error("Rename error"));
    });

    console.error = jest.fn(); // Mock console.error
    console.log = jest.fn(); // Mock console.log

    renameFile(invoiceData);

    expect(console.error).toHaveBeenCalledWith(
      `Error renaming file ${invoiceData.file}: Error: Rename error. Please create an issue [here](${GITHUB_ISSUE_LINK}) for assistance.`
    ); // Log if error occurs while renaming
  });
});
