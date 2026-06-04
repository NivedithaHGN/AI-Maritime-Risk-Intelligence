import pandas as pd

df = pd.read_csv(r"C:\Users\Kathyayini\water-ai-dashboard\backend\supply_chain_risk.csv")
print("Transportation Modes:")
print(df["Transportation modes"].unique())

print("\nInspection Results:")
print(df["Inspection results"].unique())

print("\nSupplier Names:")
print(df["Supplier name"].unique())

