let designState = {
    type: null,
    premadeDesign: null,
    frontLogos: [], // Array of { id, imageData, size, x, y }
    backNumber: '00',
    backNumberSize: 100,
    backNumberX: 0,
    backNumberY: 0,
    backNumberColor: '#ffffff',
    backName: 'Sample Name',
    backNameSize: 100,
    backNameX: 0,
    backNameY: 0,
    backNameColor: '#ffffff',
    currentView: 'front' // 'front' or 'back'
};

function openDesignModal() {
    const modal = document.getElementById('designModal');
    if (modal) {
        modal.classList.add('active');
        console.log('Modal opened');
    } else {
        console.error('Modal element not found');
    }
}

function selectDesignType(type) {
    console.log('selectDesignType called with type:', type);
    designState.type = type;
    
    const modal = document.getElementById('designModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    if (type === 'custom') {
        const customSection = document.getElementById('customDesignSection');
        if (customSection) {
            customSection.classList.remove('hidden');
            console.log('Custom design section shown');
        } else {
            console.error('customDesignSection not found');
        }
    } else if (type === 'premade') {
        const premadeSection = document.getElementById('premadeDesignSection');
        if (premadeSection) {
            premadeSection.classList.remove('hidden');
            console.log('Premade design section shown');
        } else {
            console.error('premadeDesignSection not found');
        }
    }
}

function selectPremadeDesign(designFilename, color) {
    // Extract the design name from the image filename (e.g., 'cr2000.webp' -> 'cr2000')
    const designName = designFilename.split('/').pop().split('.')[0];
    designState.premadeDesign = { name: designName, color, filename: designFilename };
    
    document.querySelectorAll('.design-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // Replace the SVG with an image of the actual jersey
    const previewContainer = document.querySelector('#premadeJerseyPreview').parentElement;
    const newImage = document.createElement('img');
    newImage.src = designFilename;
    newImage.alt = 'Selected Jersey Design';
    newImage.style.maxWidth = '300px';
    newImage.style.width = '100%';
    newImage.style.height = 'auto';
    newImage.id = 'selectedJerseyImage';
    
    const oldSvg = document.getElementById('premadeJerseyPreview');
    if (oldSvg) {
        oldSvg.replaceWith(newImage);
    }
    
    // Scroll to the front design customization area
    const premadeFrontDesignContent = document.getElementById('premadeFrontDesignContent');
    if (premadeFrontDesignContent) {
        premadeFrontDesignContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function handleMultipleLogosUpload(event, type) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Process each file
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoId = Date.now() + index;
            const logoObject = {
                id: logoId,
                imageData: e.target.result,
                size: 50,
                x: 0,
                y: 0
            };
            
            designState.frontLogos.push(logoObject);
            renderLogoControls(type);
            redrawDesignPreview(type);
        };
        reader.readAsDataURL(file);
    });
    
    // Reset file input
    event.target.value = '';
}

function renderLogoControls(type) {
    const containerId = type === 'custom' ? 'customFrontLogosContainer' : 'premadeFrontLogosContainer';
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!designState.frontLogos || designState.frontLogos.length === 0) return;
    
    designState.frontLogos.forEach((logo, index) => {
        const logoCard = document.createElement('div');
        logoCard.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        logoCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0;">Logo ${index + 1}</h4>
                <button type="button" onclick="removeLogoAtIndex(${index}, '${type}')" style="background: #ff4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Remove</button>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-start;">
                <img src="${logo.imageData}" style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 2px solid #ddd;">
                <div style="flex: 1;">
                    <h4>Logo Size</h4>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="min-width: 40px;">Small</span>
                        <input type="range" min="20" max="100" value="${logo.size}" style="flex: 1;" oninput="updateLogoSizeAtIndex(${index}, this.value, '${type}')">
                        <span style="min-width: 40px;">Large</span>
                        <span style="min-width: 30px;">${logo.size}%</span>
                    </div>
                </div>
            </div>
            
            <h4>Logo Position - Horizontal</h4>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <span style="min-width: 40px;">Left</span>
                <input type="range" min="-200" max="50" value="${logo.x}" style="flex: 1;" oninput="updateLogoXAtIndex(${index}, this.value, '${type}')">
                <span style="min-width: 40px;">Right</span>
                <span style="min-width: 30px;">${logo.x}</span>
            </div>
            
            <h4>Logo Position - Vertical</h4>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="min-width: 40px;">Up</span>
                <input type="range" min="-50" max="350" value="${logo.y}" style="flex: 1;" oninput="updateLogoYAtIndex(${index}, this.value, '${type}')">
                <span style="min-width: 40px;">Down</span>
                <span style="min-width: 30px;">${logo.y}</span>
            </div>
        `;
        
        container.appendChild(logoCard);
    });
}

function removeLogoAtIndex(index, type) {
    if (designState.frontLogos && designState.frontLogos.length > index) {
        designState.frontLogos.splice(index, 1);
        renderLogoControls(type);
        redrawDesignPreview(type);
    }
}

function updateLogoSizeAtIndex(index, size, type) {
    if (designState.frontLogos && designState.frontLogos[index]) {
        designState.frontLogos[index].size = parseInt(size);
        redrawDesignPreview(type);
    }
}

function updateLogoXAtIndex(index, x, type) {
    if (designState.frontLogos && designState.frontLogos[index]) {
        designState.frontLogos[index].x = parseInt(x);
        redrawDesignPreview(type);
    }
}

function updateLogoYAtIndex(index, y, type) {
    if (designState.frontLogos && designState.frontLogos[index]) {
        designState.frontLogos[index].y = parseInt(y);
        redrawDesignPreview(type);
    }
}

function handleLogoUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            designState.frontLogo = e.target.result;
            redrawDesignPreview(type === 'front' ? 'custom' : 'premade');
        };
        reader.readAsDataURL(file);
    }
}

function redrawDesignPreview(type = null) {
    // Skip if no logos are added
    if (!designState.frontLogos || designState.frontLogos.length === 0) return;
    
    const currentType = type || designState.type;
    
    if (currentType === 'premade') {
        const jerseyImage = document.getElementById('selectedJerseyImage');
        if (jerseyImage && designState.premadeDesign) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Draw all logos
                let logosLoaded = 0;
                designState.frontLogos.forEach(logoData => {
                    const logo = new Image();
                    logo.onload = function() {
                        logosLoaded++;
                        
                        // Base logo size (diameter of circle in pixels)
                        const baseLogoSize = 80;
                        const logoSize = (logoData.size / 50) * baseLogoSize;
                        
                        // Position: top-right corner of jersey with manual adjustments
                        const baseX = 170;
                        const baseY = 20;
                        const x = baseX + (logoData.x / 50) * 30;
                        const y = baseY + (logoData.y / 50) * 30;
                        
                        // Create circular clipping and draw with aspect ratio maintained
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
                        ctx.clip();
                        // Draw image centered within the circular area, maintaining aspect ratio
                        ctx.drawImage(logo, x, y, logoSize, logoSize);
                        ctx.restore();
                        
                        // Update image only after all logos are loaded
                        if (logosLoaded === designState.frontLogos.length) {
                            jerseyImage.src = canvas.toDataURL();
                        }
                    };
                    logo.src = logoData.imageData;
                });
            };
            img.src = designState.premadeDesign.filename;
        }
    } else if (currentType === 'custom') {
        const previewSvg = document.getElementById('jerseyPreview');
        // Remove all existing logos
        previewSvg.querySelectorAll('[id^="uploadedLogo"]').forEach(el => el.remove());
        
        // Draw all logos
        let logosLoaded = 0;
        designState.frontLogos.forEach((logoData, logoIndex) => {
            const logo = new Image();
            logo.onload = function() {
                logosLoaded++;
                
                // Base size: 60px diameter
                const baseLogoSize = 60;
                const logoSize = (logoData.size / 50) * baseLogoSize;
                
                // Create circular logo with maintained aspect ratio
                const logoCanvas = document.createElement('canvas');
                const logoCtx = logoCanvas.getContext('2d');
                logoCanvas.width = logoSize;
                logoCanvas.height = logoSize;
                
                // Create circle clipping path
                logoCtx.beginPath();
                logoCtx.arc(logoSize / 2, logoSize / 2, logoSize / 2, 0, Math.PI * 2);
                logoCtx.clip();
                
                // Draw image maintaining aspect ratio within circle
                logoCtx.drawImage(logo, 0, 0, logoSize, logoSize);
                
                // Position: top-right of jersey SVG with manual adjustments
                const baseX = 240 - logoSize / 2;
                const baseY = 25;
                const x = baseX + (logoData.x / 50) * 15;
                const y = baseY + (logoData.y / 50) * 15;
                
                const logoImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                logoImage.setAttribute('id', `uploadedLogo${logoIndex}`);
                logoImage.setAttribute('href', logoCanvas.toDataURL());
                logoImage.setAttribute('x', `${x}`);
                logoImage.setAttribute('y', `${y}`);
                logoImage.setAttribute('width', `${logoSize}`);
                logoImage.setAttribute('height', `${logoSize}`);
                logoImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                
                previewSvg.appendChild(logoImage);
                
                // Update placeholder text only after all logos are loaded
                if (logosLoaded === designState.frontLogos.length) {
                    const placeholderTexts = previewSvg.querySelectorAll('text');
                    placeholderTexts.forEach(text => {
                        if (text.textContent === 'Front Logo') {
                            text.style.display = 'none';
                        }
                    });
                }
            };
            logo.src = logoData.imageData;
        });
    }
}

function updateBackNumber(value) {
    // Pad single digit numbers with leading zero
    const paddedValue = String(value).padStart(2, '0');
    designState.backNumber = paddedValue;
    
    // Update all number inputs to show the padded value
    document.querySelectorAll('#backNumberInput, #premadeBackNumberInput').forEach(input => {
        input.value = paddedValue;
    });
    
    redrawBackPreview();
}

function updateBackNumberSize(value) {
    designState.backNumberSize = value;
    document.querySelectorAll('#backNumberSizeSlider, #premadeBackNumberSizeSlider').forEach(el => el.value = value);
    document.querySelectorAll('#backNumberSizeValue, #premadeBackNumberSizeValue').forEach(el => el.textContent = value + '%');
    redrawBackPreview();
}

function updateBackNumberX(value) {
    designState.backNumberX = value;
    document.querySelectorAll('#backNumberXValue').forEach(el => el.textContent = value);
    document.querySelectorAll('#backNumberXSlider').forEach(el => el.value = value);
    redrawBackPreview();
}

function updateBackNumberY(value) {
    designState.backNumberY = value;
    document.querySelectorAll('#backNumberYValue').forEach(el => el.textContent = value);
    document.querySelectorAll('#backNumberYSlider').forEach(el => el.value = value);
    redrawBackPreview();
}

function updateBackNumberColor(color) {
    designState.backNumberColor = color;
    redrawBackPreview();
}

function updateBackName(value) {
    designState.backName = value || 'Sample Name';
    redrawBackPreview();
}

function updateBackNameSize(value) {
    designState.backNameSize = value;
    document.querySelectorAll('#backNameSizeSlider, #premadeBackNameSizeSlider').forEach(el => el.value = value);
    document.querySelectorAll('#backNameSizeValue, #premadeBackNameSizeValue').forEach(el => el.textContent = value + '%');
    redrawBackPreview();
}

function updateBackNameX(value) {
    designState.backNameX = value;
    document.querySelectorAll('#backNameXValue').forEach(el => el.textContent = value);
    document.querySelectorAll('#backNameXSlider').forEach(el => el.value = value);
    redrawBackPreview();
}

function updateBackNameY(value) {
    designState.backNameY = value;
    document.querySelectorAll('#backNameYValue').forEach(el => el.textContent = value);
    document.querySelectorAll('#backNameYSlider').forEach(el => el.value = value);
    redrawBackPreview();
}

function updateBackNameColor(color) {
    designState.backNameColor = color;
    redrawBackPreview();
}

function editBack() {
    designState.currentView = 'back';
    
    // Hide front, show back for both custom and premade
    const customFront = document.getElementById('frontDesignContent');
    const customBack = document.getElementById('backDesignContent');
    const premadeFront = document.getElementById('premadeFrontDesignContent');
    const premadeBack = document.getElementById('premadeBackDesignContent');
    
    if (customFront) customFront.classList.add('hidden');
    if (customBack) customBack.classList.remove('hidden');
    if (premadeFront) premadeFront.classList.add('hidden');
    if (premadeBack) premadeBack.classList.remove('hidden');
    
    redrawBackPreview();
}

function editFront() {
    designState.currentView = 'front';
    
    // Show front, hide back for both custom and premade
    const customFront = document.getElementById('frontDesignContent');
    const customBack = document.getElementById('backDesignContent');
    const premadeFront = document.getElementById('premadeFrontDesignContent');
    const premadeBack = document.getElementById('premadeBackDesignContent');
    
    if (customFront) customFront.classList.remove('hidden');
    if (customBack) customBack.classList.add('hidden');
    if (premadeFront) premadeFront.classList.remove('hidden');
    if (premadeBack) premadeBack.classList.add('hidden');
}

function redrawBackPreview() {
    // Update back number display
    const backNumberElements = document.querySelectorAll('[data-role="backNumber"]');
    backNumberElements.forEach(el => {
        el.textContent = designState.backNumber;
        el.style.color = designState.backNumberColor;
        el.style.fontSize = `${designState.backNumberSize}%`;
        el.style.transform = `translate(${(designState.backNumberX / 50) * 30}px, ${(designState.backNumberY / 50) * 30}px)`;
    });
    
    // Update back name display
    const backNameElements = document.querySelectorAll('[data-role="backName"]');
    backNameElements.forEach(el => {
        el.textContent = designState.backName.toUpperCase();
        el.style.color = designState.backNameColor;
        el.style.fontSize = `${designState.backNameSize}%`;
        el.style.transform = `translate(${(designState.backNameX / 50) * 30}px, ${(designState.backNameY / 50) * 30}px)`;
    });
}

function proceedToOrder() {
    if (designState.type === 'premade' && !designState.premadeDesign) {
        alert('Please select a pre-made design first');
        return;
    }
    
    document.getElementById('customDesignSection').classList.add('hidden');
    document.getElementById('premadeDesignSection').classList.add('hidden');
    document.getElementById('orderFormSection').classList.remove('hidden');
}

function submitOrder() {
    const phone = document.getElementById('orderPhone').value;
    const email = document.getElementById('orderEmail').value;
    const shirtQty = document.getElementById('shirtQuantity').value;
    const shirtSizes = document.getElementById('shirtSizes').value;
    
    if (!phone || !email || !shirtQty || !shirtSizes) {
        alert('Please fill in all required fields');
        return;
    }
    
    alert('Thank you for your order! We will contact you shortly to confirm your custom jersey design and finalize the details.');
    
    setTimeout(() => {
        window.location.href = 'products.html';
        resetDesignState();
    }, 2000);
}

// Initialize EmailJS when DOM is ready
// Initialize EmailJS when DOM is ready
const EMAILJS_SERVICE_ID = 'service_gzzje7c';
const EMAILJS_TEMPLATE_ID = 'template_jjavxzf';
let emailjsInitialized = false;

// Try to initialize EmailJS with retries
function initializeEmailJS() {
    if (typeof emailjs !== 'undefined' && !emailjsInitialized) {
        try {
            emailjs.init('Pqse8h-LaxFgSW1SH');
            emailjsInitialized = true;
            console.log('✓ EmailJS initialized successfully');
            return true;
        } catch (e) {
            console.error('Error initializing EmailJS:', e);
        }
    } else if (typeof emailjs === 'undefined') {
        console.log('⏳ EmailJS not available yet, will retry...');
    } else {
        console.log('✓ EmailJS already initialized');
        emailjsInitialized = true;
        return true;
    }
    return false;
}

// Try to init immediately
initializeEmailJS();

// Try to init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEmailJS();
    // Retry with increasing delays
    setTimeout(initializeEmailJS, 300);
    setTimeout(initializeEmailJS, 800);
    setTimeout(initializeEmailJS, 1500);
    
    // Setup logo upload handler for quote form
    const quoteLogoUpload = document.getElementById('quoteLogoUpload');
    if (quoteLogoUpload) {
        quoteLogoUpload.addEventListener('change', handleQuoteLogoUpload);
    }
});

// Handle logo uploads for quote form
function handleQuoteLogoUpload(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('quoteLogoPreviewContainer');
    const uploadedLogosData = document.getElementById('uploadedLogosData');
    
    if (!previewContainer) return;
    
    previewContainer.innerHTML = ''; // Clear previous previews
    const logoArray = [];
    let filesProcessed = 0;
    
    if (files.length === 0) {
        uploadedLogosData.value = '[]';
        return;
    }
    
    Array.from(files).forEach((file, fileIndex) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Data = e.target.result;
            const logoId = `logo-${Date.now()}-${Math.random()}`; // Unique ID for each logo
            console.log(`[LOGO UPLOAD] File ${fileIndex + 1}: ${file.name}, base64 length: ${base64Data.length}`);
            logoArray.push({
                id: logoId,
                name: file.name,
                data: base64Data
            });
            
            // Create preview
            const previewDiv = document.createElement('div');
            previewDiv.style.position = 'relative';
            previewDiv.style.width = '80px';
            previewDiv.style.height = '80px';
            previewDiv.style.border = '2px solid #ddd';
            previewDiv.style.borderRadius = '4px';
            previewDiv.style.overflow = 'hidden';
            previewDiv.style.cursor = 'pointer';
            previewDiv.dataset.logoId = logoId;
            
            const img = document.createElement('img');
            img.src = base64Data;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.style.position = 'absolute';
            removeBtn.style.top = '2px';
            removeBtn.style.right = '2px';
            removeBtn.style.background = 'rgba(255,0,0,0.7)';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '50%';
            removeBtn.style.width = '20px';
            removeBtn.style.height = '20px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.padding = '0';
            removeBtn.style.fontSize = '14px';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                previewDiv.remove();
                // Remove the specific logo from the array by ID
                const indexToRemove = logoArray.findIndex(l => l.id === logoId);
                if (indexToRemove > -1) {
                    logoArray.splice(indexToRemove, 1);
                    console.log(`[LOGO UPLOAD] Removed logo ${logoId}. Remaining: ${logoArray.length}`);
                }
                uploadedLogosData.value = JSON.stringify(logoArray.map(l => ({ name: l.name, data: l.data })));
            };
            
            previewDiv.appendChild(img);
            previewDiv.appendChild(removeBtn);
            previewContainer.appendChild(previewDiv);
            
            filesProcessed++;
            if (filesProcessed === files.length) {
                // Store without the ID field (backend doesn't need it)
                uploadedLogosData.value = JSON.stringify(logoArray.map(l => ({ name: l.name, data: l.data })));
                console.log(`[LOGO UPLOAD] ✓ All ${logoArray.length} files processed and stored in textarea`);
                console.log(`[LOGO UPLOAD] textarea ID: ${uploadedLogosData.id}, value length: ${uploadedLogosData.value.length}`);
            }
        };
        reader.readAsDataURL(file);
    });
}

// Also add a fallback that checks when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEmailJS);
} else {
    initializeEmailJS();
}

function prepareOrderSubmission(event) {
    event.preventDefault();
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Event target:', event.target);
    console.log('Event target type:', event.target.tagName);
    console.log('Order form section visible:', !document.getElementById('orderFormSection').classList.contains('hidden'));
    
    // Try to init EmailJS one more time before submission
    if (!emailjsInitialized) {
        initializeEmailJS();
    }
    
    // Validate required fields (only phone and email)
    const phone = document.getElementById('orderPhone').value;
    const email = document.getElementById('orderEmail').value;
    
    console.log('Phone:', phone ? '✓' : '✗');
    console.log('Email:', email ? '✓' : '✗');
    
    if (!phone || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Show loading message
    const submitBtn = event.target.querySelector('button[type="submit"]') || event.target;
    console.log('Submit button:', submitBtn);
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    // Capture both front and back jersey designs
    captureBothDesignViews().then(() => {
        const frontImageData = capturedDesignData.frontImage;
        const backImageData = capturedDesignData.backImage;
        const designData = capturedDesignData.designData;
        
        console.log('Design capture complete, storing in localStorage...');
        console.log('Front image data to store:', capturedDesignData.frontImage ? 'exists, length=' + capturedDesignData.frontImage.length : 'null');
        console.log('Back image data to store:', capturedDesignData.backImage ? 'exists, length=' + capturedDesignData.backImage.length : 'null');
        
        // Store design images in localStorage for display on confirmation
        try {
            if (capturedDesignData.frontImage) {
                localStorage.setItem('orderFrontDesign', capturedDesignData.frontImage);
                console.log('✓ Front image stored in localStorage');
            } else {
                console.error('❌ Front image is null or undefined');
            }
            if (capturedDesignData.backImage) {
                localStorage.setItem('orderBackDesign', capturedDesignData.backImage);
                console.log('✓ Back image stored in localStorage');
            } else {
                localStorage.setItem('orderBackDesign', 'Not captured');
                console.log('✓ Back image marked as not captured');
            }
        } catch (e) {
            console.error('Error storing designs in localStorage:', e);
        }
        
        // Try to send email via backend
        console.log('Attempting to send order via backend...');
        
        // Prepare quote data to send to backend (only contact info + design)
        const uploadedLogosElement = document.getElementById('uploadedLogosData');
        const uploadedLogos = uploadedLogosElement ? uploadedLogosElement.value : '[]';
        
        console.log('\n===== 📋 FORM SUBMISSION DEBUG =====');
        console.log('[FORM] uploadedLogosElement exists?', !!uploadedLogosElement);
        console.log('[FORM] uploadedLogosElement.id:', uploadedLogosElement ? uploadedLogosElement.id : 'N/A');
        console.log('[FORM] Raw uploadedLogosData value:', uploadedLogos);
        console.log('[FORM] uploadedLogosData is empty string?', uploadedLogos === '');
        console.log('[FORM] uploadedLogosData equals "[]"?', uploadedLogos === '[]');
        console.log('[FORM] uploadedLogosData length:', uploadedLogos.length);
        
        // Try to parse it to see what we have
        try {
            const parsedLogos = JSON.parse(uploadedLogos);
            console.log('[FORM] ✓ Parsed logos array length:', parsedLogos.length);
            if (parsedLogos.length > 0) {
                console.log('[FORM] Parsed logos:', parsedLogos.map(l => ({ name: l.name, hasData: !!l.data, dataLength: l.data ? l.data.length : 0 })));
            }
        } catch (e) {
            console.error('[FORM] ❌ Failed to parse uploadedLogos:', e);
        }
        
        const orderDataForBackend = {
            phone: phone,
            email: email,
            designData: designData,
            uploadedLogos: uploadedLogos,
            designModifications: document.getElementById('designModifications').value,
            // Send combined design screenshot as the backend expects it
            designScreenshot: 'FRONT_VIEW:\n' + (capturedDesignData.frontImage || '') + '\n\nBACK_VIEW:\n' + (capturedDesignData.backImage || '')
        };
        
        console.log('[FORM] About to send to backend with uploadedLogos length:', orderDataForBackend.uploadedLogos.length);
        console.log('[FORM] Design modifications:', orderDataForBackend.designModifications || 'None');
        console.log('[FORM] First 100 chars of uploadedLogos:', orderDataForBackend.uploadedLogos.substring(0, 100));
        
        // Try to send to backend on Vercel (or localhost for development)
        const backendUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3001/api/order'
            : 'https://haider-cricket-backend.vercel.app/api/order';
        
        fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderDataForBackend)
        })
            .then(response => response.json())
            .then(data => {
                console.log('[FETCH] ✓ Backend response received:', data);
                if (data.success) {
                    console.log('[FETCH] ✓ Order sent to backend successfully');
                    completeOrderSubmission(email, submitBtn, originalText, false);
                } else {
                    console.error('[FETCH] Backend returned error:', data.message);
                    completeOrderSubmission(email, submitBtn, originalText, true);
                }
            })
            .catch(error => {
                console.error('[FETCH] ❌ Error sending to backend:', error);
                console.log('[FETCH] Backend not available, but order is saved locally');
                // Still proceed even if backend is down
                completeOrderSubmission(email, submitBtn, originalText, true);
            });
        
    }).catch(error => {
        console.error('Error capturing design:', error);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Error capturing design. Please try again.');
    });
}

function completeOrderSubmission(email, submitBtn, originalText, skipEmail = false) {
    const message = skipEmail 
        ? 'Thank you for your order! Your design has been saved. We will contact you shortly.'
        : 'Thank you for your order! We will contact you shortly to confirm your custom jersey design.';
    
    alert(message);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    // Reset form
    document.getElementById('orderForm').reset();
    
    // Store order info and redirect after 2 seconds
    localStorage.setItem('lastOrderEmail', email);
    setTimeout(() => {
        window.location.href = 'order-confirmation.html';
        resetDesignState();
    }, 2000);
}

let capturedDesignData = {
    frontImage: null,
    backImage: null,
    designData: null
};

function captureBothDesignViews() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Starting capture process for type:', designState.type);
            
            if (typeof html2canvas === 'undefined') {
                console.error('html2canvas library not loaded');
                reject(new Error('html2canvas library not loaded'));
                return;
            }

            // For premade designs, capture the actual jersey preview images
            if (designState.type === 'premade') {
                // The selected premade design is stored with ID 'selectedJerseyImage'
                const frontImage = document.getElementById('selectedJerseyImage');
                const backContainer = document.getElementById('premadeBackDesignContent');
                
                if (!frontImage) {
                    console.error('Selected jersey image not found');
                    reject(new Error('Selected jersey image not found'));
                    return;
                }
                
                if (!backContainer) {
                    console.error('Back container not found');
                    reject(new Error('Back container not found'));
                    return;
                }

                console.log('Capturing premade front image...');
                
                // Create a wrapper div to capture the entire front view
                const frontWrapper = document.createElement('div');
                frontWrapper.style.display = 'inline-block';
                frontWrapper.appendChild(frontImage.cloneNode(true));
                document.body.appendChild(frontWrapper);
                
                // Capture front image directly
                html2canvas(frontWrapper, {
                    backgroundColor: 'transparent',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                }).then(frontCanvas => {
                    console.log('Front captured successfully');
                    const frontDataUrl = frontCanvas.toDataURL('image/png');
                    console.log('Front image data length:', frontDataUrl.length);
                    capturedDesignData.frontImage = frontDataUrl;
                    document.body.removeChild(frontWrapper);

                    // Now capture back view
                    console.log('Capturing premade back view...');
                    const backWasHidden = backContainer.classList.contains('hidden');
                    if (backWasHidden) {
                        backContainer.classList.remove('hidden');
                        backContainer.style.display = 'block';
                        backContainer.style.visibility = 'visible';
                    }

                    // Wait for DOM to update
                    setTimeout(() => {
                        try {
                            // Capture the entire back container (image + text overlays)
                            const backPreviewContainer = backContainer.querySelector('.jersey-preview');
                            if (backPreviewContainer) {
                                const backWrapper = document.createElement('div');
                                backWrapper.style.display = 'inline-block';
                                backWrapper.style.width = '300px';
                                backWrapper.style.position = 'relative';
                                
                                // Clone the entire preview container which includes the image and text overlays
                                backWrapper.appendChild(backPreviewContainer.cloneNode(true));
                                document.body.appendChild(backWrapper);

                                html2canvas(backWrapper, {
                                    backgroundColor: 'transparent',
                                    scale: 2,
                                    useCORS: true,
                                    allowTaint: true
                                }).then(backCanvas => {
                                    console.log('Back captured successfully');
                                    const backDataUrl = backCanvas.toDataURL('image/png');
                                    capturedDesignData.backImage = backDataUrl;
                                    document.body.removeChild(backWrapper);

                                    // Prepare design data summary
                                    const designDataSummary = prepareDesignData();
                                    capturedDesignData.designData = designDataSummary;

                                    // Hide back view again if it was hidden
                                    if (backWasHidden) {
                                        backContainer.classList.add('hidden');
                                    }

                                    console.log('Both views captured successfully');
                                    resolve();
                                }).catch(err => {
                                    console.error('Error capturing back view:', err);
                                    if (document.body.contains(backWrapper)) {
                                        document.body.removeChild(backWrapper);
                                    }
                                    if (backWasHidden) {
                                        backContainer.classList.add('hidden');
                                    }
                                    reject(err);
                                });
                            } else {
                                reject(new Error('Back preview container not found'));
                            }
                        } catch (e) {
                            console.error('Error in back capture try block:', e);
                            if (backWasHidden) {
                                backContainer.classList.add('hidden');
                            }
                            reject(e);
                        }
                    }, 300);

                }).catch(err => {
                    console.error('Error capturing front view:', err);
                    if (document.body.contains(frontWrapper)) {
                        document.body.removeChild(frontWrapper);
                    }
                    reject(err);
                });

            } else if (designState.type === 'custom') {
                // For custom designs, capture the SVG elements
                const frontContainer = document.getElementById('frontDesignContent');
                const backContainer = document.getElementById('backDesignContent');
                
                if (!frontContainer || !backContainer) {
                    reject(new Error('Design containers not found'));
                    return;
                }

                const frontWasHidden = frontContainer.classList.contains('hidden');
                if (frontWasHidden) {
                    frontContainer.classList.remove('hidden');
                }

                html2canvas(frontContainer, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                }).then(frontCanvas => {
                    console.log('Front captured successfully');
                    capturedDesignData.frontImage = frontCanvas.toDataURL('image/png');

                    if (frontWasHidden) {
                        frontContainer.classList.add('hidden');
                    }

                    const backWasHidden = backContainer.classList.contains('hidden');
                    if (backWasHidden) {
                        backContainer.classList.remove('hidden');
                        backContainer.style.display = 'block';
                    }

                    setTimeout(() => {
                        html2canvas(backContainer, {
                            backgroundColor: '#ffffff',
                            scale: 2,
                            useCORS: true,
                            allowTaint: true
                        }).then(backCanvas => {
                            console.log('Back captured successfully');
                            capturedDesignData.backImage = backCanvas.toDataURL('image/png');
                            const designDataSummary = prepareDesignData();
                            capturedDesignData.designData = designDataSummary;

                            if (backWasHidden) {
                                backContainer.classList.add('hidden');
                            }

                            console.log('Both views captured successfully');
                            resolve();
                        }).catch(err => {
                            console.error('Error capturing back view:', err);
                            if (backWasHidden) {
                                backContainer.classList.add('hidden');
                            }
                            reject(err);
                        });
                    }, 300);
                }).catch(err => {
                    console.error('Error capturing front view:', err);
                    if (frontWasHidden) {
                        frontContainer.classList.add('hidden');
                    }
                    reject(err);
                });

            } else {
                reject(new Error('Unknown design type'));
            }

        } catch (e) {
            console.error('Capture error:', e);
            reject(e);
        }
    });
}

function prepareDesignData() {
    // Create a summary of the design customizations
    const summary = {
        designType: designState.type,
        currentView: designState.currentView,
        premadeDesign: designState.premadeDesign?.name || 'Custom',
        frontLogos: designState.frontLogos.length,
        backNumber: designState.backNumber,
        backNumberSize: designState.backNumberSize,
        backNumberColor: designState.backNumberColor,
        backNumberX: designState.backNumberX,
        backNumberY: designState.backNumberY,
        backName: designState.backName,
        backNameSize: designState.backNameSize,
        backNameColor: designState.backNameColor,
        backNameX: designState.backNameX,
        backNameY: designState.backNameY
    };
    
    return JSON.stringify(summary, null, 2);
}

function resetDesignState() {
    designState = {
        type: null,
        premadeDesign: null,
        frontLogo: null,
        backNumber: '00',
        backNumberX: 0,
        backNumberY: 0,
        backNumberColor: '#ffffff',
        backName: '',
        backNameX: 0,
        backNameY: 0,
        backNameColor: '#ffffff',
        logoSize: 50,
        logoX: 0,
        logoY: 0,
        currentView: 'front'
    };
}

function closeDesignSection() {
    document.getElementById('customDesignSection').classList.add('hidden');
    document.getElementById('premadeDesignSection').classList.add('hidden');
    document.getElementById('designModal').classList.add('active');
}

// Modify Design - Color Changes
function openModifyDesignModal(designType) {
    console.log('Opening modify design modal for type:', designType);
    const modal = document.getElementById('modifyDesignModal');
    const previewContainer = document.getElementById('modifyDesignPreview');
    
    // Clear previous preview
    previewContainer.innerHTML = '';
    
    // Show loading message
    previewContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Loading design preview...</p>';
    
    // Store the current design type for later use
    window.currentModifyDesignType = designType;
    
    // Get the correct design section to capture
    let sourceElement = null;
    if (designType === 'premade') {
        sourceElement = document.getElementById('premadeFrontDesignContent');
    } else if (designType === 'custom') {
        sourceElement = document.getElementById('frontDesignContent');
    }
    
    if (sourceElement && typeof html2canvas !== 'undefined') {
        // Use html2canvas to capture the design
        html2canvas(sourceElement, {
            backgroundColor: '#ffffff',
            scale: 1.5,
            useCORS: true,
            logging: false
        }).then(canvas => {
            previewContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.maxWidth = '300px';
            previewContainer.appendChild(img);
            console.log('Design preview captured and rendered in modal');
        }).catch(err => {
            console.error('Error capturing design:', err);
            previewContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Design preview unavailable</p>';
        });
    } else {
        // Fallback: Show a placeholder
        previewContainer.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Jersey design preview unavailable</p>';
        console.log('Design element not found or html2canvas unavailable');
    }
    
    // Load existing modifications if any
    const existingModifications = document.getElementById('designModifications').value;
    if (existingModifications) {
        document.getElementById('designModificationsText').value = existingModifications;
    }
    
    modal.style.display = 'flex';
}

function closeModifyDesignModal() {
    console.log('Closing modify design modal...');
    document.getElementById('modifyDesignModal').style.display = 'none';
}

function saveDesignModifications() {
    const modificationsText = document.getElementById('designModificationsText').value.trim();
    console.log('Saving design modifications:', modificationsText);
    
    // Store the modifications
    document.getElementById('designModifications').value = modificationsText;
    
    // Close modal
    closeModifyDesignModal();
    
    // Show confirmation
    if (modificationsText) {
        console.log('✓ Color modifications saved');
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modifyModal = document.getElementById('modifyDesignModal');
    if (modifyModal) {
        modifyModal.addEventListener('click', function(e) {
            if (e.target === modifyModal) {
                closeModifyDesignModal();
            }
        });
    }
});

function goBackToDesign() {
    document.getElementById('orderFormSection').classList.add('hidden');
    if (designState.type === 'custom') {
        document.getElementById('customDesignSection').classList.remove('hidden');
    } else if (designState.type === 'premade') {
        document.getElementById('premadeDesignSection').classList.remove('hidden');
    }
}

function toggleMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
}

// Close mobile menu when a link is clicked
function closeMobileMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

// Wait for DOM to be ready before setting up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Modal close functionality
    const modal = document.getElementById('designModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }

    // Logo file upload preview
    const finalLogoUpload = document.getElementById('finalLogoUpload');
    if (finalLogoUpload) {
        finalLogoUpload.addEventListener('change', function(e) {
            const files = e.target.files;
            const previewContainer = document.getElementById('logoPreviewContainer');
            previewContainer.innerHTML = ''; // Clear previous previews
            
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const previewItem = document.createElement('div');
                    previewItem.style.cssText = `
                        position: relative;
                        width: 120px;
                        height: 120px;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        transition: transform 0.2s ease, box-shadow 0.2s ease;
                        cursor: pointer;
                    `;
                    previewItem.onmouseover = function() {
                        this.style.transform = 'scale(1.05)';
                        this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
                    };
                    previewItem.onmouseout = function() {
                        this.style.transform = 'scale(1)';
                        this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    };
                    
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.cssText = `
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: center;
                    `;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.innerHTML = '✕';
                    removeBtn.style.cssText = `
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: rgba(255, 0, 0, 0.8);
                        color: white;
                        border: none;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                        transition: background 0.2s ease;
                    `;
                    removeBtn.onmouseover = function() {
                        this.style.background = 'rgba(255, 0, 0, 1)';
                    };
                    removeBtn.onmouseout = function() {
                        this.style.background = 'rgba(255, 0, 0, 0.8)';
                    };
                    removeBtn.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        previewItem.remove();
                        // Remove from file list if possible
                        const dt = new DataTransfer();
                        const input = document.getElementById('finalLogoUpload');
                        Array.from(input.files).forEach((f, i) => {
                            if (i !== index) {
                                dt.items.add(f);
                            }
                        });
                        input.files = dt.files;
                    };
                    
                    previewItem.appendChild(img);
                    previewItem.appendChild(removeBtn);
                    previewContainer.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Contact form submission - FIXED FOR FORMSPREE
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // Check if this is a Formspree form
        if (contactForm.action && contactForm.action.includes('formspree.io')) {
            // Let Formspree handle it naturally - don't prevent default
            console.log('Formspree form detected - allowing natural submission');
        } else {
            // For other forms, use the custom handler
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
            });
        }
    }

    // Close mobile menu when navigation links are clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
});
