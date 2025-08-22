// WSN/WID Barcode Label Generator - Fixed Version
class BarcodeGenerator {
    constructor() {
        this.data = {};
        this.currentProduct = null;
        this.canvas = null;
        this.ctx = null;
        
        // Label dimensions for 5cm x 3cm at high resolution
        this.labelWidth = 600;  // Adjusted for better rendering
        this.labelHeight = 360; // Adjusted for better rendering
        
        console.log('Starting BarcodeGenerator initialization...');
        this.initializeData();
        this.initializeCanvas();
        this.setupEventListeners();
        console.log('BarcodeGenerator initialization complete');
    }

    initializeData() {
        // Sample data from the provided JSON
        this.data = {
            'WSN001': {
                WID: 'XIFKJOQ',
                FSN: 'BLBF5JCWCST3FVGY',
                ProductTitle: 'EVEREADY 10 W Round B22 LED Bulb',
                MRP: 199,
                FSP: 119,
                Vertical: 'bulb',
                Brand: 'EVEREADY'
            },
            'WSN002': {
                WID: 'XI4DS29',
                FSN: 'BLBDYGA8BFAHFZFU',
                ProductTitle: 'EVEREADY 7 W Standard B22 LED Bulb',
                MRP: 449,
                FSP: 426,
                Vertical: 'bulb',
                Brand: 'EVEREADY'
            },
            'WSN003': {
                WID: 'XIDPT7X',
                FSN: 'BLBGGZRM4S62HPNK',
                ProductTitle: 'Gold Medal 9 W Standard B22 LED Bulb',
                MRP: 168,
                FSP: 149,
                Vertical: 'bulb',
                Brand: 'Gold Medal'
            },
            'WSN004': {
                WID: 'XI42BUN',
                FSN: 'BLBEFYBHZFSEKZG8',
                ProductTitle: 'Syska Led Lights 9 W Standard B22 LED Bulb',  
                MRP: 359,
                FSP: 180,
                Vertical: 'bulb',
                Brand: 'Syska Led Lights'
            },
            'WSN005': {
                WID: 'XIDJ65V',
                FSN: 'ACCGH4GACGHGZ3FX',
                ProductTitle: 'Flipkart SmartBuy Back Cover for Oppo K10',
                MRP: 399,
                FSP: 249,
                Vertical: 'cases_covers',
                Brand: 'Flipkart SmartBuy'
            }
        };
        
        console.log('Data initialized with', Object.keys(this.data).length, 'products');
    }

    initializeCanvas() {
        this.canvas = document.getElementById('labelCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context!');
            return;
        }
        
        // Set canvas dimensions
        this.canvas.width = this.labelWidth;
        this.canvas.height = this.labelHeight;
        
        // Set display size (responsive)
        const maxDisplayWidth = 400;
        const displayWidth = Math.min(maxDisplayWidth, window.innerWidth - 100);
        const displayHeight = (displayWidth * this.labelHeight) / this.labelWidth;
        
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        
        // Enable high-quality rendering
        this.ctx.imageSmoothingEnabled = true;
        if (this.ctx.imageSmoothingQuality) {
            this.ctx.imageSmoothingQuality = 'high';
        }
        
        console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
    }

    setupEventListeners() {
        const codeInput = document.getElementById('codeInput');
        const generateBtn = document.getElementById('generateBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const printBtn = document.getElementById('printBtn');
        const suggestions = document.getElementById('suggestions');

        if (!codeInput || !generateBtn) {
            console.error('Required elements not found');
            return;
        }

        // Input handling
        codeInput.addEventListener('input', (e) => {
            const value = e.target.value.trim().toUpperCase();
            this.updateSuggestions(value);
            
            const isValid = value && this.findProduct(value);
            generateBtn.disabled = !isValid;
            
            if (isValid) {
                generateBtn.textContent = 'Generate Label';
            }
        });

        codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !generateBtn.disabled) {
                e.preventDefault();
                this.generateLabel();
            }
            this.handleSuggestionNavigation(e);
        });

        codeInput.addEventListener('focus', () => {
            const value = codeInput.value.trim().toUpperCase();
            if (value) {
                this.updateSuggestions(value);
            }
        });

        codeInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (suggestions) suggestions.style.display = 'none';
            }, 200);
        });

        // Generate button
        generateBtn.addEventListener('click', () => {
            this.generateLabel();
        });

        // Download button
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadLabel();
            });
        }

        // Print button
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printLabel();
            });
        }

        // File upload (simplified for now)
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.showStatus('File upload functionality available - files selected', 'info');
                }
            });
        }

        console.log('Event listeners setup complete');
    }

    findProduct(code) {
        if (!code) return null;
        
        // Direct WSN match
        if (this.data[code]) {
            return { wsn: code, ...this.data[code] };
        }
        
        // WID match
        for (const [wsn, product] of Object.entries(this.data)) {
            if (product.WID && product.WID.toUpperCase() === code) {
                return { wsn, ...product };
            }
        }
        
        return null;
    }

    updateSuggestions(query) {
        const suggestions = document.getElementById('suggestions');
        if (!suggestions || !query || query.length < 1) {
            if (suggestions) suggestions.style.display = 'none';
            return;
        }

        const matches = [];
        
        for (const [wsn, product] of Object.entries(this.data)) {
            if (wsn.includes(query) || 
                (product.WID && product.WID.toUpperCase().includes(query)) ||
                product.ProductTitle.toUpperCase().includes(query)) {
                matches.push({ wsn, ...product });
            }
        }

        if (matches.length === 0) {
            suggestions.style.display = 'none';
            return;
        }

        suggestions.innerHTML = matches.slice(0, 5).map(item => `
            <div class="suggestion-item" data-code="${item.wsn}">
                <div class="suggestion-code">${item.wsn} (${item.WID})</div>
                <div class="suggestion-title">${item.ProductTitle}</div>
            </div>
        `).join('');

        // Add click handlers
        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const code = item.dataset.code;
                document.getElementById('codeInput').value = code;
                document.getElementById('generateBtn').disabled = false;
                suggestions.style.display = 'none';
                
                // Auto-generate
                setTimeout(() => this.generateLabel(), 100);
            });
        });

        suggestions.style.display = 'block';
    }

    handleSuggestionNavigation(e) {
        const suggestions = document.getElementById('suggestions');
        if (!suggestions || suggestions.style.display === 'none') return;

        const items = suggestions.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        let current = suggestions.querySelector('.highlighted');
        let currentIndex = current ? Array.from(items).indexOf(current) : -1;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (current) current.classList.remove('highlighted');
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add('highlighted');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (current) current.classList.remove('highlighted');
            currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
            items[currentIndex].classList.add('highlighted');
        } else if (e.key === 'Enter' && current) {
            e.preventDefault();
            current.click();
        } else if (e.key === 'Escape') {
            suggestions.style.display = 'none';
        }
    }

    generateLabel() {
        const code = document.getElementById('codeInput').value.trim().toUpperCase();
        console.log('Generating label for:', code);

        if (!code) {
            this.showStatus('Please enter a WSN/WID code', 'error');
            return;
        }

        const product = this.findProduct(code);
        if (!product) {
            this.showStatus(`Product not found: ${code}`, 'error');
            return;
        }

        console.log('Found product:', product);
        this.currentProduct = product;

        try {
            // Draw the label
            this.drawLabel();
            
            // Update UI
            this.updateProductInfo();
            this.showLabelAndControls();
            
            this.showStatus('Label generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating label:', error);
            this.showStatus('Error generating label: ' + error.message, 'error');
        }
    }

    drawLabel() {
        if (!this.ctx || !this.currentProduct) {
            throw new Error('Canvas or product not available');
        }

        const ctx = this.ctx;
        const product = this.currentProduct;
        
        console.log('Drawing label...');

        // Clear with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, this.labelWidth, this.labelHeight);

        // Draw border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 5, this.labelWidth - 10, this.labelHeight - 10);

        // Set text properties
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000000';

        // Title
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.fillText('BARCODE LABEL', 20, 20);

        // MRP
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('MRP:', 20, 60);
        ctx.fillStyle = '#c0152f';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText(`₹${product.MRP}`, 80, 60);

        // FSP
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('FSP:', 200, 60);
        ctx.fillStyle = '#228b22';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText(`₹${product.FSP}`, 260, 60);

        // Vertical
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText('Vertical:', 20, 110);
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(product.Vertical.toUpperCase(), 110, 110);

        // Product Title
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.fillText('Product:', 20, 150);
        ctx.font = '14px Arial, sans-serif';
        
        // Word wrap for product title
        const maxWidth = this.labelWidth - 40;
        const words = product.ProductTitle.split(' ');
        let line = '';
        let y = 175;
        const lineHeight = 18;

        for (let word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line) {
                ctx.fillText(line, 20, y);
                line = word;
                y += lineHeight;
                if (y > 240) break; // Prevent overflow
            } else {
                line = testLine;
            }
        }
        if (line && y <= 240) {
            ctx.fillText(line, 20, y);
        }

        // Draw barcode area
        this.drawBarcode(ctx, product.FSN, this.labelWidth - 200, 80, 180, 60);

        // FSN
        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FSN:', this.labelWidth - 110, 150);
        ctx.font = '10px monospace';
        ctx.fillText(product.FSN, this.labelWidth - 110, 165);

        // Brand info
        ctx.textAlign = 'left';
        ctx.font = '12px Arial, sans-serif';
        ctx.fillText(`Brand: ${product.Brand}`, 20, this.labelHeight - 60);
        ctx.fillText(`WSN: ${product.wsn} | WID: ${product.WID}`, 20, this.labelHeight - 40);

        console.log('Label drawn successfully');
    }

    drawBarcode(ctx, data, x, y, width, height) {
        // Simple barcode representation
        ctx.fillStyle = '#000000';
        
        // Create a pattern based on the data
        const barCount = Math.min(data.length * 3, 60);
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
            // Create pattern based on character codes
            const charIndex = i % data.length;
            const charCode = data.charCodeAt(charIndex);
            
            if (charCode % 2 === 0 || (charCode % 3 === 0 && i % 2 === 0)) {
                const barHeight = (i % 3 === 0) ? height : height * 0.8;
                const barY = y + (height - barHeight) / 2;
                ctx.fillRect(x + (i * barWidth), barY, Math.max(1, barWidth * 0.8), barHeight);
            }
        }
    }

    updateProductInfo() {
        const product = this.currentProduct;
        const updates = {
            'wsnValue': product.wsn,
            'widValue': product.WID,
            'fsnValue': product.FSN,
            'brandValue': product.Brand,
            'mrpValue': `₹${product.MRP}`,
            'fspValue': `₹${product.FSP}`
        };

        for (const [id, value] of Object.entries(updates)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }

    showLabelAndControls() {
        // Show canvas
        const canvas = document.getElementById('labelCanvas');
        if (canvas) {
            canvas.style.display = 'block';
        }

        // Hide placeholder
        const placeholder = document.querySelector('.placeholder-content');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Show action buttons
        const labelActions = document.getElementById('labelActions');
        if (labelActions) {
            labelActions.style.display = 'flex';
        }

        // Show product info
        const productInfo = document.getElementById('productInfo');
        if (productInfo) {
            productInfo.style.display = 'block';
        }
    }

    downloadLabel() {
        if (!this.canvas || !this.currentProduct) {
            this.showStatus('No label to download', 'error');
            return;
        }

        try {
            const link = document.createElement('a');
            link.download = `barcode_label_${this.currentProduct.wsn}_${Date.now()}.png`;
            link.href = this.canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showStatus('Label downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showStatus('Error downloading label', 'error');
        }
    }

    printLabel() {
        if (!this.currentProduct) {
            this.showStatus('No label to print', 'error');
            return;
        }

        try {
            window.print();
            this.showStatus('Opening print dialog...', 'info');
        } catch (error) {
            this.showStatus('Error opening print dialog', 'error');
        }
    }

    showStatus(message, type = 'info') {
        console.log(`Status [${type}]:`, message);
        
        const statusEl = document.getElementById('statusMessage');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `status-message ${type} show`;

        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 4000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Barcode Generator...');
    try {
        window.barcodeApp = new BarcodeGenerator();
        console.log('✓ Barcode Generator initialized successfully');
    } catch (error) {
        console.error('✗ Failed to initialize:', error);
    }
});