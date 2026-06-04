import requests

response = requests.post(
    "http://127.0.0.1:5000/analyze-route",
    json={
        "origin": "Abadan",
        "destination": "Aden"
    }
)

print(response.status_code)
print(response.text)