import json
import os
import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def parse_input(file):

    with open(os.path.join(os.getcwd(),'mockdata', file)) as f:
        data = json.load(f)
    return data


def get_bearer():
    url = "https://articonf1.itec.aau.at:30401/api/tokens"
    body = {"username":"regular@itec.aau.at","password":"2bViezK0Tst2LzsTIXix"}

    response = requests.post(url, json=body, verify=False)
    bearer = eval(response.text)['token']
    return bearer

def submit_transaction(transaction, bearer):
    url = "https://articonf1.itec.aau.at:30401/api/trace"
    headers = {"Authorization": "Bearer "+bearer}
    response = requests.post(url, json=transaction, headers=headers, verify=False)
    if response.status_code != 201:
        print("Error processing ", transaction)
    else:
        print (response.status_code)






#print(json.dumps(transactions, indent=4, sort_keys=True))


#LOGIN

bearer = get_bearer()

for mock_file in os.listdir(os.path.join(os.getcwd(),'mockdata')):
    
    transactions=parse_input(mock_file)

    ##SUBMIT TRANSACTION
    for transaction in transactions:
        print(json.dumps(transaction, indent=4, sort_keys=True))
        submit_transaction(transaction, bearer)