with open("c:/Users/Kathyayini/water-ai-dashboard/src/pages/Dashboard.jsx", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "alert" in line.lower() or "analytic" in line.lower() or "kpi" in line.lower():
        print(f"{i+1}: {line.strip()}")
