import psycopg2
from os import environ
from dotenv import load_dotenv

load_dotenv()

def execute_select_query(query):
    connection = psycopg2.connect(database=environ['DATA_BASE_NAME'], 
                                user=environ['DATA_BASE_USER'],
                                host=environ['DATA_BASE_URL'],
                                password=environ['DATA_BASE_PASSWORD'],
                                port=environ['DATA_BASE_PORT'])

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