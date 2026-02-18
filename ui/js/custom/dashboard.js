$(function () {
    //Json data by api call for order table
    $.get(orderListApiUrl, function (response) {
        if(response && response.length > 0) {
            var table = '';
            var totalCost = 0;
            var todayRevenue = 0;
            var today = new Date().toISOString().split('T')[0];
            
            $.each(response, function(index, order) {
                totalCost += parseFloat(order.total);
                
                // Calculate today's revenue - fix date parsing
                var orderDateStr = order.datetime;
                var orderDate = new Date(orderDateStr);
                var orderDateOnly = orderDate.toISOString().split('T')[0];
                
                if(orderDateOnly === today) {
                    todayRevenue += parseFloat(order.total);
                }
                
                var statusText = (order.status || 'Pending').toString().trim();
                var statusKey = statusText.toLowerCase().replace(/ /g, '-');
                var itemsText = '—';
                if (order.order_details && order.order_details.length > 0) {
                    itemsText = order.order_details.map(function(item) {
                        return item.product_name + ' x' + item.quantity;
                    }).join(', ');
                }

                table += '<tr>' +
                    '<td>'+ order.datetime +'</td>'+
                    '<td><span class="badge-modern badge-primary">#'+ order.order_id +'</span></td>'+
                    '<td>'+ order.customer_name +'</td>'+
                    '<td>'+ itemsText +'</td>'+
                    '<td><strong>₹'+ parseFloat(order.total).toFixed(2) +'</strong></td>'+
                    '<td>' +
                        '<select class="status-dropdown status-' + statusKey + '" data-order-id="'+ order.order_id +'" data-previous-status="' + statusText + '">' +
                            '<option value="Pending"' + (statusText === 'Pending' ? ' selected' : '') + '>Pending</option>' +
                            '<option value="In Progress"' + (statusText === 'In Progress' ? ' selected' : '') + '>In Progress</option>' +
                            '<option value="Delivered"' + (statusText === 'Delivered' ? ' selected' : '') + '>Delivered</option>' +
                            '<option value="Cancelled"' + (statusText === 'Cancelled' ? ' selected' : '') + '>Cancelled</option>' +
                        '</select>' +
                    '</td>'+
                    '<td class="actions-cell">' +
                        '<button class="action-btn view view-order-btn" data-order-id="'+ order.order_id +'"><i class="zmdi zmdi-eye"></i> View</button>' +
                        '<button class="action-btn delete delete-order-btn" data-order-id="'+ order.order_id +'"><i class="zmdi zmdi-delete"></i> Delete</button>' +
                    '</td></tr>';
            });
            
            $('#orderTableBody').html(table);
            $('#totalOrders').text(response.length);
            $('#todayRevenue').text('₹' + todayRevenue.toFixed(2));
            updatePendingOrders();
            $('#emptyState').hide();
        } else {
            $('#orderTableBody').empty();
            $('#emptyState').show();
            $('#totalOrders').text('0');
            $('#todayRevenue').text('₹0');
            $('#pendingOrders').text('0');
        }
    }).fail(function(xhr, status, error) {
        console.error('Error loading orders:', status, error);
        $('#orderTableBody').empty();
        $('#emptyState').show();
        alert('Error loading orders: ' + error + '\n\nPlease check if the backend server is running.');
    });
});

// Handle view order button clicks using event delegation
$(document).on('click', '.view-order-btn', function() {
    var orderId = $(this).data('order-id');
    viewOrder(orderId);
});

function viewOrder(orderId) {
    // Get order details from API
    $.get(orderListApiUrl, function(response) {
        if(response && response.length > 0) {
            var order = response.find(function(o) { return o.order_id == orderId; });
            
            if(order) {
                var message = 'Order #' + orderId + ' Details\n\n';
                message += 'Customer: ' + order.customer_name + '\n';
                if (order.delivery_address) {
                    message += 'Address: ' + order.delivery_address + '\n';
                }
                message += 'Date: ' + order.datetime + '\n';
                message += 'Total: ₹' + parseFloat(order.total).toFixed(2) + '\n\n';
                message += 'Items:\n';
                
                if(order.order_details && order.order_details.length > 0) {
                    order.order_details.forEach(function(item, index) {
                        message += (index + 1) + '. ' + item.product_name + ' - ';
                        message += 'Qty: ' + item.quantity + ' - ';
                        message += '₹' + parseFloat(item.total_price).toFixed(2) + '\n';
                    });
                }
                
                alert(message);
            } else {
                alert('Order not found');
            }
        }
    }).fail(function() {
        alert('Error loading order details');
    });
}

function applyStatusClass(dropdown, statusText) {
    var normalizedStatus = (statusText || 'Pending').toString().trim();
    var statusKey = normalizedStatus.toLowerCase().replace(/ /g, '-');
    dropdown.removeClass('status-pending status-in-progress status-delivered status-cancelled');
    dropdown.addClass('status-' + statusKey);
    dropdown.data('previous-status', normalizedStatus);
}

function updatePendingOrders() {
    var pendingCount = 0;
    $('.status-dropdown').each(function() {
        var statusValue = ($(this).val() || '').toString().trim();
        if (statusValue === 'Pending') {
            pendingCount += 1;
        }
    });
    $('#pendingOrders').text(pendingCount);
}

// Handle status dropdown changes using event delegation
$(document).on('change', '.status-dropdown', function() {
    var orderId = $(this).data('order-id');
    var newStatus = $(this).val().toString().trim();
    var dropdown = $(this);
    var previousStatus = (dropdown.data('previous-status') || 'Pending').toString().trim();
    
    // Confirm the status change
    if(confirm('Change order #' + orderId + ' status to "' + newStatus + '"?')) {
        // Update status via API
        $.ajax({
            method: "POST",
            url: apiBaseUrl + "updateOrderStatus",
            data: {
                order_id: orderId,
                status: newStatus
            }
        }).done(function (response) {
            // Update dropdown styling and store new status
            applyStatusClass(dropdown, newStatus);
            updatePendingOrders();
            
            // Show success message
            var statusMsg = document.createElement('div');
            statusMsg.className = 'status-update-message';
            statusMsg.textContent = 'Status updated successfully!';
            dropdown.parent().append(statusMsg);
            
            setTimeout(function() {
                $(statusMsg).fadeOut(function() {
                    $(this).remove();
                });
            }, 2000);
        }).fail(function(xhr, status, error) {
            alert('Error updating status: ' + error);
            // Restore previous value on error
            dropdown.val(previousStatus);
            applyStatusClass(dropdown, previousStatus);
            updatePendingOrders();
        });
    } else {
        // User cancelled - restore previous value without reloading
        dropdown.val(previousStatus);
        applyStatusClass(dropdown, previousStatus);
        updatePendingOrders();
    }
});

// Handle delete order button clicks using event delegation
$(document).on('click', '.delete-order-btn', function() {
    var orderId = $(this).data('order-id');
    var row = $(this).closest('tr');
    
    // Confirm the deletion
    if(confirm('Are you sure you want to delete order #' + orderId + '?\n\nThis action cannot be undone and will remove all order details.')) {
        // Delete order via API
        $.ajax({
            method: "POST",
            url: apiBaseUrl + "deleteOrder",
            data: {
                order_id: orderId
            }
        }).done(function (response) {
            // Remove the row from the table with animation
            row.fadeOut(400, function() {
                $(this).remove();
                
                // Update the stats
                var remainingOrders = $('#orderTableBody tr').length;
                $('#totalOrders').text(remainingOrders);
                updatePendingOrders();
                
                // Show empty state if no orders left
                if(remainingOrders === 0) {
                    $('#emptyState').show();
                }
                
                // Recalculate today's revenue
                var todayRevenue = 0;
                var today = new Date().toISOString().split('T')[0];
                $('#orderTableBody tr').each(function() {
                    var dateText = $(this).find('td:first').text();
                    var orderDate = new Date(dateText);
                    var orderDateOnly = orderDate.toISOString().split('T')[0];
                    if(orderDateOnly === today) {
                        var totalText = $(this).find('td:eq(3) strong').text();
                        var total = parseFloat(totalText.replace('₹', ''));
                        todayRevenue += total;
                    }
                });
                $('#todayRevenue').text('₹' + todayRevenue.toFixed(2));
            });
            
            // Show success message
            var successMsg = document.createElement('div');
            successMsg.className = 'delete-success-message';
            successMsg.innerHTML = '<i class="zmdi zmdi-check-circle"></i> Order #' + orderId + ' deleted successfully!';
            $('body').append(successMsg);
            
            setTimeout(function() {
                $(successMsg).fadeOut(function() {
                    $(this).remove();
                });
            }, 3000);
        }).fail(function(xhr, status, error) {
            alert('Error deleting order: ' + error + '\n\nPlease try again or contact support.');
        });
    }
});
