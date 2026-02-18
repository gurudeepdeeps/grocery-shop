function handleLogin(role) {
    var email = $('#email').val().trim();
    var password = $('#password').val().trim();

    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }

    $.ajax({
        method: 'POST',
        url: apiBaseUrl + 'login',
        data: {
            email: email,
            password: password
        }
    }).done(function(response) {
        if (response.role !== role) {
            alert('Access denied for this login page.');
            return;
        }

        setAuth(response);
        if (role === 'admin') {
            window.location.href = 'index.html';
        } else {
            window.location.href = 'customer-order.html';
        }
    }).fail(function(xhr) {
        if (xhr && xhr.status === 401) {
            alert('Invalid email or password');
        } else {
            alert('Login failed. Please try again.');
        }
    });
}
