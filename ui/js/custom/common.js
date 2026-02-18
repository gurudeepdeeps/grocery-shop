// Define your api here
var apiBaseUrl = 'http://127.0.0.1:5000/';
var productListApiUrl = 'http://127.0.0.1:5000/getProducts';
var uomListApiUrl = 'http://127.0.0.1:5000/getUOM';
var productSaveApiUrl = 'http://127.0.0.1:5000/insertProduct';
var productUpdateApiUrl = 'http://127.0.0.1:5000/updateProduct';
var productDeleteApiUrl = 'http://127.0.0.1:5000/deleteProduct';
var orderListApiUrl = 'http://127.0.0.1:5000/getAllOrders';
var orderSaveApiUrl = 'http://127.0.0.1:5000/insertOrder';

function setAuth(user) {
    localStorage.setItem('authRole', user.role);
    localStorage.setItem('authUserId', user.user_id);
    localStorage.setItem('authName', user.name);
    localStorage.setItem('authEmail', user.email);
}

function clearAuth() {
    localStorage.removeItem('authRole');
    localStorage.removeItem('authUserId');
    localStorage.removeItem('authName');
    localStorage.removeItem('authEmail');
}

function requireRole(role) {
    var currentRole = localStorage.getItem('authRole');
    if (!currentRole || currentRole !== role) {
        var loginPage = role === 'admin' ? 'admin-login.html' : 'customer-login.html';
        window.location.href = loginPage;
    }
}

function logout(role) {
    clearAuth();
    var loginPage = role === 'admin' ? 'admin-login.html' : 'customer-login.html';
    window.location.href = loginPage;
}

// For product drop in order
var productsApiUrl = 'https://fakestoreapi.com/products';

function callApi(method, url, data) {
    $.ajax({
        method: method,
        url: url,
        data: data
    }).done(function( msg ) {
        // Close modal if open
        $('.modal-modern').removeClass('show');
        
        // Show success message
        if (url.includes('insertOrder')) {
            alert('Order placed successfully!');
            // Redirect based on role
            if (localStorage.getItem('authRole') === 'customer') {
                window.location.href = 'order-success.html?t=' + new Date().getTime();
            } else {
                window.location.href = 'index.html?t=' + new Date().getTime();
            }
        } else if (url.includes('insertProduct')) {
            alert('Product saved successfully!');
            if (typeof loadProducts === 'function') {
                loadProducts();
            } else {
                window.location.reload(true);
            }
        } else if (url.includes('updateProduct')) {
            alert('Product updated successfully!');
            if (typeof loadProducts === 'function') {
                loadProducts();
            } else {
                window.location.reload(true);
            }
        } else if (url.includes('deleteProduct')) {
            alert('Product deleted successfully!');
            if (typeof loadProducts === 'function') {
                loadProducts();
            } else {
                window.location.reload(true);
            }
        } else {
            // Reload the appropriate data based on current page
            if (typeof loadProducts === 'function') {
                loadProducts();
            } else {
                window.location.reload(true);
            }
        }
    }).fail(function(xhr, status, error) {
        alert('An error occurred: ' + error + '\n\nPlease check if the backend server is running.');
    });
}

function calculateValue() {
    var total = 0;
    $(".product-item").each(function( index ) {
        var qty = parseFloat($(this).find('.product-qty').val()) || 0;
        var price = parseFloat($(this).find('.product-price').val()) || 0;
        var itemTotal = price * qty;
        $(this).find('.product-total').val(itemTotal.toFixed(2));
        total += itemTotal;
    });
    $("#product_grand_total").text(total.toFixed(2));
}

function orderParser(order) {
    return {
        id : order.id,
        date : order.employee_name,
        orderNo : order.employee_name,
        customerName : order.employee_name,
        cost : parseInt(order.employee_salary)
    }
}

function productParser(product) {
    return {
        id : product.id,
        name : product.employee_name,
        unit : product.employee_name,
        price : product.employee_name
    }
}

function productDropParser(product) {
    return {
        id : product.id,
        name : product.title
    }
}