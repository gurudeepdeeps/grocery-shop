from sql_connection import get_sql_connection

def test_orders():
    connection = get_sql_connection()
    cursor = connection.cursor()
    
    # First, let's see what columns exist
    cursor.execute("SHOW COLUMNS FROM orders")
    print("Columns in orders table:")
    for column in cursor:
        print(f"  - {column[0]} ({column[1]})")
    
    print("\nFetching orders:")
    cursor.execute("SELECT * FROM orders")
    
    # Get column names
    columns = [desc[0] for desc in cursor.description]
    print(f"Query returned columns: {columns}")
    
    # Fetch all rows
    rows = cursor.fetchall()
    print(f"Number of rows: {len(rows)}")
    
    if rows:
        print(f"First row: {rows[0]}")
        print(f"Number of fields in first row: {len(rows[0])}")
    
    cursor.close()
    connection.close()

if __name__ == '__main__':
    test_orders()
