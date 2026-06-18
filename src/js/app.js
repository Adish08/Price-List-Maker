// -------------------------------------------------------------
// Price-List Maker Javascript Logic
// -------------------------------------------------------------

// Active State Configuration
const config = {
    themeColor: '#ff6600',      // Primary theme color (Vibrant Orange)
    themeLight: '#fff5eb',      // Accent category row background (Soft Orange Tint)
    currency: '₹',             // Default currency symbol
    groupByCategory: true,     // Default grouping by parent group (ON by default)
    altRows: true,             // Shaded row background
    margins: 'compact',        // Page margins spacing
    showDiscount: true,        // Toggle discount columns
    logoBase64: null,          // Base64 encoded logo image
    showToc: true              // Toggle Table of Contents (TOC) (ON by default)
};

// Application State Data
let rawCSVData = null;
let parsedData = null; // { companyName, documentTitle, items }
let filteredItems = [];
let currentPage = 1;
const rowsPerPage = 50; // Performance-friendly visual pagination

// Initialize Application UI
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLucideIcons();
    setupEventListeners();
    loadDefaultLogo();
    loadSpaceGroteskFonts();
});

// Helper for Lucide icons rendering
function initLucideIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Delay helper for async animations/loading transitions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Setup DOM Event Listeners
function setupEventListeners() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('csv-file-input');
    const generatePdfBtn = document.getElementById('btn-generate-pdf');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');
    
    // Inputs elements for configuration
    const companyNameInput = document.getElementById('company-name');
    const docTitleInput = document.getElementById('doc-title');
    const addressInput = document.getElementById('company-address');
    const logoInput = document.getElementById('logo-upload');
    const removeLogoBtn = document.getElementById('remove-logo');
    const currencySelect = document.getElementById('currency-symbol');
    const groupByCategoryToggle = document.getElementById('group-by-category');
    const altRowsToggle = document.getElementById('alt-rows');
    const marginsSelect = document.getElementById('pdf-margins');
    const showDiscountToggle = document.getElementById('show-discount');
    
    // File Drag & Drop events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0 && files[0].name.endsWith('.csv')) {
            handleCSVFile(files[0]);
        } else {
            showToast('Please select or drop a valid CSV file.', 'danger');
        }
    });

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleCSVFile(e.target.files[0]);
        }
    });

    // Theme toggle button click listener
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Currency selector is hidden input and defaults to Rupees (₹)

    const showTocToggle = document.getElementById('show-toc');

    groupByCategoryToggle.addEventListener('change', (e) => {
        config.groupByCategory = e.target.checked;
        if (showTocToggle) {
            showTocToggle.disabled = !e.target.checked;
            if (!e.target.checked) {
                showTocToggle.checked = false;
                config.showToc = false;
            } else {
                showTocToggle.checked = true;
                config.showToc = true;
            }
        }
        if (parsedData) updateDataView();
    });

    if (showTocToggle) {
        showTocToggle.addEventListener('change', (e) => {
            config.showToc = e.target.checked;
        });
    }

    altRowsToggle.addEventListener('change', (e) => {
        config.altRows = e.target.checked;
        if (parsedData) updateDataView();
    });

    marginsSelect.addEventListener('change', (e) => {
        config.margins = e.target.value;
    });

    showDiscountToggle.addEventListener('change', (e) => {
        config.showDiscount = e.target.checked;
        if (parsedData) updateDataView();
    });

    // Real-time Search Input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
        applyFilters(query);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        applyFilters('');
    });

    // Load Local/Default CSV removed

    // Export PDF
    generatePdfBtn.addEventListener('click', () => {
        if (!parsedData || parsedData.items.length === 0) return;
        
        // Update parsed meta from input forms
        parsedData.companyName = companyNameInput.value.trim() || 'Price List';
        parsedData.documentTitle = docTitleInput.value.trim() || 'Wholesale List';
        parsedData.address = addressInput.value.trim();
        
        exportPriceListPDF();
    });

    // Logo Upload Logic
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = function(evt) {
                    config.logoBase64 = evt.target.result;
                    const preview = document.getElementById('logo-preview');
                    if (preview) preview.src = evt.target.result;
                    const previewContainer = document.getElementById('logo-preview-container');
                    if (previewContainer) previewContainer.classList.remove('hidden');
                    showToast('Company logo loaded successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeLogoBtn) {
        removeLogoBtn.addEventListener('click', () => {
            config.logoBase64 = null;
            if (logoInput) logoInput.value = '';
            const preview = document.getElementById('logo-preview');
            if (preview) preview.src = '';
            const previewContainer = document.getElementById('logo-preview-container');
            if (previewContainer) previewContainer.classList.add('hidden');
            showToast('Company logo removed.', 'info');
        });
    }

    // Pagination Click Events
    document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTablePage();
        }
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTablePage();
        }
    });

    // Dismiss error button
    const clearErrorBtn = document.getElementById('btn-clear-error');
    if (clearErrorBtn) {
        clearErrorBtn.addEventListener('click', () => {
            const container = document.getElementById('error-alert-container');
            if (container) container.classList.add('hidden');
        });
    }
}

// Convert Hex colors to RGB numbers for CSS transitions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '99, 102, 241';
}

// Display Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'danger') iconName = 'alert-triangle';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    initLucideIcons();
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

// Progress modal handlers removed

// Handle default loading removed

// Parse selected file using FileReader
function handleCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        parseCSVText(e.target.result);
    };
    reader.readAsText(file);
}

// Helper to clean double quotes in product names
function cleanQuotes(str) {
    if (!str) return '';
    let val = str.trim();
    
    // Strip leading quote if it exists
    if (val.startsWith('"')) {
        val = val.substring(1);
    }
    // Strip trailing quote if it exists
    if (val.endsWith('"')) {
        val = val.substring(0, val.length - 1);
    }
    
    // Replace any remaining consecutive double quotes with a single double quote
    val = val.replace(/"+/g, '"');
    
    return val.trim();
}

// Core parsing algorithm (Robust line-by-line parser)
function parseCSVText(csvText) {
    try {
        const lines = csvText.split(/\r?\n/);
        const data = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = [];
            let remaining = line;
            
            // Extract the last 5 columns from the right-hand side
            for (let k = 0; k < 5; k++) {
                const lastCommaIdx = remaining.lastIndexOf(',');
                if (lastCommaIdx === -1) {
                    break;
                }
                const field = remaining.substring(lastCommaIdx + 1).trim();
                parts.unshift(field);
                remaining = remaining.substring(0, lastCommaIdx);
            }
            
            // The remaining part is the first field (Product Name)
            const nameField = remaining.trim();
            parts.unshift(nameField);
            
            // Clean up quotes in the product name
            parts[0] = cleanQuotes(parts[0]);
            
            if (parts.length >= 2) {
                data.push(parts);
            }
        }
        
        if (data.length === 0) {
            showToast('Empty or invalid CSV file.', 'danger');
            return;
        }
        
        rawCSVData = data;
        processDataModel(data);
        
    } catch (err) {
        console.error('Csv parse error:', err);
        showToast('Failed to parse CSV.', 'danger');
    }
}

// Process rows to construct a structured Data model
function processDataModel(rows) {
    // Hide error banner initially
    const errorContainer = document.getElementById('error-alert-container');
    if (errorContainer) {
        errorContainer.classList.add('hidden');
    }

    // 1. Clean completely blank values
    const cleanRows = rows.filter(row => row.some(cell => cell && cell.toString().trim() !== ""));
    if (cleanRows.length === 0) {
        showToast('CSV file does not contain valid data rows.', 'danger');
        return;
    }

    const companyName = "Sagarawat Electricals";
    const documentTitle = "Price List";
    const address = "25-26, Dr. Bhabha Marg, Near Private Bus Stand\nNeemuch (M.P.) - 07423-220808";
    let headerRowIndex = -1;

    // Detect header index (looks for fields: 'Name' and either 'Price' or 'Nett')
    for (let i = 0; i < Math.min(cleanRows.length, 10); i++) {
        const row = cleanRows[i];
        const hasName = row.some(cell => cell && cell.toString().trim().toLowerCase() === "name");
        const hasNett = row.some(cell => cell && cell.toString().trim().toLowerCase() === "nett");
        const hasPrice = row.some(cell => cell && (cell.toString().trim().toLowerCase() === "price" || cell.toString().trim().toLowerCase() === "rate"));

        if (hasName && (hasNett || hasPrice)) {
            headerRowIndex = i;
            break;
        }
    }
    
    // Set fallback if header indexing fails
    if (headerRowIndex === -1) {
        headerRowIndex = 0;
    }

    const headerRow = cleanRows[headerRowIndex];

    // Check for minimum required headers: 'Name' and 'Price'
    const hasNameHeader = headerRow.some(cell => cell && cell.toString().trim().toLowerCase() === "name");
    const hasPriceHeader = headerRow.some(cell => cell && cell.toString().trim().toLowerCase() === "price");

    if (!hasNameHeader || !hasPriceHeader) {
        // Halt execution and surface a clean, styled, user-friendly error UI message block
        if (errorContainer) {
            errorContainer.classList.remove('hidden');
        }
        // Hide preview-panel & disable generate PDF button, show dropzone
        document.getElementById('dropzone').classList.remove('hidden');
        document.getElementById('preview-panel').classList.add('hidden');
        const generatePdfBtn = document.getElementById('btn-generate-pdf');
        generatePdfBtn.classList.add('disabled');
        generatePdfBtn.disabled = true;

        rawCSVData = null;
        parsedData = null;
        return;
    }
    
    // Map columns
    let colIndices = { name: -1, group: -1, unit: -1, price: -1, disc: -1, nett: -1 };
    
    headerRow.forEach((cell, idx) => {
        if (!cell) return;
        const txt = cell.toString().trim().toLowerCase();
        if (txt === "name" || txt === "item name" || txt === "particulars") colIndices.name = idx;
        else if (txt === "parent group" || txt === "group" || txt === "item group" || txt === "category") colIndices.group = idx;
        else if (txt === "unit") colIndices.unit = idx;
        else if (txt === "price" || txt === "rate" || txt === "mrp") colIndices.price = idx;
        else if (txt === "disc" || txt === "discount" || txt === "disc %" || txt === "discount%") colIndices.disc = idx;
        else if (txt === "nett" || txt === "net" || txt === "net price" || txt === "net rate" || txt === "nett rate") colIndices.nett = idx;
    });

    // Set layout defaults if not explicitly found in headers
    if (colIndices.name === -1) colIndices.name = 0;
    if (colIndices.group === -1) colIndices.group = 1;
    if (colIndices.unit === -1) colIndices.unit = 2;
    if (colIndices.price === -1) colIndices.price = 3;
    if (colIndices.disc === -1) colIndices.disc = 4;
    if (colIndices.nett === -1) colIndices.nett = 5;

    // Load structured objects array
    const items = [];
    for (let i = headerRowIndex + 1; i < cleanRows.length; i++) {
        const row = cleanRows[i];
        
        // Ensure name exists
        const itemName = row[colIndices.name] ? row[colIndices.name].toString().trim() : "";
        if (!itemName) continue;

        // Filter out summary/grand total rows
        if (itemName.toLowerCase().includes("total") || itemName.toLowerCase().includes("grand total")) {
            continue;
        }

        const group = row[colIndices.group] ? row[colIndices.group].toString().trim() : "GENERAL";
        const unit = row[colIndices.unit] ? row[colIndices.unit].toString().trim() : "Nos";
        
        // Clean commas and numeric parse
        const rawPrice = row[colIndices.price] ? row[colIndices.price].toString().replace(/,/g, '').trim() : "0";
        const rawDisc = row[colIndices.disc] ? row[colIndices.disc].toString().replace(/,/g, '').trim() : "0";
        const rawNett = row[colIndices.nett] ? row[colIndices.nett].toString().replace(/,/g, '').trim() : "0";
        
        const price = parseFloat(rawPrice) || 0;
        const disc = parseFloat(rawDisc) || 0;
        const nett = parseFloat(rawNett) || (price * (1 - (disc / 100)));

        items.push({
            name: itemName,
            group: group,
            unit: unit,
            price: price,
            disc: disc,
            nett: nett
        });
    }

    parsedData = { companyName, documentTitle, address, items };

    // Update Form fields with loaded CSV metadata values
    document.getElementById('company-name').value = companyName;
    document.getElementById('doc-title').value = documentTitle;
    document.getElementById('company-address').value = address;

    // Show Preview state & Hide dropzone
    document.getElementById('dropzone').classList.add('hidden');
    document.getElementById('preview-panel').classList.remove('hidden');
    document.getElementById('btn-generate-pdf').classList.remove('disabled');
    document.getElementById('btn-generate-pdf').disabled = false;

    updateDataView();
}

// Update filtered list metrics and preview table
function updateDataView() {
    if (!parsedData) return;
    
    applyFilters(document.getElementById('search-input').value);
    calculateMetrics();
}

// Metrics Panel Values Calculation
function calculateMetrics() {
    const items = parsedData.items;
    const totalItems = items.length;
    
    // Extract unique categories
    const categories = [...new Set(items.map(item => item.group))].length;
    
    // Average rates
    const sumRate = items.reduce((acc, curr) => acc + curr.price, 0);
    const avgRate = totalItems > 0 ? (sumRate / totalItems) : 0;
    
    // Discount count
    const discounted = items.filter(item => item.disc > 0).length;

    // Push values to UI cards
    document.getElementById('metric-total-items').innerText = totalItems.toLocaleString();
    document.getElementById('metric-categories').innerText = categories.toLocaleString();
    document.getElementById('metric-avg-price').innerText = formatCurrency(avgRate);
    document.getElementById('metric-discounted').innerText = discounted.toLocaleString();
}

// Apply searches filters to items list
function applyFilters(query) {
    if (!parsedData) return;
    currentPage = 1;
    
    const terms = query.toLowerCase().trim().split(/\s+/);
    
    if (terms.length === 0 || terms[0] === '') {
        filteredItems = [...parsedData.items];
    } else {
        filteredItems = parsedData.items.filter(item => {
            return terms.every(term => 
                item.name.toLowerCase().includes(term) || 
                item.group.toLowerCase().includes(term)
            );
        });
    }

    // Dynamic sort
    if (config.groupByCategory) {
        // Sort by Parent Group, then item Name
        filteredItems.sort((a, b) => {
            const grpCompare = a.group.localeCompare(b.group);
            if (grpCompare !== 0) return grpCompare;
            return a.name.localeCompare(b.name);
        });
    } else {
        // Simple alphabetically sort by name
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
    }

    document.getElementById('total-count').innerText = parsedData.items.length.toLocaleString();
    document.getElementById('filtered-count').innerText = filteredItems.length.toLocaleString();
    
    renderTablePage();
}

// Render dynamic visual Table pages
function renderTablePage() {
    const table = document.getElementById('preview-table');
    const tableHeader = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const emptyState = document.getElementById('table-empty-state');
    
    // Clear DOM
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    if (filteredItems.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        updatePaginationUI(0);
        return;
    }

    table.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Build Headers Row
    const hr = document.createElement('tr');
    let headerHTML = `<th style="width: 50%;">Item Name</th>`;
    if (config.groupByCategory) {
        headerHTML += `<th style="width: 15%;">Category</th>`;
    }
    headerHTML += `<th class="col-center" style="width: 10%;">Unit</th>`;
    headerHTML += `<th class="col-num" style="width: 10%;">Rate</th>`;
    
    if (config.showDiscount) {
        headerHTML += `<th class="col-num" style="width: 10%;">Disc %</th>`;
        headerHTML += `<th class="col-num" style="width: 15%;">Nett Price</th>`;
    }
    hr.innerHTML = headerHTML;
    tableHeader.appendChild(hr);

    // Pagination calculations
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, filteredItems.length);
    const pageItems = filteredItems.slice(startIdx, endIdx);

    const searchQuery = document.getElementById('search-input').value.trim();

    let lastCategory = '';
    let visualRowIndex = 0;

    pageItems.forEach(item => {
        // Group Header Insert inside table if not already rendered (on visual view only)
        if (config.groupByCategory && item.group !== lastCategory) {
            lastCategory = item.group;
            const catRow = document.createElement('tr');
            catRow.className = 'category-row';
            const numCols = config.showDiscount ? 6 : 4;
            catRow.innerHTML = `<td colspan="${numCols}"><i data-lucide="folder" style="width: 14px; height: 14px; display: inline; vertical-align: middle; margin-right: 6px;"></i>${item.group}</td>`;
            tableBody.appendChild(catRow);
        }

        const tr = document.createElement('tr');
        if (config.altRows && visualRowIndex % 2 === 0) {
            tr.className = 'shade';
        }
        visualRowIndex++;

        // Cell contents
        let nameCell = highlightMatch(item.name, searchQuery);
        let groupCell = highlightMatch(item.group, searchQuery);
        let discCell = item.disc > 0 ? `${item.disc}%` : '-';
        let nettCell = formatCurrency(item.nett);

        let rowHTML = `<td><strong>${nameCell}</strong></td>`;
        if (config.groupByCategory) {
            rowHTML += `<td>${groupCell}</td>`;
        }
        rowHTML += `<td class="col-center">${item.unit}</td>`;
        rowHTML += `<td class="col-num">${formatCurrency(item.price)}</td>`;
        
        if (config.showDiscount) {
            rowHTML += `<td class="col-num">${discCell}</td>`;
            rowHTML += `<td class="col-num" style="color: var(--primary-color); font-weight: 600;">${nettCell}</td>`;
        }
        
        tr.innerHTML = rowHTML;
        tableBody.appendChild(tr);
    });

    updatePaginationUI(totalPages);
    initLucideIcons();
}

// Highlight matches in table cell texts
function highlightMatch(text, query) {
    if (!query) return text;
    const terms = query.toLowerCase().split(/\s+/).filter(t => t);
    if (terms.length === 0) return text;
    
    // Create regex matching any of the query keywords
    let highlighted = text;
    terms.forEach(term => {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        highlighted = highlighted.replace(regex, '<span class="highlight-match">$1</span>');
    });
    return highlighted;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Pagination Controls State update
function updatePaginationUI(totalPages) {
    document.getElementById('current-page').innerText = currentPage;
    document.getElementById('total-pages').innerText = totalPages || 1;
    
    document.getElementById('btn-prev-page').disabled = (currentPage <= 1);
    document.getElementById('btn-next-page').disabled = (currentPage >= totalPages);
}

// Formatting price utilities
function formatCurrency(amount) {
    if (config.currency === '') {
        return amount.toFixed(2);
    }
    return `${config.currency} ${amount.toFixed(2)}`;
}

// -------------------------------------------------------------
// Core PDF Export Logic using pdfmake
// -------------------------------------------------------------
function exportPriceListPDF() {
    const itemsToExport = [...filteredItems];
    if (itemsToExport.length === 0) {
        showToast('No filtered items to export.', 'danger');
        return;
    }

    // Configure Space Grotesk and Roboto fonts in pdfMake
    const hasSpaceGrotesk = window.pdfMake && window.pdfMake.vfs && 
                            window.pdfMake.vfs['SpaceGrotesk-Regular.ttf'] && 
                            window.pdfMake.vfs['SpaceGrotesk-Bold.ttf'];
    const useFont = hasSpaceGrotesk ? 'SpaceGrotesk' : 'Roboto';

    pdfMake.fonts = {
        Roboto: {
            normal: 'Roboto-Regular.ttf',
            bold: 'Roboto-Medium.ttf',
            italics: 'Roboto-Italic.ttf',
            bolditalics: 'Roboto-MediumItalic.ttf'
        }
    };

    if (hasSpaceGrotesk) {
        pdfMake.fonts.SpaceGrotesk = {
            normal: 'SpaceGrotesk-Regular.ttf',
            bold: 'SpaceGrotesk-Bold.ttf'
        };
    }

    // Margins logic mapping (compact, normal, wide)
    let pageMargins = [30, 50, 30, 20]; // default normal
    if (config.margins === 'compact') pageMargins = [20, 35, 20, 15];
    if (config.margins === 'wide') pageMargins = [45, 60, 45, 25];

    // Gather categories for manual TOC
    const uniqueCategories = [];
    itemsToExport.forEach(item => {
        if (config.groupByCategory && !uniqueCategories.includes(item.group)) {
            uniqueCategories.push(item.group);
        }
    });

    let tocTableObj = null;
    if (config.showToc && config.groupByCategory) {
        const tocTableBody = [];
        // Header Row for TOC Table
        tocTableBody.push([
            { text: 'Brand / Category Name', style: 'tocTableHeader', alignment: 'left' },
            { text: 'Page No.', style: 'tocTableHeader', alignment: 'right' }
        ]);

        uniqueCategories.forEach((cat, idx) => {
            const isEven = (idx % 2 === 0);
            const rowBg = isEven ? '#f8fafc' : '#ffffff';
            
            tocTableBody.push([
                { 
                    text: cat.toUpperCase(), 
                    style: 'tocTableItem', 
                    alignment: 'left',
                    fillColor: rowBg
                },
                { 
                    text: '', 
                    pageReference: `cat_group_${cat.replace(/[^a-z0-9]/gi, '_')}`, 
                    style: 'tocTablePage', 
                    alignment: 'right',
                    fillColor: rowBg
                }
            ]);
        });

        tocTableObj = {
            table: {
                headerRows: 1,
                widths: ['*', 60],
                body: tocTableBody,
                dontBreakRows: true
            },
            layout: {
                hLineWidth: function (i, node) { 
                    return (i === 0 || i === node.table.body.length || i === 1) ? 1 : 0.5; 
                },
                vLineWidth: function (i, node) { return 0; },
                hLineColor: function (i, node) { 
                    return (i === 0 || i === node.table.body.length || i === 1) ? config.themeColor : '#e2e8f0'; 
                },
                paddingLeft: function(i, node) { return 10; },
                paddingRight: function(i, node) { return 10; },
                paddingTop: function(i, node) { return 6; },
                paddingBottom: function(i, node) { return 6; }
            },
            margin: [0, 10, 0, 0]
        };
    }

    // Table Column Widths definition
    // Columns: Name, Unit, Price, [Disc, Nett]
    let columnsWidths = [];
    if (config.showDiscount) {
        // [Name, Unit, Price, Disc, Nett]
        columnsWidths = ['*', 'auto', 65, 50, 75];
    } else {
        // [Name, Unit, Price]
        columnsWidths = ['*', 60, 90];
    }

    // Build standard structure rows
    const tableBody = [];
    
    // 1. Build Header Row for pdfmake table
    const headerRow = [];
    headerRow.push({ text: 'Item Description', style: 'tableHeader', alignment: 'left' });
    if (!config.showDiscount) {
        headerRow.push({ text: 'Unit', style: 'tableHeader', alignment: 'center' });
        headerRow.push({ text: `Rate (${config.currency || 'Amt'})`, style: 'tableHeader', alignment: 'right' });
    } else {
        headerRow.push({ text: 'Unit', style: 'tableHeader', alignment: 'center' });
        headerRow.push({ text: `Rate (${config.currency || 'Amt'})`, style: 'tableHeader', alignment: 'right' });
        headerRow.push({ text: 'Disc %', style: 'tableHeader', alignment: 'right' });
        headerRow.push({ text: `Nett Rate (${config.currency || 'Amt'})`, style: 'tableHeader', alignment: 'right' });
    }
    tableBody.push(headerRow);

    // 2. Loop and fill items rows
    let lastCategory = null;
    let itemCount = 0;
    
    itemsToExport.forEach(item => {
        // Add Category Section Span Row if grouping enabled
        if (config.groupByCategory && item.group !== lastCategory) {
            lastCategory = item.group;
            
            const spanColumns = config.showDiscount ? 5 : 3;
            const catSpanRow = [];
            
            // colSpan cell
            catSpanRow.push({ 
                id: `cat_group_${item.group.replace(/[^a-z0-9]/gi, '_')}`,
                text: item.group.toUpperCase(), 
                colSpan: spanColumns, 
                style: 'categorySpanHeader',
                fillColor: config.themeLight
            });
            
            // Empty cells required to satisfy colspan size in pdfmake
            for (let c = 1; c < spanColumns; c++) {
                catSpanRow.push({});
            }
            tableBody.push(catSpanRow);
        }

        // Regular items cells formatting
        const itemRow = [];
        itemRow.push({ text: item.name, style: 'cellText', alignment: 'left' });
        
        if (!config.showDiscount) {
            itemRow.push({ text: item.unit, style: 'cellText', alignment: 'center' });
            itemRow.push({ text: item.price.toFixed(2), style: 'cellPrice', alignment: 'right' });
        } else {
            const discText = item.disc > 0 ? `${item.disc}%` : '-';
            itemRow.push({ text: item.unit, style: 'cellText', alignment: 'center' });
            itemRow.push({ text: item.price.toFixed(2), style: 'cellPrice', alignment: 'right' });
            itemRow.push({ text: discText, style: 'cellPrice', alignment: 'right' });
            itemRow.push({ text: item.nett.toFixed(2), style: 'cellNett', alignment: 'right' });
        }
        
        // Add item background shading if active
        if (config.altRows && itemCount % 2 === 0) {
            itemRow.forEach(cell => {
                if (Object.keys(cell).length > 0) {
                    cell.fillColor = '#f8fafc';
                }
            });
        }
        
        tableBody.push(itemRow);
        itemCount++;
    });

    // Build the Top Cover Header (ONLY on page 1)
    const pageHeaderNodes = [];
    
    // Create side-by-side header columns layout
    const headerCols = [];
    
    // Check if company logo base64 is present
    if (config.logoBase64) {
        headerCols.push({
            image: config.logoBase64,
            width: 80,
            alignment: 'left',
            margin: [0, 0, 0, 0] // Reset logo margin to prevent column bounds clipping
        });
    }

    const infoRows = [
        { text: parsedData.companyName.toUpperCase(), style: 'companyName' }
    ];

    if (parsedData.address) {
        infoRows.push({ text: parsedData.address, style: 'companyDetails' });
    } else {
        infoRows.push({ text: '25-26, Dr. Bhabha Marg, Near Private Bus Stand\nNeemuch (M.P.) - 07423-220808', style: 'companyDetails' });
    }

    // Vertically align and separate company name/description with/from the logo image
    const infoColMargin = config.logoBase64 ? [24, 8, 0, 0] : [0, 8, 0, 0];
    headerCols.push({
        stack: infoRows,
        width: '*',
        margin: infoColMargin
    });

    headerCols.push({
        stack: [
            { text: parsedData.documentTitle.toUpperCase(), style: 'documentTitle', alignment: 'right' },
            { text: `DATE: ${new Date().toLocaleDateString('en-GB')}`, style: 'dateStamp', alignment: 'right' },
            { text: `TOTAL ITEMS: ${itemsToExport.length}`, style: 'dateStamp', alignment: 'right' }
        ],
        width: 'auto',
        margin: [0, 12, 0, 0] // Adds top margin to vertically align the right block
    });

    pageHeaderNodes.push({
        columns: headerCols,
        margin: [0, 0, 0, 10]
    });

    // Decorative Primary accent line divider
    pageHeaderNodes.push({
        canvas: [
            {
                type: 'line',
                x1: 0, y1: 0,
                x2: 595 - (pageMargins[0] + pageMargins[2]), y2: 0, // dynamic fit to page width
                lineWidth: 2,
                lineColor: config.themeColor
            }
        ],
        margin: [0, 0, 0, 15]
    });

    // Unified Data Grid Table Definition
    const pdfTableObj = {
        table: {
            headerRows: 1,
            widths: columnsWidths,
            body: tableBody,
            dontBreakRows: true
        },
        layout: {
            hLineWidth: function (i, node) { 
                return (i === 0 || i === node.table.body.length || i === 1) ? 1.5 : 0.5; 
            },
            vLineWidth: function (i, node) { return 0; }, // No vertical borders for modern clean layout
            hLineColor: function (i, node) { 
                return (i === 0 || i === node.table.body.length || i === 1) ? config.themeColor : '#e2e8f0'; 
            },
            paddingLeft: function(i, node) { return 6; },
            paddingRight: function(i, node) { return 6; },
            paddingTop: function(i, node) { return 4; },
            paddingBottom: function(i, node) { return 4; }
        }
    };

    // PDF Make Document Configuration
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'portrait',
        pageMargins: pageMargins,
        
        content: [
            ...pageHeaderNodes,
            ...(config.showToc && config.groupByCategory && tocTableObj ? [
                { text: 'INDEX / TABLE OF CONTENTS', style: 'tocHeader', alignment: 'center' },
                tocTableObj,
                { text: '', pageBreak: 'after' }
            ] : []),
            pdfTableObj
        ],

        // Dynamic Header repeating info
        header: function(currentPage, pageCount, pageSize) {
            if (currentPage === 1) return null; // Cover page gets the main styled header
            return {
                margin: [pageMargins[0], 15, pageMargins[2], 0],
                columns: [
                    { text: parsedData.companyName, style: 'miniHeader', alignment: 'left' },
                    { text: `Page ${currentPage} of ${pageCount}`, style: 'miniHeader', alignment: 'right', color: '#000000' }
                ],
                canvas: [
                    {
                        type: 'line',
                        x1: pageMargins[0], y1: 22,
                        x2: 595 - pageMargins[2], y2: 22,
                        lineWidth: 0.5,
                        lineColor: '#cbd5e1'
                    }
                ]
            };
        },

        // Dynamic footer showing Page numbers of PDF pages
        footer: function(currentPage, pageCount) {
            return null;
        },

        styles: {
            tocHeader: {
                font: useFont,
                fontSize: 16,
                bold: true,
                color: config.themeColor,
                margin: [0, 10, 0, 15],
                alignment: 'center'
            },
            tocTableHeader: {
                font: useFont,
                fontSize: 9.5,
                bold: true,
                color: '#ffffff',
                fillColor: config.themeColor,
                margin: [0, 2, 0, 2]
            },
            tocTableItem: {
                font: useFont,
                fontSize: 9.5,
                bold: true,
                color: '#0f172a'
            },
            tocTablePage: {
                font: useFont,
                fontSize: 9.5,
                bold: true,
                color: config.themeColor
            },
            companyName: {
                font: useFont,
                fontSize: 22, // Scaled font size
                bold: true,
                color: config.themeColor
            },
            companyDetails: {
                font: useFont,
                fontSize: 9, // Scaled font size
                color: '#475569',
                margin: [0, 6, 0, 0], // Spaced out top margin
                lineHeight: 1.25 // More line spacing
            },
            documentTitle: {
                font: useFont,
                fontSize: 16, // Scaled font size
                bold: true,
                color: config.themeColor
            },
            dateStamp: {
                font: useFont,
                fontSize: 8.5,
                color: '#64748b',
                margin: [0, 3, 0, 0]
            },
            tableHeader: {
                fontSize: 9,
                bold: true,
                color: '#ffffff',
                fillColor: config.themeColor,
                margin: [0, 2, 0, 2]
            },
            categorySpanHeader: {
                fontSize: 9,
                bold: true,
                color: config.themeColor,
                margin: [0, 3, 0, 3]
            },
            cellText: {
                fontSize: 8.5
            },
            cellPrice: {
                fontSize: 8.5
            },
            cellNett: {
                fontSize: 8.5,
                bold: true
            },
            miniHeader: {
                font: useFont,
                fontSize: 8,
                color: '#000000'
            },
            footerText: {
                fontSize: 7.5,
                color: '#94a3b8'
            }
        },
        defaultStyle: {
            font: 'Roboto',
            lineHeight: 1.15
        }
    };

    try {
        const baseName = `${parsedData.companyName.replace(/[^a-z0-9]/gi, '_')}_PriceList`;
        const date = new Date();
        const day = date.getDate();
        const months = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];
        const monthName = months[date.getMonth()];
        const year = date.getFullYear();
        const dateSuffix = `-${day}-${monthName}-${year}`;
        const filename = `${baseName}${dateSuffix}.pdf`;
        
        pdfMake.createPdf(docDefinition).download(filename);
    } catch(err) {
        console.error('Pdf creation failed:', err);
        showToast('PDF compilation failed. See developer console.', 'danger');
    }
}

// Storage Safe Helpers
function getStorageItem(key, defaultValue) {
    try {
        return localStorage.getItem(key) || defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // Safe fail
    }
}

// -------------------------------------------------------------
// Light/Dark Theme management
// -------------------------------------------------------------
function initTheme() {
    const savedTheme = getStorageItem('app-theme', 'light');
    const body = document.body;
    const toggleIcon = document.getElementById('theme-toggle-icon');

    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (toggleIcon) {
            toggleIcon.setAttribute('data-lucide', 'sun');
        }
    } else {
        body.classList.remove('dark-theme');
        if (toggleIcon) {
            toggleIcon.setAttribute('data-lucide', 'moon');
        }
    }
    initLucideIcons();
}

function toggleTheme() {
    const body = document.body;
    const toggleIcon = document.getElementById('theme-toggle-icon');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        setStorageItem('app-theme', 'light');
        if (toggleIcon) {
            toggleIcon.setAttribute('data-lucide', 'moon');
        }
    } else {
        body.classList.add('dark-theme');
        setStorageItem('app-theme', 'dark');
        if (toggleIcon) {
            toggleIcon.setAttribute('data-lucide', 'sun');
        }
    }
    initLucideIcons();
}

// Auto-load default logo from SELogo.jpg
async function loadDefaultLogo() {
    try {
        const response = await fetch('./SELogo.jpg');
        if (!response.ok) {
            throw new Error(`Failed to fetch logo image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onloadend = () => {
                config.logoBase64 = reader.result;
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Could not auto-load SELogo.jpg default logo:', e);
    }
}

// Dynamic pre-load Space Grotesk fonts directly into pdfMake's virtual file system (vfs)
async function loadSpaceGroteskFonts() {
    try {
        const fetchFont = async (fileName) => {
            const response = await fetch(`./${fileName}`);
            if (!response.ok) throw new Error(`Failed to load font file: ${fileName}`);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(blob);
            });
        };

        const regBase64 = await fetchFont('SpaceGrotesk-Regular.ttf');
        const boldBase64 = await fetchFont('SpaceGrotesk-Bold.ttf');

        if (window.pdfMake) {
            if (!window.pdfMake.vfs) window.pdfMake.vfs = {};
            window.pdfMake.vfs['SpaceGrotesk-Regular.ttf'] = regBase64;
            window.pdfMake.vfs['SpaceGrotesk-Bold.ttf'] = boldBase64;
        }
    } catch (e) {
        console.warn('Could not pre-load Space Grotesk fonts:', e);
    }
}

