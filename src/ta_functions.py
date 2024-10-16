import requests
from datetime import datetime, timedelta


def get_reservations(session, disFrom=None, disTo=None):

    if disFrom is None:
        disFrom = datetime.today()

    if disTo is None:
        disTo = datetime.today()

    page = 1
    results = []
    still_results = True

    while still_results:
    
        # URL base com placeholders para as datas dinâmicas
        url = f"https://stormx.tvlinc.com/admin/hotel_guest_activity.php?type=search&pid=&aid=&tid=&hid=&iid=&vid=&disFlight=&names=&depFrom=&depTo=&vtype=&ptype=&status=&cid=&pnr=&uid=&noShow=0&sortBy=0&&perPage=90&charged="
        

        params = {
            'disFrom': disFrom,
            'disTo':disTo,
            'page':page
        }
        # Payload vazio, pois estamos usando GET
        payload = {}

        # Cabeçalhos
        headers = {
            'X-TVA-Internal': '1'
        }

        try:
            # Faz a requisição GET
            response = session.get(url, headers=headers, params=params)

            # Verifica se a requisição foi bem-sucedida
            if response.ok:
                content = response.json()

                recTo = int(response.json().get('pagi',{}).get('recTo', 0))

                if recTo != 0:
                    still_results = True
                    results.extend(response.json()['results'])
                    page += 1

                if recTo == 0:
                    still_results = False
                    content = response.json()
                    content['results'] = results
                    return content


            else:
                still_results = False
                print("Erro ao obter reservas")
                return False   
        
        except Exception as error:
            still_results = False
            print(f"Erro ao obter reservas {error}")


def get_ta_session(username, password):

    # Cria uma sessão
    session = requests.Session()

    # URL do login
    url = "https://stormx.tvlinc.com/admin/index.php"

    # Payload convertido em dicionário
    payload = {
        'cPwd': '',
        'continue': 'admin/main_menu.php',
        'forgot_username': '',
        'mode': 'login',
        'nPwd': '',
        'pex': '',
        'rPwd': '',
        'token': '',
        'uID': username,
        'uPwd': password
    }

    # Cabeçalhos
    headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'host': 'stormx.tvlinc.com'
    }

    try:
        response = session.post(url, headers=headers, data=payload)
        if response.ok:

            result = get_reservations(session)

            login_error = result.get('loginError', False)

            if login_error:
                return {"auth": False}
            else:
                return {"auth": True, "session": session}
        
        else:
            print(f"Erro ao logar na travel alliance.")
            return False
    except Exception as error:
        print(f"Erro ao obter a sessão StormX: {error}.")
        return False


