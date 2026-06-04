import pandas as pd

# Load dataset
df = pd.read_csv(r"C:\Users\Kathyayini\water-ai-dashboard\backend\supply_chain_data.csv")

# Create Risk Score
df["Risk_Score"] = (
    0.4 * df["Defect rates"] +
    0.3 * df["Lead times"] +
    0.3 * (1 / (df["Stock levels"] + 1))
)

# Threshold
threshold = df["Risk_Score"].median()

# Create Target Variable
df["Risk"] = (df["Risk_Score"] > threshold).astype(int)

# Save new dataset
df.to_csv(
    r"C:\Users\Kathyayini\water-ai-dashboard\backend\supply_chain_risk.csv",
    index=False
)

print("Risk column created successfully!")