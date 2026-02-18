import datetime
import mysql.connector

def get_sql_connection():
    # Create a new connection for each request
    connection = mysql.connector.connect(
        host='127.0.0.1',
        user='root',
        password='root',
        database='grocery_store',
        autocommit=True
    )
    
    return connection

