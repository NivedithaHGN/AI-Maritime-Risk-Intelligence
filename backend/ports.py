import pandas as pd

ports = pd.read_csv(r"C:\Users\Kathyayini\water-ai-dashboard\backend\UpdatedPub150.csv")

print(ports[[
    "Main Port Name",
    "Country Code",
    "Latitude",
    "Longitude"
]].head())