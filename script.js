let designState = {
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
    if (!designState.frontLogo) return;
    
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
                
                const logo = new Image();
                logo.onload = function() {
                    // Base logo size (diameter of circle in pixels)
                    const baseLogoSize = 80;
                    const logoSize = (designState.logoSize / 50) * baseLogoSize;
                    
                    // Position: top-right corner of jersey with manual adjustments
                    const baseX = 170;
                    const baseY = 20;
                    const x = baseX + (designState.logoX / 50) * 30;
                    const y = baseY + (designState.logoY / 50) * 30;
                    
                    // Create circular clipping and draw with aspect ratio maintained
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
                    ctx.clip();
                    // Draw image centered within the circular area, maintaining aspect ratio
                    ctx.drawImage(logo, x, y, logoSize, logoSize);
                    ctx.restore();
                    
                    if (designState.backNumber) {
                        ctx.font = `bold ${canvas.height * 0.15}px Arial`;
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(designState.backNumber, canvas.width / 2, canvas.height * 0.65);
                    }
                    
                    jerseyImage.src = canvas.toDataURL();
                };
                logo.src = designState.frontLogo;
            };
            img.src = designState.premadeDesign.filename;
        }
    } else if (currentType === 'custom') {
        const previewSvg = document.getElementById('jerseyPreview');
        const existingLogo = previewSvg.querySelector('#uploadedLogofront');
        if (existingLogo) {
            existingLogo.remove();
        }
        
        const logo = new Image();
        logo.onload = function() {
            // Base size: 60px diameter
            const baseLogoSize = 60;
            const logoSize = (designState.logoSize / 50) * baseLogoSize;
            
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
            const x = baseX + (designState.logoX / 50) * 15;
            const y = baseY + (designState.logoY / 50) * 15;
            
            const logoImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            logoImage.setAttribute('id', 'uploadedLogofront');
            logoImage.setAttribute('href', logoCanvas.toDataURL());
            logoImage.setAttribute('x', `${x}`);
            logoImage.setAttribute('y', `${y}`);
            logoImage.setAttribute('width', `${logoSize}`);
            logoImage.setAttribute('height', `${logoSize}`);
            logoImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            
            previewSvg.appendChild(logoImage);
            
            const placeholderTexts = previewSvg.querySelectorAll('text');
            placeholderTexts.forEach(text => {
                if (text.textContent === 'Front Logo') {
                    text.style.display = 'none';
                }
            });
        };
        logo.src = designState.frontLogo;
    }
}

function updateLogoSize(value) {
    designState.logoSize = value;
    
    // Update all size display labels
    const sizeValueLabels = document.querySelectorAll('#logoSizeValue, #premadeLogoSizeValue');
    sizeValueLabels.forEach(label => {
        label.textContent = value + '%';
    });
    
    // Update all slider positions
    const sliders = document.querySelectorAll('#logoSizeSlider, #premadeLogoSizeSlider');
    sliders.forEach(slider => {
        slider.value = value;
    });
    
    redrawDesignPreview();
}

function updateLogoX(value) {
    designState.logoX = value;
    
    // Update all X display labels
    const xValueLabels = document.querySelectorAll('#logoXValue, #premadeLogoXValue');
    xValueLabels.forEach(label => {
        label.textContent = value;
    });
    
    // Update all X sliders
    const xSliders = document.querySelectorAll('#logoXSlider, #premadeLogoXSlider');
    xSliders.forEach(slider => {
        slider.value = value;
    });
    
    redrawDesignPreview();
}

function updateLogoY(value) {
    designState.logoY = value;
    
    // Update all Y display labels
    const yValueLabels = document.querySelectorAll('#logoYValue, #premadeLogoYValue');
    yValueLabels.forEach(label => {
        label.textContent = value;
    });
    
    // Update all Y sliders
    const ySliders = document.querySelectorAll('#logoYSlider, #premadeLogoYSlider');
    ySliders.forEach(slider => {
        slider.value = value;
    });
    
    redrawDesignPreview();
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
    designState.backName = value || '';
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
        if (designState.backNumber) {
            el.textContent = designState.backNumber;
            el.style.color = designState.backNumberColor;
            el.style.transform = `translate(${(designState.backNumberX / 50) * 30}px, ${(designState.backNumberY / 50) * 30}px)`;
        }
    });
    
    // Update back name display
    const backNameElements = document.querySelectorAll('[data-role="backName"]');
    backNameElements.forEach(el => {
        if (designState.backName) {
            el.textContent = designState.backName.toUpperCase();
            el.style.color = designState.backNameColor;
            el.style.transform = `translate(${(designState.backNameX / 50) * 30}px, ${(designState.backNameY / 50) * 30}px)`;
        }
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
