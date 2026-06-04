import sys
sys.path.append("c:\\Users\\Kathyayini\\water-ai-dashboard\\backend")
import pandas as pd
from app import calculate_route_analysis_logic, ports_df

print("Ports total count:", len(ports_df))
res = calculate_route_analysis_logic("Shanghai", "Rotterdam", force_high_risk=True)
if res:
    print("Origin:", res["origin"])
    print("Destination:", res["destination"])
    print("Risk:", res["risk"])
    print("Alternative Port:", res["alternative_port"])
    print("Coordinates of Alternative:", res["alternative_coords"])
else:
    print("Result was None")
