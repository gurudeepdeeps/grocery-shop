from sql_connection import get_sql_connection

def add_delivery_address_column():
    connection = get_sql_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SHOW COLUMNS FROM orders LIKE 'delivery_address'")
        result = cursor.fetchone()
        if not result:
            cursor.execute("ALTER TABLE orders ADD COLUMN delivery_address VARCHAR(255) NULL AFTER customer_name")
            connection.commit()
            print("Added delivery_address column to orders table.")
        else:
            print("delivery_address column already exists.")
    except Exception as exc:
        print(f"Error: {exc}")
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    add_delivery_address_column()
