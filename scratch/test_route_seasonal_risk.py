import requests

def test_seasonal_risk():
    url = "http://127.0.0.1:5000/analyze-route"
    
    # 1. April simulation
    print("Testing Shanghai -> Rotterdam in April...")
    resp_april = requests.post(url, json={
        "origin": "Shanghai",
        "destination": "Rotterdam",
        "month": "April"
    })
    if resp_april.status_code == 200:
        data = resp_april.json()
        print(f"April Result:")
        print(f"  Risk Score: {data.get('risk_score')}")
        print(f"  Risk Rating: {data.get('risk')}")
        print(f"  Alternative Port: {data.get('alternative_port')}")
        print(f"  Explanation: {data.get('explanation')}")
    else:
        print(f"Failed to query April route: {resp_april.status_code} {resp_april.text}")

    print("\n" + "="*50 + "\n")

    # 2. August simulation
    print("Testing Shanghai -> Rotterdam in August...")
    resp_august = requests.post(url, json={
        "origin": "Shanghai",
        "destination": "Rotterdam",
        "month": "August"
    })
    if resp_august.status_code == 200:
        data = resp_august.json()
        print(f"August Result:")
        print(f"  Risk Score: {data.get('risk_score')}")
        print(f"  Risk Rating: {data.get('risk')}")
        print(f"  Alternative Port: {data.get('alternative_port')}")
        print(f"  Explanation: {data.get('explanation')}")
    else:
        print(f"Failed to query August route: {resp_august.status_code} {resp_august.text}")

if __name__ == "__main__":
    test_seasonal_risk()
