// Array to hold wishlist products
let wishlist = [];

// Fetch products based on brand and price range input
function buttonClicked() {
    const brand = document.getElementById("brandInput").value;
    const priceRange = document.getElementById("priceRangeInput").value;

    fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            let productsHtml = "";

            data.forEach(product => {
                const productPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, "")); // Remove $ and parse

                if (isWithinPriceRange(productPrice, priceRange)) {
                    const title = product.name || 'N/A';
                    const price = product.price || 'N/A';
                    const rating = product.rating || 'N/A';
                    const productType = product.product_type || 'N/A';
                    const description = product.description || 'N/A';
                    const productLink = product.product_link || '#';
                    const websiteLink = product.website_link || '#';
                    const imageLink = product.image_link || 'https://via.placeholder.com/150';

                    productsHtml += `
                        <div class="product-card">
                            <h3>${escapeHtml(title)}</h3>
                            <img src="${imageLink}" alt="${escapeHtml(title)}">
                            <p><strong>Brand:</strong> ${escapeHtml(brand)}</p>
                            <p><strong>Price:</strong> $${escapeHtml(price)}</p>
                            <p><strong>Rating:</strong> ${escapeHtml(rating)}</p>
                            <button onclick="toggleDetails('${escapeHtml(title)}')">More Details?</button>
                            <button onclick="addToWishlist('${escapeHtml(title)}', '${imageLink}', '${price}', '${escapeHtml(brand)}', '${escapeHtml(rating)}', '${escapeHtml(productType)}')">Add to Wishlist</button>
                            <button onclick="addToCart('${escapeHtml(title)}', '${imageLink}', '${price}', '${escapeHtml(brand)}', '${escapeHtml(rating)}', '${escapeHtml(productType)}')">Add to Cart</button>
                            <div id="details-${title.replace(/\s+/g, '-')}" class="product-details" style="display:none;">
                                <p><strong>Type:</strong> ${escapeHtml(productType)}</p>
                                <p><strong>Description:</strong> ${escapeHtml(description)}</p>
                                <a href="${escapeHtml(productLink)}" target="_blank">Product Link</a><br>
                                <a href="${escapeHtml(websiteLink)}" target="_blank">Website Link</a>
                            </div>
                        </div>
                    `;
                }
            });

            document.getElementById("productsDisplay").innerHTML = productsHtml || "<p>No products found.</p>";
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Toggle product details display
function toggleDetails(title) {
    const detailsDiv = document.getElementById(`details-${title.replace(/\s+/g, '-')}`);
    if (detailsDiv) {
        detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
    }
}

// Check if the product price is within the specified price range
function isWithinPriceRange(price, priceRange) {
    if (isNaN(price) || priceRange === '') return true;
    const [minPrice, maxPrice] = priceRange.split('-').map(Number);
    return price >= minPrice && price <= maxPrice;
}

// Add product to wishlist
function addToWishlist(title, image, price, brand, rating, productType) {
    const product = { title, image, price, brand, rating, productType };
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    alert(`${title} has been added to your wishlist!`);
}

// Display wishlist on wishlist.html
function displayWishlist() {
    const wishlistContainer = document.getElementById("wishlistDisplay");
    let wishlistHtml = "";

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist.forEach(product => {
        wishlistHtml += `
            <div class="wishlist-item">
                <h3>${escapeHtml(product.title)}</h3>
                <img src="${product.image}" alt="${escapeHtml(product.title)}">
                <p>Price: $${escapeHtml(product.price)}</p>
            </div>
        `;
    });

    wishlistContainer.innerHTML = wishlistHtml || "<p>Your wishlist is empty.</p>";
}

// Add products to cart with quantity update
function addToCart(title, image, price, brand, rating, productType) {
    const product = { title, image, price, brand, rating, productType, quantity: 1 };
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingProductIndex = cart.findIndex(item => item.title === title);
    if (existingProductIndex !== -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${title} has been added to your cart!`);
}

// Function to update item quantity in cart
function updateCartQuantity(title, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.map(item => {
        if (item.title === title) {
            item.quantity = newQuantity; // Update quantity for the specified item
        }
        return item; // Return updated or original item
    });
    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart to local storage
    displayCart(); // Refresh the cart display to reflect changes
}

// Display cart
function displayCart() {
    const cartItemsContainer = document.getElementById("cartItems");
    let cartHtml = "";

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.forEach(product => {
        cartHtml += `
            <div class="cart-item">
                <h3>${escapeHtml(product.title)}</h3>
                <img src="${product.image}" alt="${escapeHtml(product.title)}">
                <p>Price: $${escapeHtml(product.price)}</p>
                <input type="number" value="${product.quantity}" min="1" onchange="updateCartQuantity('${escapeHtml(product.title)}', this.value)">
                <button onclick="removeFromCart('${escapeHtml(product.title)}')">Remove</button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHtml || "<p>Your cart is empty.</p>";
    document.getElementById("cartDisplay").style.display = "block";
}

// Remove product from cart
function removeFromCart(title) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.title !== title);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart(); // Refresh cart display
}

// Load wishlist and cart on page load
window.onload = function() {
    displayWishlist(); // Display the wishlist items when the page loads
    displayCart(); // Display the cart items when the page loads
};

// Handle payment type selection in HTML
function paymentTypeChange() {
    buttonClicked(); // Refetch products based on the selected payment type
}