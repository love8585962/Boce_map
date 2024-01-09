from flask import Flask, render_template, request, session, redirect, url_for, jsonify
import requests
import json
import time

# 節點ID設置
# 電信ip_id
telecom_ip_id = '6,12,24,30,36,42,48,54,60,66,72,84,90,96,102,108,114,120,126,132,138,144,150,156,162,168,174,180,80930,80967,81054'
# 聯通ip_id
unicom_ip_id = '152,8,14,20,26,32,38,62,74,80,86,92,98,104,110,116,122,128,134,146,164'
# 移動ip_id
mobile_ip_id = '139,7,13,19,25,31,37,43,49,55,61,67,73,79,85,91,97,103,115,121,127,133,145,151,157,163,169,181,80980,81016,81025'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
}

# 設置路徑
app = Flask(__name__, template_folder=r'/var/www/html/Boce', static_folder=r'/var/www/html/Boce')
app.secret_key = 'bWPcBVmEkW3Jsrm8FjnPG7CVoxC5my'

proxy = {'http': 'http://10.10.10.240:3128', 'https': 'http://10.10.10.240:3128'}

def boce(domain, network_types):
    ip_id = None

    selected_ip_ids = []
    for network_type in network_types:
        if network_type == 'telecom':
            selected_ip_ids.append(telecom_ip_id)
        elif network_type == 'unicom':
            selected_ip_ids.append(unicom_ip_id)
        elif network_type == 'mobile':
            selected_ip_ids.append(mobile_ip_id)

    # 合併所有選中的節點ID
    ip_id = ','.join(selected_ip_ids)

    url = f'https://api.boce.com/v3/task/create/curl?key=這邊要替換成api key&node_ids={ip_id}&host={domain}'
    response = requests.get(url, headers=headers, proxies=proxy)
    if response.status_code == 200:
        data = json.loads(response.text)
        if 'data' in data and 'id' in data['data']:
            return data['data']['id']
        else:
            return None
    else:
        return None

def get_json_from_url(id_value):
    # 這裡要替換成boce的api key
    url = f'https://api.boce.com/v3/task/curl/{id_value}?key=這邊要替換成api key'
    print(url)
    response = requests.get(url, headers=headers, proxies=proxy)
    return json.loads(response.text) if response.status_code == 200 else None

# 調整地圖顏色
@app.template_filter('color_by_time')
def color_by_time_filter(time_total):
    try:
        time = float(time_total)
        if time == 0:
            return 'color-red'
    except ValueError:
        return 'color-gray'
    if time < 1.5:
        return 'color-green'
    elif time < 2.5:
        return 'color-light-green'
    elif time < 3.5:
        return 'color-beige'
    elif time < 4.5:
        return 'color-orange'
    else:
        return 'color-red'

# 從結果中取出 檢測的電信名、域名、域名IP、節點IP、總時間
@app.route('/Boce', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        domain = request.form.get('domain')
        network_types = []
        
        if 'telecom' in request.form:
            network_types.append('telecom')
        if 'unicom' in request.form:
            network_types.append('unicom')
        if 'mobile' in request.form:
            network_types.append('mobile')

        if domain and network_types:
            id_value = boce(domain, network_types)
            print(id_value)
            if id_value:
                time.sleep(30)
                json_data = get_json_from_url(id_value)
                results = []
                for item in json_data.get('list', []):
                    if item.get('node_name'):
                        results.append({
                            "node_name": item.get('node_name', 'N/A'),
                            "host": item.get('host', 'N/A'),
                            "origin_ip": item.get('origin_ip', 'N/A'),
                            "remote_ip": item.get('remote_ip', 'N/A'),
                            "time_total": item.get('time_total', 'N/A')
                        })
                session['results'] = results
                return redirect(url_for('index'))
    # return 到 html
    results = session.get('results', [])
    return render_template('index.html', results=results)


@app.route('/Boce/get-results', methods=['GET'])
def get_results():
    results = session.pop('results', [])
    return jsonify(results)

