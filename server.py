from flask import Flask, request, jsonify, send_file
import pandas as pd
import os
from datetime import datetime
import json

app = Flask(__name__)

# Create orders directory if it doesn't exist
if not os.path.exists('orders'):
    os.makedirs('orders')

# Excel file path
EXCEL_FILE = 'orders/maisonya_orders.xlsx'

def initialize_excel_file():
    """Initialize Excel file with headers if it doesn't exist"""
    if not os.path.exists(EXCEL_FILE):
        # Create initial DataFrame with columns
        columns = [
            'رقم الطلب',
            'التاريخ والوقت',
            'اسم العميل',
            'رقم الهاتف',
            'العنوان',
            'الملاحظات',
            'المنتجات',
            'المبلغ الإجمالي (DH)',
            'حالة الطلب'
        ]
        df = pd.DataFrame(columns=columns)
        df.to_excel(EXCEL_FILE, index=False, engine='openpyxl')
        print(f"Created new Excel file: {EXCEL_FILE}")

def save_order_to_excel(order_data):
    """Save order data to Excel file"""
    try:
        # Read existing Excel file
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        else:
            initialize_excel_file()
            df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
        
        # Prepare new row
        new_row = {
            'رقم الطلب': order_data['orderNumber'],
            'التاريخ والوقت': order_data['date'],
            'اسم العميل': order_data['customerName'],
            'رقم الهاتف': order_data['phone'],
            'العنوان': order_data['address'],
            'الملاحظات': order_data['notes'],
            'المنتجات': ', '.join(order_data['items']),
            'المبلغ الإجمالي (DH)': order_data['totalAmount'],
            'حالة الطلب': 'جديد'
        }
        
        # Append new row
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        
        # Save back to Excel
        df.to_excel(EXCEL_FILE, index=False, engine='openpyxl')
        
        print(f"Order {order_data['orderNumber']} saved successfully to Excel")
        return True
        
    except Exception as e:
        print(f"Error saving order to Excel: {str(e)}")
        return False

@app.route('/')
def index():
    """Serve the main website"""
    return send_file('index.html')

@app.route('/save-order', methods=['POST'])
def save_order():
    """API endpoint to save order to Excel"""
    try:
        order_data = request.json
        
        # Validate required fields
        required_fields = ['orderNumber', 'date', 'customerName', 'phone', 'address', 'totalAmount']
        for field in required_fields:
            if field not in order_data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Save to Excel
        success = save_order_to_excel(order_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': f'Order {order_data["orderNumber"]} saved successfully',
                'orderNumber': order_data['orderNumber']
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to save order to Excel'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/orders')
def get_orders():
    """API endpoint to get all orders (for admin)"""
    try:
        if os.path.exists(EXCEL_FILE):
            df = pd.read_excel(EXCEL_FILE, engine='openpyxl')
            orders = df.to_dict('records')
            return jsonify({
                'success': True,
                'orders': orders,
                'total': len(orders)
            })
        else:
            return jsonify({
                'success': True,
                'orders': [],
                'total': 0
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/download-orders')
def download_orders():
    """Download the Excel file with all orders"""
    try:
        if os.path.exists(EXCEL_FILE):
            return send_file(
                EXCEL_FILE,
                as_attachment=True,
                download_name=f'maisonya_orders_{datetime.now().strftime("%Y%m%d")}.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        else:
            return jsonify({
                'success': False,
                'error': 'No orders file found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/admin')
def admin_panel():
    """Simple admin panel to view orders"""
    admin_html = """
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم Maisonya - إدارة الطلبات</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f5f5f5;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #6c63ff;
                text-align: center;
                margin-bottom: 30px;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: linear-gradient(135deg, #6c63ff, #ff6ec7);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-card h3 {
                margin: 0 0 10px 0;
                font-size: 2em;
            }
            .actions {
                text-align: center;
                margin-bottom: 30px;
            }
            .btn {
                background: #6c63ff;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
            </style>
    </head>
    <body>
        <div class="container">
            <h1>🛒 لوحة تحكم Maisonya</h1>
            
            <div class="stats" id="stats">
                <div class="stat-card">
                    <h3 id="total-orders">0</h3>
                    <p>إجمالي الطلبات</p>
                </div>
                <div class="stat-card">
                    <h3 id="total-revenue">0 DH</h3>
                    <p>إجمالي الإيرادات</p>
                </div>
            </div>
            
            <div class="actions">
                <button class="btn" onclick="downloadOrders()">📥 تحميل ملف Excel</button>
                <button class="btn" onclick="refreshData()">🔄 تحديث البيانات</button>
            </div>
            
            <div id="orders-table"></div>
        </div>
        
        <script>
            async function loadData() {
                try {
                    const response = await fetch('/orders');
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('total-orders').textContent = data.total;
                        
                        const totalRevenue = data.orders.reduce((sum, order) => {
                            return sum + parseFloat(order['المبلغ الإجمالي (DH)'] || 0);
                        }, 0);
                        document.getElementById('total-revenue').textContent = totalRevenue.toFixed(2) + ' DH';
                        
                        // Display orders table
                        let tableHTML = '<h2>جميع الطلبات</h2><table border="1" style="width:100%; border-collapse: collapse;">';
                        tableHTML += '<tr style="background: #6c63ff; color: white;">';
                        tableHTML += '<th>رقم الطلب</th><th>التاريخ</th><th>اسم العميل</th><th>الهاتف</th><th>المنتجات</th><th>المبلغ</th><th>الحالة</th>';
                        tableHTML += '</tr>';
                        
                        data.orders.forEach(order => {
                            tableHTML += '<tr>';
                            tableHTML += `<td>${order['رقم الطلب']}</td>`;
                            tableHTML += `<td>${order['التاريخ والوقت']}</td>`;
                            tableHTML += `<td>${order['اسم العميل']}</td>`;
                            tableHTML += `<td>${order['رقم الهاتف']}</td>`;
                            tableHTML += `<td>${order['المنتجات']}</td>`;
                            tableHTML += `<td>${order['المبلغ الإجمالي (DH)']} DH</td>`;
                            tableHTML += `<td>${order['حالة الطلب']}</td>`;
                            tableHTML += '</tr>';
                        });
                        
                        tableHTML += '</table>';
                        document.getElementById('orders-table').innerHTML = tableHTML;
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }
            
            function downloadOrders() {
                window.open('/download-orders', '_blank');
            }
            
            function refreshData() {
                loadData();
            }
            
            // Load data when page loads
            loadData();
        </script>
    </body>
    </html>
    """
    return admin_html

if __name__ == '__main__':
    initialize_excel_file()
    print("🚀 Maisonya E-Commerce Server Starting...")
    print("📁 Excel file will be saved in: orders/maisonya_orders.xlsx")
    print("🌐 Website available at: http://localhost:8050")
    print("🔧 Admin panel available at: http://localhost:8050/admin")
    app.run(host='0.0.0.0', port=8050, debug=True)