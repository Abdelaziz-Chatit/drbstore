// Cart Management Script
(function() {
    'use strict';

    function updateCartBadge(count) {
        const cartLink = document.querySelector('a[href*="/cart"]');
        if (!cartLink) return;

        let badge = cartLink.querySelector('.cart-badge');
        
        if (!badge && count > 0) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartLink.appendChild(badge);
        }

        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Handle add to cart forms
    document.addEventListener('submit', async (e) => {
        if (e.target.classList.contains('add-to-cart-form')) {
            e.preventDefault();
            
            const form = e.target;
            const formData = new FormData(form);
            const url = form.action;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    showToast(data.message || 'Added to cart!', 'success');
                    updateCartBadge(data.cartCount || 0);
                } else {
                    showToast(data.message || 'Error adding to cart', 'error');
                }
            } catch (error) {
                console.error('Cart error:', error);
                showToast('Error adding to cart', 'error');
            }
        }
    });

    // Update cart count on page load
    fetch('/cart/count')
        .then(res => res.json())
        .then(data => updateCartBadge(data.count || 0))
        .catch(err => console.error('Error fetching cart count:', err));
})();

