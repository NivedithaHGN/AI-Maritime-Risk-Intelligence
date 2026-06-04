import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
df = pd.read_csv("supply_chain_risk.csv")

# Features
X = df[
    [
        "Stock levels",
        "Lead times",
        "Shipping costs",
        "Manufacturing costs",
        "Defect rates"
    ]
]

# Target
y = df["Risk"]

# Train Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Create Model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Predict
predictions = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, predictions)

print(f"Accuracy: {accuracy*100:.2f}%")

# Save Model
joblib.dump(model, "risk_model.pkl")

print("Model saved successfully!")