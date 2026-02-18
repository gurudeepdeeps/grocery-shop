var productPrices = {};
var productOptions = '';

$(function () {
    //Json data by api call to load products
    $.get(productListApiUrl, function (response) {
        productPrices = {}
        if(response) {
            productOptions = '<option value="">Select product...</option>';
            $.each(response, function(index, product) {
                productOptions += '<option value="'+ product.product_id +'">'+ product.name +' (₹'+ product.price_per_unit +')</option>';
                productPrices[product.product_id] = product.price_per_unit;
            });
            $(".product-box").find("select").empty().html(productOptions);
            
            renderProductCards(response);
        }
    }).fail(function(xhr, status, error) {
        alert('Error loading products. Make sure the backend server is running.');
    });
});

function renderProductCards(products) {
    var container = $('#productCards');
    if (container.length === 0) {
        return;
    }

    var cardsHtml = '';
    products.forEach(function(product) {
        var imageUrl = getProductImageUrl(product.name);
        cardsHtml += '<div class="product-card">' +
            '<div class="product-card-image">' +
                '<img src="' + imageUrl + '" alt="' + product.name + '" loading="lazy" onerror="this.src=\'https://placehold.co/320x200?text=' + encodeURIComponent(product.name) + '\'">' +
            '</div>' +
            '<div class="product-card-body">' +
                '<h3>' + product.name + '</h3>' +
                '<div class="product-card-meta">' +
                    '<span>' + product.uom_name + '</span>' +
                    '<strong>₹' + parseFloat(product.price_per_unit).toFixed(2) + '</strong>' +
                '</div>' +
                '<button class="btn-modern btn-primary-modern product-add-btn" type="button" data-product-id="' + product.product_id + '">' +
                    '<i class="zmdi zmdi-plus"></i> Add to Order' +
                '</button>' +
            '</div>' +
        '</div>';
    });

    container.html(cardsHtml);
}

function getProductImageUrl(name) {
    var slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return 'images/products/' + slug + '.jpg';
}

$(document).on('click', '.product-add-btn', function() {
    var productId = $(this).data('product-id');
    addProductToOrder(productId);
});

function addProductToOrder(productId) {
    var existingRow = null;
    $('#itemsInOrder .product-item').each(function() {
        var selectedId = $(this).find('.cart-product').val();
        if (selectedId && selectedId.toString() === productId.toString()) {
            existingRow = $(this);
            return false;
        }
    });

    if (existingRow) {
        var qtyInput = existingRow.find('.product-qty');
        var currentQty = parseFloat(qtyInput.val()) || 0;
        qtyInput.val(currentQty + 1);
        calculateValue();
        return;
    }

    addOrderItem();
    var newRow = $('#itemsInOrder .product-item').last();
    newRow.find('.cart-product').val(productId).trigger('change');
    calculateValue();
}

function addOrderItem() {
    var row = $(".product-box").html();
    $("#itemsInOrder").append(row);
    
    // Populate the newly added dropdown with product options
    $("#itemsInOrder .cart-product").last().empty().html(productOptions);
    $("#itemsInOrder .product-price").last().val('0.00');
    $("#itemsInOrder .product-qty").last().val('1');
    $("#itemsInOrder .product-total").last().val('0.00');
}

$("#addMoreButton").click(function () {
    addOrderItem();
});

$(document).on("click", ".remove-row", function (){
    // Don't allow removing if only one item
    if($(".product-item").length > 1) {
        $(this).closest('.order-item-row').remove();
        calculateValue();
    } else {
        alert('At least one item is required');
    }
});

$(document).on("change", ".cart-product", function (){
    var product_id = $(this).val();
    var price = productPrices[product_id];

    $(this).closest('.product-item').find('.product-price').val(parseFloat(price).toFixed(2));
    calculateValue();
});

$(document).on("change input", ".product-qty", function (e){
    calculateValue();
});

// Recalculate when price changes manually
$(document).on("change input", ".product-price", function (e){
    calculateValue();
});

$("#saveOrder").on("click", function(){
    // Validation
    var customerName = $("#customerName").val().trim();
    var deliveryAddress = $("#deliveryAddress").val().trim();
    if(!customerName) {
        alert('Please enter customer name');
        $("#customerName").focus();
        return;
    }
    if(!deliveryAddress) {
        alert('Please enter delivery address');
        $("#deliveryAddress").focus();
        return;
    }
    
    var hasItems = false;
    var isValid = true;
    
    // Only check items in the order section, not the template
    $("#itemsInOrder .product-item").each(function() {
        var productId = $(this).find('.cart-product').val();
        var qty = $(this).find('.product-qty').val();
        
        if(!productId) {
            alert('Please select a product for all items');
            isValid = false;
            return false;
        }
        
        if(!qty || qty <= 0) {
            alert('Please enter valid quantity for all items');
            isValid = false;
            return false;
        }
        
        hasItems = true;
    });
    
    if(!isValid) return;
    
    if(!hasItems) {
        alert('Please add at least one item to the order');
        return;
    }
    
    var formData = $("form").serializeArray();
    var requestPayload = {
        customer_name: null,
        delivery_address: null,
        total: null,
        order_details: []
    };
    
    for(var i=0; i<formData.length; ++i) {
        var element = formData[i];
        var lastElement = null;

        switch(element.name) {
            case 'customerName':
                requestPayload.customer_name = element.value;
                break;
            case 'deliveryAddress':
                requestPayload.delivery_address = element.value;
                break;
            case 'product':
                if(element.value) { // Only add if product is selected
                    requestPayload.order_details.push({
                        product_id: element.value,
                        quantity: null,
                        total_price: null
                    });
                }
                break;
            case 'qty':
                if(requestPayload.order_details.length > 0) {
                    lastElement = requestPayload.order_details[requestPayload.order_details.length-1];
                    lastElement.quantity = element.value;
                }
                break;
            case 'item_total':
                if(requestPayload.order_details.length > 0) {
                    lastElement = requestPayload.order_details[requestPayload.order_details.length-1];
                    lastElement.total_price = element.value;
                }
                break;
        }
    }
    
    requestPayload.grand_total = $("#product_grand_total").text();
    
    if(confirm('Place order for ' + customerName + ' with total ₹' + requestPayload.grand_total + '?')) {
        callApi("POST", orderSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });
    }
});