# Price List Maker

A sophisticated client-side web application for generating professional, print-ready PDF price lists from CSV data. This tool is engineered for businesses requiring robust data parsing, advanced formatting, and high-density document generation.

---

## Overview

Price List Maker streamlines the conversion of accounting software exports into polished, publication-ready price documents. The platform combines intelligent CSV parsing with professional PDF generation to eliminate manual formatting and ensure data integrity across thousands of items.

---

## Core Features

### 1. Advanced CSV Parsing Engine
- **Custom Right-to-Left Parser**: Handles edge cases common in accounting software exports, including unescaped quotation marks in product names (e.g., `AIR VENT 4"`, `AXIAL FAN 6"`).
- **Data Integrity**: Prevents row corruption and ensures 100% accuracy of pricing and product information across large datasets (tested with 3,380+ items).

### 2. Interactive Preview & Search
- **Real-Time Search**: Instant filtering across thousands of products with keyword highlighting.
- **Visual Pagination**: Grid-based preview with 50 items per page for efficient review on desktop.

### 3. Dynamic Table of Contents
- **Structured Index**: Professionally formatted table of contents page with alternating row styling.
- **Interactive Navigation**: Fully clickable PDF bookmarks enabling direct navigation to categories and sections.

### 4. Optimized Print Layout
- **Maximum Print Density**: Compact row spacing (4pt vertical padding) accommodates up to 40 items per page.
- **Professional Headers**: Repeating page headers with automatic page numbering (`PAGE X OF Y`).
- **Clean Footers**: Eliminated footers to maximize usable space.

### 5. Branded Document Management
- **Locked Branding**: Company name, document title, and office address are secured to production defaults.
- **Asset Management**: Auto-loads company branding on startup.
- **Local Font Embedding**: Space Grotesk TrueType fonts are embedded directly, ensuring offline compatibility and consistent rendering across all platforms.

### 6. Automated File Naming
- **Date-Stamped Exports**: PDF downloads automatically include the generation date in the filename (e.g., `Sagarawat_Electricals_PriceList-18-june-2026.pdf`).

---

## Project Structure

```
Price-List-Maker/
├── index.html           # Application structure and dependencies
├── style.css            # Design system with CSS variables, theme support, and animations
├── app.js               # Core application logic (CSV parsing, PDF generation, data processing)
├── public/              # Static assets
│   ├── favicon.svg      # Brand icon
│   ├── SELogo.jpg       # Company logo
│   ├── SpaceGrotesk-Regular.ttf
│   └── SpaceGrotesk-Bold.ttf
└── dist/                # Production build output
```

---

## Installation & Usage

### Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will open automatically at `http://localhost:5173` with hot-reload enabled.

### Production Build

Generate optimized, production-ready files:

```bash
npm run build
```

Output is compiled to the `dist/` directory with:
- Minified and hashed JavaScript and CSS
- Embedded assets (fonts, favicon, logo)
- Ready for deployment on any static hosting platform (GitHub Pages, Netlify, Vercel, etc.)

---

## Technology Stack

- **Frontend**: Vanilla JavaScript
- **PDF Generation**: pdfMake
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Variables
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## License

All rights reserved. For inquiries, please contact the project maintainer.
