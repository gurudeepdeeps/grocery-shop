var productModal = $("#productModal");

$(function () {
    // Load UOMs for dropdown
    loadUOMs();
    
    // Load products
    loadProducts();
});

function loadProducts() {
    //JSON data by API call
    console.log('Loading products from:', productListApiUrl);
    $.get(productListApiUrl, function (response) {
        console.log('Products response:', response);
        if(response && response.length > 0) {
            var table = '';
            
            $.each(response, function(index, product) {
                table += '<tr data-id="'+ product.product_id +'" data-name="'+ product.name +'" data-unit="'+ product.uom_id +'" data-price="'+ product.price_per_unit +'">' +
                    '<td><strong>'+ product.name +'</strong></td>'+
                    '<td><span class="badge-modern badge-primary">'+ product.uom_name +'</span></td>'+
                    '<td><strong>₹'+ parseFloat(product.price_per_unit).toFixed(2) +'</strong></td>'+
                    '<td>' +
                        '<button class="action-btn edit" onclick="editProduct('+ product.product_id +', \''+ product.name.replace(/'/g, "\\'") +'\', '+ product.uom_id +', '+ product.price_per_unit +')"><i class="zmdi zmdi-edit"></i> Edit</button>' +
                        '<button class="action-btn delete delete-product"><i class="zmdi zmdi-delete"></i> Delete</button>' +
                    '</td></tr>';
            });
            
            console.log('Populating table with', response.length, 'products');
            $('#productTableBody').html(table);
            $('#totalProducts').text(response.length);
            $('#emptyState').hide();
        } else {
            console.log('No products found or empty response');
            $('#productTableBody').empty();
            $('#emptyState').show();
            $('#totalProducts').text('0');
        }
    }).fail(function(xhr, status, error) {
        console.error('Error loading products:', status, error);
        alert('Error loading products. Make sure the backend server is running on port 5000.');
    });
}

function loadUOMs() {
    //JSON data by API call
    $.get(uomListApiUrl, function (response) {
        if(response) {
            var options = '<option value="">Select unit...</option>';
            $.each(response, function(index, uom) {
                options += '<option value="'+ uom.uom_id +'">'+ uom.uom_name +'</option>';
            });
            $("#uoms").empty().html(options);
        }
    });
}

// Save Product
$("#saveProduct").on("click", function () {
    var data = $("#productForm").serializeArray();
    var requestPayload = {
        product_id: null,
        product_name: null,
        uom_id: null,
        price_per_unit: null
    };
    
    for (var i=0; i<data.length; ++i) {
        var element = data[i];
        switch(element.name) {
            case 'id':
                requestPayload.product_id = element.value;
                break;
            case 'name':
                requestPayload.product_name = element.value;
                break;
            case 'uoms':
                requestPayload.uom_id = element.value;
                break;
            case 'price':
                requestPayload.price_per_unit = element.value;
                break;
        }
    }
    
    // Validation
    if(!requestPayload.product_name) {
        alert('Please enter product name');
        return;
    }
    if(!requestPayload.uom_id) {
        alert('Please select unit of measurement');
        return;
    }
    if(!requestPayload.price_per_unit) {
        alert('Please enter price per unit');
        return;
    }

    var apiUrl = productSaveApiUrl;
    if (requestPayload.product_id && requestPayload.product_id !== '0') {
        apiUrl = productUpdateApiUrl;
    }

    callApi("POST", apiUrl, {
        'data': JSON.stringify(requestPayload)
    });
});

$(document).on("click", ".delete-product", function (){
    var tr = $(this).closest('tr');
    var data = {
        product_id : tr.data('id')
    };
    var isDelete = confirm("Are you sure you want to delete '"+ tr.data('name') +"'?");
    if (isDelete) {
        callApi("POST", productDeleteApiUrl, data);
    }
});