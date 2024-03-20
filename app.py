from flask import Flask, request, jsonify, send_from_directory
import sqlite3, os

app = Flask(__name__)

# Rota para servir o arquivo index.html
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Rota para servir arquivos estáticos (CSS, JS)
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

if __name__ == '__main__':
    app.run(debug=True)

# Criação do banco de dados e tabela, se não existirem
conn = sqlite3.connect('transactions.db')
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        amount FLOAT,
        category TEXT,
        type TEXT
    )
''')
conn.commit()
conn.close()

@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    data = request.json
    description = data['description']
    amount = data['amount']
    category = data['category']
    transaction_type = data['type']

    conn = sqlite3.connect('transactions.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO transactions (description, amount, category, type)
        VALUES (?, ?, ?, ?)
    ''', (description, amount, category, transaction_type))
    conn.commit()
    conn.close()

    return 'Transação adicionada com sucesso!'

@app.route('/transactions', methods=['GET'])
def get_transactions():
    transaction_type = request.args.get('type')
    period = request.args.get('period')  # Adicionando a obtenção do período

    conn = sqlite3.connect('transactions.db')
    cursor = conn.cursor()

    if transaction_type:
        if period:
            cursor.execute('''
                SELECT * FROM transactions WHERE type = ? AND strftime('%Y-%m', date('now')) = ?
            ''', (transaction_type, period))

        else:
            cursor.execute('''
                SELECT * FROM transactions WHERE type = ?
            ''', (transaction_type,))
    else:
        cursor.execute('''
            SELECT * FROM transactions
        ''')

    transactions_data = cursor.fetchall()
    conn.close()

    transactions = []
    for transaction in transactions_data:
        transactions.append({
            'id': transaction[0],
            'description': transaction[1],
            'amount': transaction[2],
            'category': transaction[3],
            'type': transaction[4]
        })

    return jsonify(transactions)

if __name__ == '__main__':
    app.run(debug=True)
