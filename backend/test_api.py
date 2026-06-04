import requests

response = requests.post(
    "http://127.0.0.1:5000/predict",
    json={
        "stock_level": 50,
        "lead_time": 10,
        "shipping_cost": 500,
        "manufacturing_cost": 300,
        "defect_rate": 2.5
    }
)

print(response.json())