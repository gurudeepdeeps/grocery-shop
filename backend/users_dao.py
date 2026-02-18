from werkzeug.security import check_password_hash

def get_user_by_email(connection, email):
    cursor = connection.cursor()
    query = "SELECT user_id, name, email, password_hash, role FROM users WHERE email = %s"
    cursor.execute(query, (email,))
    row = cursor.fetchone()
    cursor.close()

    if not row:
        return None

    return {
        'user_id': row[0],
        'name': row[1],
        'email': row[2],
        'password_hash': row[3],
        'role': row[4]
    }

def validate_user(connection, email, password):
    user = get_user_by_email(connection, email)
    if not user:
        return None

    if not check_password_hash(user['password_hash'], password):
        return None

    return user
