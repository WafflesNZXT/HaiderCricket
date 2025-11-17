let designState = {
    type: null,
    premadeDesign: null,
    frontLogo: null,
    backNumber: '00'
};

function openDesignModal() {
    document.getElementById('designModal').classList.add('active');
}

function selectDesignType(type) {
    designState.type = type;
    document.getElementById('designModal').classList.remove('active');
    
    if (type === 'custom') {
        document.getElementById('customDesignSection').classList.remove('hidden');
        window.scrollTo(0, 0);
    } else {
        document.getElementById('premadeDesignSection').classList.remove('hidden');
        window.scrollTo(0, 0);
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
    window.scrollTo(0, 0);
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
```

---

## **📁 File Structure**

Create this folder structure:
```
haider-cricket/
├── index.html
├── products.html
├── about.html
├── contact.html
├── styles.css
└── script.js
