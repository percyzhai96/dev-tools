# Dev Tools

A pure frontend developer toolbox that brings together common utilities for data transformation, encoding and cryptography, development debugging, text processing, and AI-related helpers. The project is organized as static pages, works out of the box, and processes most data locally in the browser without relying on backend services.

## Overview

`Dev Tools` is designed for daily development, testing, API debugging, and text-processing workflows. It provides a lightweight, direct, and easy-to-deploy collection of web tools. The homepage groups tools by popularity and category, making it suitable for personal use as well as deployment to GitHub Pages, Nginx, or any static hosting platform.

## Features

- Pure static frontend implementation with simple deployment
- Data is processed locally in the browser by default
- Broad tool coverage across data formatting, encoding, debugging, text utilities, and AI helpers
- Independent page for each tool, making future expansion and SEO optimization easier
- No login required, open and use immediately

## Main Categories

### 1. Data Formatting

- `JSON Formatter` / `JSON Minifier` / `JSON Validator`
- `JSON and Query Converter`
- `Properties to JSON/YAML`
- `JSON to CSV`
- `CSV to JSON`
- `YAML to JSON`
- `XML to JSON`

### 2. Encoding & Crypto

- `Base64 Encode/Decode`
- `Base58 Encode/Decode`
- `Base32 Encode/Decode`
- `Punycode Encode/Decode`
- `URL Encode/Decode`
- `Unicode Converter`
- `Morse Code`
- `CRC Checksum`
- `Random Password Generator`
- `JavaScript String Escape`
- `Hex/Text Converter`
- `MD5 / SHA Hash`
- `JWT Parser`

### 3. Development & Debugging

- `Timestamp Converter`
- `UUID Generator`
- `SQL Formatter`
- `Regex Tester`
- `Regex Escape`
- `Radix Converter`
- `File Size Converter`
- `Color Converter`
- `CSS Gradient Generator`
- `Meta Tag Generator`
- `MIME Type Lookup`
- `Magic Bytes Lookup`
- `Common Port Lookup`
- `HTTP Header Lookup`
- `HTTP Method Reference`
- `Code Diff`
- `HTTP Status Code Lookup`
- `Cron Expression Parser`
- `Quartz 6-Field Cron Parser`
- `User-Agent Parser`
- `URL Parser`
- `IP Lookup`
- `IPv4 Integer Converter`
- `Random Number Generator`
- `Image to WebP`
- `JavaScript Runner`

### 4. Text Utilities

- `Text Deduplication`
- `Text Sorting`
- `Multi-line Text Tools`
- `Occurrence Counter`
- `HTML Tag Stripper`
- `Full-width / Half-width Converter`
- `Case Converter`
- `Word Count`
- `Chinese RMB Uppercase Converter`
- `Markdown Preview`
- `HTML Entity Escape`

### 5. AI Tools

- `Prompt Formatter`
- `OpenAI Request Formatter`
- `OpenAI Image Debug Tool`
- `Claude Request Formatter`
- `Token Estimator`
- `API Error Code Explanation`
- `Model Price Calculator`

## Project Structure

```text
.
├─ index.html                # Homepage
├─ *.html                    # Individual tool pages
├─ css/
│  └─ style.css              # Global styles
├─ js/                       # Scripts for each tool
├─ img/                      # Image assets
├─ vendor/                   # Third-party static assets
└─ scripts/                  # Helper scripts
```

## Usage

### Open Locally

You can directly open `index.html` in a browser to use most features.

### Run with a Local Static Server

For a more stable local environment, you can start a static server, for example:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Then visit `http://localhost:8080` or the address shown in the terminal.

## Deployment

This project is a pure static website and can be deployed directly to:

- GitHub Pages
- Gitee Pages
- Nginx
- Vercel
- Netlify
- Any static file hosting service

## Use Cases

- API debugging and request parameter processing
- Conversion between JSON, YAML, XML, CSV, and similar formats
- Encoding, decoding, hashing, and checksum calculation
- Text cleanup, sorting, counting, and formatting
- Frontend helper tasks such as color conversion, gradients, meta tags, HTTP references, and regex testing
- AI API payload debugging and related helper workflows

## Technical Notes

- Built mainly with `HTML + CSS + JavaScript`
- Tool pages are separated for clarity and maintainability
- Suitable for further expansion into a more complete developer utility portal

## Notes

- Most tools process data locally in the browser and do not actively upload content to a server
- If third-party API features are added later, privacy and network request behavior should be documented accordingly
- A modern browser is recommended for the best compatibility

## Contributing

Issues and Pull Requests are welcome to improve the tools and user experience.

1. Fork this repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## License

If you plan to publish this project as open source, it is recommended to add a clear license file such as `MIT`.
