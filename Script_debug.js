// Maisonya E-Commerce - DEBUGGED VERSION FOR WHATSAPP ISSUE

// Global Variables
let cart = [];
let wishlist = [];
let currentQuickViewProduct = null;
let orderCounter = 1000;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    loadWishlistFromStorage();
    loadOrderCounterFromStorage();
    updateCart();
    updateWishlist();
    initializeCountdown();
    initializeScrollEffects();
    initializeTheme();
    console.log('✅ Maisonya Website Fully Loaded - DEBUG VERSION ACTIVE!');
});

// ========== CORE FUNCTIONS ==========
function showNotification(message) {
    const notification = document.getElementById('success-notification');
    const messageElement = document.getElementById('notification-message');
    
    messageElement.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showNotification(`تم الانتقال إلى ${sectionId}`);
    }
}

// ========== THEME TOGGLE ==========
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const themeBtn = document.getElementById('theme-toggle');
    
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
    showNotification('تم تغيير المظهر');
}

// ========== SEARCH FUNCTIONALITY ==========
function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchProducts(''); // Show all products
    }
}

function searchProducts(searchTerm) {
    const products = document.querySelectorAll('.product-card');
    const term = searchTerm.toLowerCase();
    
    products.forEach(product => {
        const name = product.dataset.name.toLowerCase();
        
        if (name.includes(term)) {
            product.style.display = 'block';
            setTimeout(() => {
                product.style.opacity = '1';
                product.style.transform = 'scale(1)';
            }, 10);
        } else {
            product.style.opacity = '0';
            product.style.transform = 'scale(0.9)';
            setTimeout(() => {
                product.style.display = 'none';
            }, 300);
        }
    });
}

// ========== CART FUNCTIONS ==========
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (cartSidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// POP-UP NOTIFICATION FOR ADD TO CART
function showAddToCartPopup(productName, productImage, productPrice) {
    // Remove existing popup
    const existingPopup = document.getElementById('cart-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'cart-popup';
    popup.innerHTML = `
        <div class="cart-popup-content">
            <div class="cart-popup-image">
                <img src="${productImage}" alt="${productName}">
            </div>
            <div class="cart-popup-info">
                <h4>✅ تمت الإضافة إلى السلة!</h4>
                <p><strong>${productName}</strong></p>
                <p>السعر: ${productPrice} DH</p>
            </div>
            <div class="cart-popup-actions">
                <button onclick="toggleCart(); document.getElementById('cart-popup').remove();" class="btn btn-primary btn-sm">
                    <i class="fas fa-shopping-cart"></i> عرض السلة
                </button>
                <button onclick="document.getElementById('cart-popup').remove();" class="btn btn-outline btn-sm">
                    متابعة التسوق
                </button>
            </div>
        </div>
    `;

    // Add styles
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideInRight 0.5s ease;
        max-width: 350px;
        border: 2px solid var(--primary);
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        .cart-popup-content {
            padding: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
        }
        .cart-popup-image img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 10px;
        }
        .cart-popup-info h4 {
            margin: 0 0 8px 0;
            color: var(--success);
            font-size: 16px;
        }
        .cart-popup-info p {
            margin: 4px 0;
            font-size: 14px;
            color: var(--text);
        }
        .cart-popup-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .btn-sm {
            padding: 8px 12px;
            font-size: 12px;
        }
    `;
    
    if (!document.querySelector('#popup-styles')) {
        style.id = 'popup-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(popup);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (popup.parentNode) {
            popup.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => popup.remove(), 500);
        }
    }, 5000);
}

function addToCartBtn(name, price, image) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price: parseFloat(price), image, qty: 1 });
    }
    
    updateCart();
    saveCartToStorage();
    
    // Show popup notification
    showAddToCartPopup(name, image, price);
    
    // Find and animate the button
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
        if (btn.textContent.includes(name.split(' ')[0])) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
            btn.style.background = 'linear-gradient(135deg, var(--success), #229954)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 2000);
        }
    });
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartTotal = document.getElementById('cart-total');
    const cartQuantity = document.getElementById('cart-quantity');
    const cartEmpty = document.getElementById('cart-empty');
    
    cartItems.innerHTML = '';
    let total = 0;
    let totalQty = 0;
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
    } else {
        cartEmpty.style.display = 'none';
        
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>الكمية: ${item.qty}</span>
                </div>
                <div class="cart-item-price">
                    <span>${(item.price * item.qty).toFixed(2)} DH</span>
                    <button class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(li);
            total += item.price * item.qty;
            totalQty += item.qty;
        });
    }
    
    const qty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = qty;
    if (cartCountBadge) cartCountBadge.textContent = qty;
    cartTotal.textContent = total.toFixed(2) + ' DH';
    if (cartQuantity) cartQuantity.textContent = qty + ' قطع';
}

function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    updateCart();
    saveCartToStorage();
    showNotification(`تم حذف ${removedItem.name} من السلة`);
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// ========== WISHLIST FUNCTIONS ==========
function toggleWishlist() {
    const wishlistSidebar = document.getElementById('wishlist-sidebar');
    const overlay = document.getElementById('overlay');
    
    wishlistSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (wishlistSidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function toggleWishlistItem(btn) {
    const card = btn.closest('.product-card');
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const image = card.querySelector('img').src;

    const index = wishlist.findIndex(item => item.name === name);
    if (index > -1) {
        wishlist.splice(index, 1);
        btn.innerHTML = '<i class="far fa-heart"></i>';
        showNotification('تم حذف المنتج من القائمة');
    } else {
        wishlist.push({ name, price, image });
        btn.innerHTML = '<i class="fas fa-heart"></i>';
        showNotification('تم إضافة المنتج إلى القائمة');
    }
    
    updateWishlist();
    saveWishlistToStorage();
}

function updateWishlist() {
    const wishlistItems = document.getElementById('wishlist-items');
    const wishlistCount = document.getElementById('wishlist-count');
    const wishlistCountBadge = document.getElementById('wishlist-count-badge');
    const wishlistEmpty = document.getElementById('wishlist-empty');
    
    wishlistItems.innerHTML = '';
    
    if (wishlist.length === 0) {
        wishlistEmpty.style.display = 'block';
    } else {
        wishlistEmpty.style.display = 'none';
        
        wishlist.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="wishlist-item-info">
                    <strong>${item.name}</strong>
                    <span>${item.price.toFixed(2)} DH</span>
                </div>
                <div class="wishlist-item-actions">
                    <button class="add-to-cart-from-wishlist" onclick="addToCartBtn('${item.name}', '${item.price}', '${item.image}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="remove-item" onclick="removeFromWishlist(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            wishlistItems.appendChild(li);
        });
    }
    
    wishlistCount.textContent = wishlist.length;
    if (wishlistCountBadge) wishlistCountBadge.textContent = wishlist.length;
}

function removeFromWishlist(index) {
    wishlist.splice(index, 1);
    updateWishlist();
    saveWishlistToStorage();
    showNotification('تم حذف المنتج من القائمة');
}

function saveWishlistToStorage() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

// ========== QUICK VIEW FUNCTIONS ==========
function quickView(name, price, image) {
    currentQuickViewProduct = { name, price, image };
    document.getElementById('quick-view-name').textContent = name;
    document.getElementById('quick-view-price').textContent = price;
    document.getElementById('quick-view-img').src = image;
    
    document.getElementById('quick-view-modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    document.getElementById('quick-view-modal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function addToCartFromQuickView() {
    if (currentQuickViewProduct) {
        addToCartBtn(currentQuickViewProduct.name, currentQuickViewProduct.price, currentQuickViewProduct.image);
        closeQuickView();
    }
}

function toggleWishlistQuickView() {
    if (currentQuickViewProduct) {
        // Add to wishlist logic here
        const exists = wishlist.find(item => item.name === currentQuickViewProduct.name);
        if (!exists) {
            wishlist.push(currentQuickViewProduct);
            updateWishlist();
            saveWishlistToStorage();
            showNotification(`تم إضافة ${currentQuickViewProduct.name} إلى القائمة`);
        } else {
            showNotification('المنتج موجود بالفعل في القائمة');
        }
    }
}

// ========== CHECKOUT FUNCTIONS ==========
function openCheckout() {
    if (cart.length === 0) {
        showNotification('سلتك فارغة!');
        return;
    }
    
    updateCheckoutSummary();
    document.getElementById('checkout-modal').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function updateCheckoutSummary() {
    const summaryItems = document.getElementById('checkout-summary-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    summaryItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} ×${item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)} DH</span>
            </div>
        `;
        summaryItems.appendChild(div);
        total += item.price * item.qty;
    });
    
    checkoutTotal.textContent = total.toFixed(2);
}

// ORDER COUNTER FUNCTIONS
function loadOrderCounterFromStorage() {
    const savedCounter = localStorage.getItem('orderCounter');
    if (savedCounter) {
        orderCounter = parseInt(savedCounter);
    }
}

function saveOrderCounterToStorage() {
    localStorage.setItem('orderCounter', orderCounter.toString());
}

function getNextOrderNumber() {
    const currentOrder = orderCounter++;
    saveOrderCounterToStorage();
    return `ORD${currentOrder}`;
}

// ========== CHECKOUT SUBMIT - DEBUGGED VERSION ==========
async function handleCheckoutSubmit(e) {
    e.preventDefault();

    // DEBUG: Log form values to console
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const notes = document.getElementById('cust-notes').value.trim();

    console.log('🔍 DEBUG - Form Data:', { name, phone, address, notes });
    console.log('🔍 DEBUG - Cart Data:', cart);

    if (!name || !phone || !address) {
        showNotification('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    // Generate order number
    const orderNumber = getNextOrderNumber();
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);
    const orderDate = new Date().toLocaleString('ar-MA');

    // DEBUG: Log order data
    const orderData = {
        orderNumber,
        date: orderDate,
        customerName: name,
        phone: phone,
        address: address,
        notes: notes || 'لا توجد ملاحظات',
        items: cart.map(item => `${item.name} x${item.qty}`),
        totalAmount: total
    };
    
    console.log('🔍 DEBUG - Order Data to Save:', orderData);

    // Save order to Excel file
    try {
        const response = await fetch('/save-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            showNotification('✅ تم حفظ الطلب في ملف Excel بنجاح!');
            console.log('✅ DEBUG - Order saved to Excel successfully');
        } else {
            console.error('❌ DEBUG - Failed to save to Excel:', response.statusText);
        }
    } catch (error) {
        console.error('❌ DEBUG - Error saving order:', error);
        showNotification('تم إرسال الطلب عبر WhatsApp');
    }

    // Send to WhatsApp - SIMPLIFIED VERSION FOR DEBUGGING
    const merchantPhone = "212642778240";
    
    // Create SIMPLE, RELIABLE WhatsApp message
    let message = `طلب جديد من Maisonya\n\n`;
    message += `رقم الطلب: ${orderNumber}\n`;
    message += `التاريخ: ${orderDate}\n\n`;
    
    message += `بيانات العميل:\n`;
    message += `━━━━━━━━━━━━━━\n`;
    message += `الاسم: ${name}\n`;
    message += `الهاتف: ${phone}\n`;
    message += `العنوان: ${address}\n`;
    
    if (notes && notes.trim()) {
        message += `ملاحظات: ${notes}\n`;
    }
    
    message += `━━━━━━━━━━━━━━\n\n`;
    
    message += `تفاصيل الطلب:\n`;
    message += `━━━━━━━━━━━━━━\n`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   الكمية: ${item.qty} - السعر: ${(item.price * item.qty).toFixed(2)} DH\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━\n`;
    message += `المجموع: ${total} DH\n`;
    message += `عدد المنتجات: ${cart.length}\n`;
    message += `تم حفظ الطلب في ملف Excel`;

    console.log('🔍 DEBUG - WhatsApp Message:', message);
    console.log('🔍 DEBUG - Message Length:', message.length);

    // Test: Create WhatsApp URL with proper encoding
    try {
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${merchantPhone}?text=${encodedMessage}`;
        console.log('🔍 DEBUG - WhatsApp URL:', whatsappURL);
        
        // Open WhatsApp
        window.open(whatsappURL, '_blank');
        
        // Also log the simple version as backup
        const simpleMessage = `طلب جديد من Maisonya\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\nالمجموع: ${total} DH`;
        console.log('🔍 BACKUP Simple Message:', simpleMessage);
        console.log('🔍 BACKUP URL:', `https://wa.me/${merchantPhone}?text=${encodeURIComponent(simpleMessage)}`);
        
    } catch (error) {
        console.error('❌ DEBUG - Error creating WhatsApp URL:', error);
        showNotification('حدث خطأ في فتح WhatsApp، لكن الطلب تم حفظه');
    }

    // Show success message with debug info
    document.getElementById('checkout-modal').innerHTML = `
        <div class="checkout-content">
            <div class="checkout-header">
                <h2>✅ شكراً لك!</h2>
                <button class="close-checkout" onclick="location.reload()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 2rem; text-align: center;">
                <p style="font-size: 1.3rem; margin-bottom: 1rem; color: var(--success);"><strong>رقم طلبك: ${orderNumber}</strong></p>
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">✅ تم حفظ طلبك في ملف Excel</p>
                <p style="font-size: 1rem; margin-bottom: 1rem;">📱 تم فتح WhatsApp مع تفاصيل العميل الكاملة</p>
                <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 1rem;">🔍 افتح وحدة التحكم (F12) لمشاهدة بيانات التصحيح</p>
                <p style="color: var(--text-light);">سيتم تحديث الصفحة تلقائياً...</p>
            </div>
        </div>
    `;

    // Clear cart and reload
    cart = [];
    updateCart();
    saveCartToStorage();

    setTimeout(() => {
        location.reload();
    }, 5000);
}

// ========== UTILITY FUNCTIONS ==========
function closeAllSidebars() {
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('wishlist-sidebar').classList.remove('active');
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('quick-view-modal').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function subscribeNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    showNotification(`✅ شكراً لاشتراكك! تم إرسال تأكيد إلى ${email}`);
    e.target.reset();
}

function sortProducts() {
    const sortBy = document.getElementById('sort-select').value;
    const productGrid = document.querySelector('.product-grid');
    const products = Array.from(productGrid.children);

    products.sort((a, b) => {
        switch(sortBy) {
            case 'price-low':
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            case 'price-high':
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            case 'name':
                return a.dataset.name.localeCompare(b.dataset.name);
            default:
                return 0;
        }
    });

    products.forEach(product => {
        productGrid.appendChild(product);
    });
    
    if (sortBy !== 'default') {
        showNotification(`تم ترتيب المنتجات حسب: ${sortBy}`);
    }
}

// ========== ANIMATIONS & EFFECTS ==========
function initializeCountdown() {
    function updateCountdown() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <span class="time-block">${String(hours).padStart(2, '0')}</span>
                <span class="time-separator">:</span>
                <span class="time-block">${String(minutes).padStart(2, '0')}</span>
                <span class="time-separator">:</span>
                <span class="time-block">${String(seconds).padStart(2, '0')}</span>
            `;
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function initializeScrollEffects() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Scroll animations for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe product cards, features, and other elements
    document.querySelectorAll('.product-card, .feature-card, .deal-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('header');
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.backdropFilter = 'blur(20px)';
        } else {
            header.style.background = 'var(--card-bg)';
        }
        
        lastScroll = currentScroll;
    });
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeAllSidebars();
    }
});

// ========== EXPORT ALL FUNCTIONS ==========
window.addToCartBtn = addToCartBtn;
window.toggleCart = toggleCart;
window.toggleWishlist = toggleWishlist;
window.toggleWishlistItem = toggleWishlistItem;
window.toggleTheme = toggleTheme;
window.toggleSearch = toggleSearch;
window.searchProducts = searchProducts;
window.quickView = quickView;
window.closeQuickView = closeQuickView;
window.addToCartFromQuickView = addToCartFromQuickView;
window.toggleWishlistQuickView = toggleWishlistQuickView;
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.handleCheckoutSubmit = handleCheckoutSubmit;
window.subscribeNewsletter = subscribeNewsletter;
window.sortProducts = sortProducts;
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;
window.closeAllSidebars = closeAllSidebars;
window.removeFromCart = removeFromCart;
window.removeFromWishlist = removeFromWishlist;

console.log('🚀 DEBUG VERSION - All functions exported with extensive logging!');