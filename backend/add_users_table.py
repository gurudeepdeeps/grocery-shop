from werkzeug.security import generate_password_hash
from sql_connection import get_sql_connection

def add_users_table():
    connection = get_sql_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL
            )
        """)

        # Seed default users (upsert by role)
        users = [
            ('Admin', 'admin@gmail.com', 'Admin@123', 'admin'),
            ('Customer', 'customer@gmail.com', 'Customer@123', 'customer')
        ]

        for name, email, password, role in users:
            password_hash = generate_password_hash(password)
            cursor.execute("SELECT user_id FROM users WHERE role = %s", (role,))
            row = cursor.fetchone()
            if row is None:
                cursor.execute(
                    "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                    (name, email, password_hash, role)
                )
            else:
                cursor.execute(
                    "UPDATE users SET name = %s, email = %s, password_hash = %s WHERE role = %s",
                    (name, email, password_hash, role)
                )

        connection.commit()
        print("Users table ready. Default admin and customer accounts are seeded.")
    except Exception as exc:
        print(f"Error: {exc}")
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    add_users_table()
