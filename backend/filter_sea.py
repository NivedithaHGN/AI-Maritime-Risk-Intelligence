import pandas as pd

df = pd.read_csv(r"C:\Users\Kathyayini\water-ai-dashboard\backend\supply_chain_risk.csv")

sea_df = df[df["Transportation modes"] == "Sea"]

print("Total Sea Records:", len(sea_df))