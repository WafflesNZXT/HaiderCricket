let designState = {
    type: null,
    premadeDesign: null,
    frontLogo: null,
    backNumber: '00'
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

function selectPremadeDesign(name, color) {
    designState.premadeDesign = { name, color };
    document.querySelectorAll('.design-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    const jerseyBase = document.getElementById('premadeJerseyBase');
    jerseyBase.setAttribute('fill', color);
}

function handleLogoUpload(event, type) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            designState.frontLogo = e.target.result;
            
            const textId = type === 'front' ? 'jerseyPreview' : 'premadeJerseyPreview';
            const previewSvg = document.getElementById(textId);
            
            const existingLogo = previewSvg.querySelector(`#uploadedLogo${type}`);
            if (existingLogo) {
                existingLogo.remove();
            }
            
            const logoImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            logoImage.setAttribute('id', `uploadedLogo${type}`);
            logoImage.setAttribute('href', e.target.result);
            logoImage.setAttribute('x', '110');
            logoImage.setAttribute('y', '110');
            logoImage.setAttribute('width', '80');
            logoImage.setAttribute('height', '80');
            logoImage.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            
            previewSvg.appendChild(logoImage);
            
            const placeholderTexts = previewSvg.querySelectorAll('text');
            placeholderTexts.forEach(text => {
                if (text.textContent === 'Front Logo') {
                    text.style.display = 'none';
                }
            });
        };
        reader.readAsDataURL(file);
    }
}

function updateBackNumber(value) {
    designState.backNumber = value || '00';
    document.getElementById('backNumber').textContent = value || '00';
}

function updatePremadeBackNumber(value) {
    designState.backNumber = value || '00';
    document.getElementById('premadeBackNumber').textContent = value || '00';
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
        backNumber: '00'
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

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }

    // Close mobile menu when navigation links are clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
});
