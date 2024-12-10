# rename-invoice

[![npm version](https://badge.fury.io/js/rename-invoice.svg)](https://badge.fury.io/js/rename-invoice)
[![npm downloads](https://img.shields.io/npm/dm/rename-invoice.svg)](https://www.npmjs.com/package/rename-invoice)

A command-line tool to rename invoice PDF files based on their content and name. This tool is particularly useful for organizing and managing invoice files by extracting relevant information such as invoice amount, date, type, and code from the PDF content or filename.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- Automatically renames PDF invoices based on extracted data.
- Supports specific handling for "高德打车电子发票" .
- Logs operations and errors for better debugging and user experience.
- Bilingual support in logs (English and Chinese).

## Installation

You can use the tool directly without installing it globally by using `npx`:

```shell
npx rename-invoice [directory]
```

If you prefer to install it globally, run the following command:

```shell
npm install -g rename-invoice
```

## Usage

To use the tool, run the following command in your terminal:

```shell
npx rename-invoice [directory]
```

If no directory is specified, the current directory will be used.

## How It Works

1. **Directory Scanning**: The tool scans the specified directory for PDF files.
2. **Data Extraction**: For each PDF file, it attempts to extract the following information:
   - **Invoice Amount**: Extracted from the file content or filename.
   - **Invoice Date**: Extracted from the content using regex.
   - **Invoice Type**: Identified based on predefined labels.
   - **Invoice Code**: Extracted from the content or generated if not found.
3. **File Renaming**: The tool renames the PDF file using the extracted information in the format:
   ```
   YYMMDD_InvoiceType_Amount_Code.pdf
   ```
4. **Error Handling**: If any errors occur during the process, appropriate logs are generated, and users are advised to create an issue on GitHub for assistance.

## Examples

### Example 1: Renaming a taxi Invoice

If you have a file named `高德打车电子发票-100.00.pdf`, running the tool will rename it to something like:

```
230901_客运发票_100.00_12345678.pdf
```

Where `230901` is the date in YYMMDD format, `客运发票` is the invoice type, `100.00` is the amount, and `12345678` is a generated code.

### Example 2: Renaming Standard Invoices

For a standard invoice PDF, the tool will extract the necessary information and rename it accordingly. If the PDF contains:

```
发票日期: 2023年09月01日
发票金额: ¥100.00
发票代码: 12345678901234567890
```

It will be renamed to:

```
230901_其他发票_100.00_12345678.pdf
```

### Handling Errors

If the tool fails to extract valid data from a PDF, it will log the issue and suggest creating an issue on GitHub for further assistance.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find bugs, please create an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
