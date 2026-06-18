# Sagarawat Price-List Maker

A premium, client-side web application designed to parse Busy accounting CSV exports and compile them into beautiful, print-ready A4 PDF documents.

## Key Features
1. **Zero-Installation Client-Side Operation**: Run it offline by double-clicking the `index.html` file or by hosting it on simple static servers (like GitHub Pages).
2. **Metadata Auto-Parsing**: Automatically detects the company name and document titles from the initial headers of the Busy export format.
3. **Interactive Search & Pagination**: Effortlessly filter and search through thousands of products (tested on 3,000+ items) with sub-millisecond search query feedback and matching keyword highlights.
4. **Professional Print Customization**:
   - Custom Business Logo upload.
   - 5 Elegant theme palettes (Sapphire Blue, Emerald Green, Amethyst Purple, Coral Orange, Charcoal Slate) that color both the web UI and the exported PDF.
   - Adjust margins (Compact, Normal, Wide).
   - Alternate row background shading.
   - Category-wise grouping based on `Parent Group` with clean division banners.
   - Repeating headers and custom footer showing page pagination counters ("Page X of Y").
   - Hide or show discount percentages and net rates.

---

## File Structure
- [index.html](file:///C:/Users/Adish/Documents/Price-List%20Maker/index.html) - Structural framework, configurations dashboard, list preview, and CDN dependencies.
- [style.css](file:///C:/Users/Adish/Documents/Price-List%20Maker/style.css) - Premium dark layout styling, custom typography settings, slide transitions, and animations.
- [app.js](file:///C:/Users/Adish/Documents/Price-List%20Maker/app.js) - JavaScript engine managing CSV upload/parsing (using PapaParse), interactive state, search index filters, and PDF generation definitions (using pdfmake).
- [SE_ListofItems.csv](file:///C:/Users/Adish/Documents/Price-List%20Maker/SE_ListofItems.csv) - Sagarawat Electricals source data.

---

## How to Run

### Method 1: Desktop Mode (Simplest)
Double-click [index.html](file:///C:/Users/Adish/Documents/Price-List%20Maker/index.html) to open the app directly in your web browser. 
> Note: Drag & drop your `SE_ListofItems.csv` file into the box to view items.

### Method 2: Development Server (Recommended)
This runs a local web server, which allows the app to automatically detect and load [SE_ListofItems.csv](file:///C:/Users/Adish/Documents/Price-List%20Maker/SE_ListofItems.csv) upon clicking "Load Default CSV" without requiring manual file upload.

1. Install dependencies:
   ```powershell
   npm install
   ```
2. Start the dev server:
   ```powershell
   npm run dev
   ```
3. Open the link displayed in the terminal (typically `http://localhost:5173`).
