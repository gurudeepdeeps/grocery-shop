"""
Script to add delivery status column to orders table
"""
from sql_connection import get_sql_connection

def add_status_column():
    connection = get_sql_connection()
    cursor = connection.cursor()
    
    try:
        # Check if status column already exists
        cursor.execute("SHOW COLUMNS FROM orders LIKE 'status'")
        result = cursor.fetchone()
        
        if result:
            print("Status column already exists!")
        else:
            # Add status column with default value 'Pending'
            alter_query = """
                ALTER TABLE orders 
                ADD COLUMN status VARCHAR(20) DEFAULT 'Pending' AFTER datetime
            """
            cursor.execute(alter_query)
            connection.commit()
            print("Successfully added status column to orders table!")
            
            # Update existing orders to have 'Pending' status
            update_query = "UPDATE orders SET status = 'Pending' WHERE status IS NULL"
            cursor.execute(update_query)
            connection.commit()
            print("Updated existing orders with 'Pending' status!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    add_status_column()
