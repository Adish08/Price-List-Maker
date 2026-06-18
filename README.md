# Sagarawat Price-List Maker (Price-list Formatter)

A premium, client-side web application designed to parse BUSY accounting CSV exports and compile them into beautiful, print-ready A4 PDF price lists. Optimized for high performance, maximum paper efficiency, and professional layout standards.

---

## 🌟 Key Features

1. **Robust Right-to-Left CSV Parsing**:
   - Built a custom right-to-left line parser that resolves unescaped quote anomalies in BUSY CSV exports (e.g. product names ending with quotes like `AIR VENT 4"` or `AXIAL FAN 6"`). 
   - Prevents rows from merging, ensuring **100% price/rate accuracy** and importing all 3,380+ items successfully.

2. **Interactive Search & Pagination**:
   - Instant search filters for thousands of products with keyword highlighting.
   - High-performance visual pagination (50 items per page) for desktop grid preview.

3. **Dynamic Table of Contents (TOC)**:
   - Centered, structured **INDEX / TABLE OF CONTENTS** page at the beginning of the PDF.
   - Alternating zebra-striped rows (`#f8fafc`) with compact heights matching the grid.
   - Fully **clickable bookmarks**—click any category or page number in the index to instantly jump to that section in the PDF reader.

4. **Maximum Print Density & Efficiency**:
   - Reduced table row padding to `4pt` top/bottom to maximize items per page (up to **40 items per page**).
   - Removed footers to let tables flow all the way to the bottom margin.
   - Relocated page numbers (`PAGE X OF Y`) to repeating headers (top-right), suppressed on the cover page.

5. **Locked Branding & Auto-loaded Assets**:
   - Company Name (`Sagarawat Electricals`), document title (`Price List`), and office address are locked to default production values.
   - Auto-loads company logo [SELogo.jpg](file:///C:/Users/Adish/Documents/Price-List%20Maker/public/SELogo.jpg) on startup.
   - Embeds premium **Space Grotesk** TrueType fonts locally from the server directly into pdfMake's virtual file system (`vfs`) for offline compatibility.

6. **Date-Stamped Downloads**:
   - PDF exports automatically generate filenames appended with the current date (e.g., `Sagarawat_Electricals_PriceList-18-june-2026.pdf`).

---

## 📁 File Structure

- [index.html](file:///C:/Users/Adish/Documents/Price-List%20Maker/index.html) - Structural framework, sidebar preferences, preview workspace, and dependencies.
- [style.css](file:///C:/Users/Adish/Documents/Price-List%20Maker/style.css) - Premium CSS variables, dark/light layouts, transitions, and switch designs.
- [app.js](file:///C:/Users/Adish/Documents/Price-List%20Maker/app.js) - JavaScript engine managing CSV parsing, filters, dynamic font loading, and pdfMake compile layouts.
- [public/](file:///C:/Users/Adish/Documents/Price-List%20Maker/public) - Contains static assets copied to build target:
  - `favicon.svg` - Brand minimal favicon.
  - `SELogo.jpg` - Default company logo.
  - `SpaceGrotesk-Regular.ttf` & `SpaceGrotesk-Bold.ttf` - Local fonts.
- [dist/](file:///C:/Users/Adish/Documents/Price-List%20Maker/dist) - Compiled production bundle.

---

## 🚀 How to Run & Build

### Development Mode
Runs a local dev server with hot-reloading:
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the link displayed in the terminal (typically `http://localhost:5173`).

### Production Build
Builds optimized, compressed static files to the `dist/` directory, ready to be hosted on any static hosting server (like GitHub Pages, Netlify, or Apache/Nginx):
```bash
npm run build
```
The compiled output in the `dist` folder includes the hashed Javascript, styling files, favicon, logo, and embedded fonts in a self-contained layout.
