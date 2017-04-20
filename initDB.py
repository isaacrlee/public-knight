import requests
import json

with open('knight.json') as data:
    ORGS = json.load(data)

URL = "http://localhost:5000/orgs"
HEAD = {"Content-Type":"application/x-www-form-urlencoded"}

for org in ORGS:
    url = "http://localhost:5000/orgs"
    header = {"Content-Type":"application/x-www-form-urlencoded"}
    try:
        response = requests.post(URL, headers=HEAD, data=org)
        print org['org_name'] + ' added'
    except requests.exceptions.RequestException as e:
        print e
