import psycopg
from os import environ
from dotenv import load_dotenv

load_dotenv()

def execute_select_query(query):
    # connection = psycopg.connect(database=environ['DATA_BASE_NAME'], 
    #                             user=environ['DATA_BASE_USER'],
    #                             host=environ['DATA_BASE_URL'],
    #                             password=environ['DATA_BASE_PASSWORD'],
    #                             port=environ['DATA_BASE_PORT'])

    # cursor = connection.cursor()

    DATA_BASE_NAME = environ.get('DATA_BASE_NAME')
    DATA_BASE_USER = environ.get('DATA_BASE_USER')
    DATA_BASE_URL = environ.get('DATA_BASE_URL')
    DATA_BASE_PASSWORD = environ.get('DATA_BASE_PASSWORD')
    DATA_BASE_PORT = environ.get('DATA_BASE_PORT')

    # Estabelecendo a conexão com o banco de dados
    connection = psycopg.connect(
        f"dbname={DATA_BASE_NAME} user={DATA_BASE_USER} password={DATA_BASE_PASSWORD} host={DATA_BASE_URL} port={DATA_BASE_PORT}"
    )
    cursor = connection.cursor()

    # print("Banco de dados conectado.")
    # print(f"Executando query: {query}")

    cursor.execute(query)
    rows = cursor.fetchall()
    data = rows
    cursor.close()

    connection.close()
    # print("Banco de dados Fechado.")

    return data