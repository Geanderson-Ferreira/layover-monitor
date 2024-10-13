from flask import Flask, flash, render_template, request, redirect, url_for, session
import json
from src.ta_functions import get_ta_session, get_reservations
from src.SQL_Functions import execute_select_query
from datetime import datetime


app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['PERMANENT_SESSION_LIFETIME'] = 900

# Tela de Login
@app.route('/')
def login():
    return render_template('login.html')

# Endpoint para Requisição de Login
@app.route('/login', methods=['POST'])
def do_login():
    username = request.form['username']
    password = request.form['password']

    try:
        dados = get_ta_session(username, password)
        if dados['auth']:

            session['user'] = username
            session['password'] = password
            session['logged_in'] = True

            return redirect(url_for('index'))
        else:
            flash('Credenciais incorretas ou não permitidas.', 'danger')
            return redirect(url_for('login'))
    except Exception as e:
        print(e)
        flash(f'Credenciais incorretas ou não permitidas.', 'danger')
        return redirect(url_for('login'))


# Endpoint para Requisição de Logout
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

# Tela dos botões, escolha o relatório
@app.route('/index', methods=['GET', 'POST'])
def index():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    else:

        return render_template('index.html') 



# Endpoint para Requisição de dados
@app.route('/get-dados', methods=['GET'])
def get_data():
                
    arrivalDate = request.args.get('checkin')
    departureDate = request.args.get('checkout')

    try:
        arrivalDate = datetime.strptime(arrivalDate, '%Y-%m-%d')
    except:
        arrivalDate = None

    try:
        departureDate = datetime.strptime(departureDate, '%Y-%m-%d')
    except:
        departureDate = None


    ta_session = get_ta_session(session['user'], session['password'])

    if ta_session['auth']:
        dados = get_reservations(session=ta_session['session'], disFrom=arrivalDate, disTo=departureDate)
    else:
        dados = []

    dados = [ x for x in dados['results']]

    for dado in dados:

        q = f"""
                SELECT voucher_id, resv_confirmation, hotel_id, created_at, reserva_json
                FROM atrio.reservasimportadaslayover where voucher_id ='{dado['voucher_id']}'
            """
        
        consulta = execute_select_query(q)

        if len(consulta) > 0:
            dado['status_opera'] = True
        else:
            dado['status_opera'] = False
    
    if dados:
        return dados
    else:
        return {}


# Roda o server
if __name__ == '__main__':
    app.run(debug=True)
