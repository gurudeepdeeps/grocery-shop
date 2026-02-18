from flask import Flask, request, jsonify
from flask_cors import CORS
from sql_connection import get_sql_connection
import mysql.connector
import json

import products_dao
import orders_dao
import uom_dao
import users_dao

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/getUOM', methods=['GET'])
def get_uom():
    connection = get_sql_connection()
    response = uom_dao.get_uoms(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getProducts', methods=['GET'])
def get_products():
    connection = get_sql_connection()
    response = products_dao.get_all_products(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/insertProduct', methods=['POST'])
def insert_product():
    request_payload = json.loads(request.form['data'])
    connection = get_sql_connection()
    product_id = products_dao.insert_new_product(connection, request_payload)
    response = jsonify({
        'product_id': product_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/updateProduct', methods=['POST'])
def update_product():
    request_payload = json.loads(request.form['data'])
    connection = get_sql_connection()
    product_id = products_dao.update_product(connection, request_payload)
    response = jsonify({
        'product_id': product_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getAllOrders', methods=['GET'])
def get_all_orders():
    connection = get_sql_connection()
    response = orders_dao.get_all_orders(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/insertOrder', methods=['POST'])
def insert_order():
    request_payload = json.loads(request.form['data'])
    connection = get_sql_connection()
    order_id = orders_dao.insert_order(connection, request_payload)
    response = jsonify({
        'order_id': order_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    connection = get_sql_connection()
    return_id = products_dao.delete_product(connection, request.form['product_id'])
    response = jsonify({
        'product_id': return_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/updateOrderStatus', methods=['POST'])
def update_order_status():
    connection = get_sql_connection()
    order_id = request.form['order_id']
    status = request.form['status']
    return_id = orders_dao.update_order_status(connection, order_id, status)
    response = jsonify({
        'order_id': return_id,
        'status': status
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/login', methods=['POST'])
def login():
    connection = get_sql_connection()
    email = request.form['email']
    password = request.form['password']

    user = users_dao.validate_user(connection, email, password)
    if not user:
        response = jsonify({
            'error': 'Invalid credentials'
        })
        response.status_code = 401
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    response = jsonify({
        'user_id': user['user_id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role']
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/deleteOrder', methods=['POST'])
def delete_order():
    connection = get_sql_connection()
    order_id = request.form['order_id']
    return_id = orders_dao.delete_order(connection, order_id)
    response = jsonify({
        'order_id': return_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting Python Flask Server For Grocery Store Management System")
    app.run(port=5000)

