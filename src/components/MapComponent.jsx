import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { Ship, CloudLightning, ShieldAlert, Navigation, DollarSign, Info } from "lucide-react";

// Recenter component that listens to coordinate updates and fits map bounds
function MapRecenter({ origin, destination, alternative }) {
  const map = useMap();
  
  useEffect(() => {
    const coords = [];
    if (origin && origin.lat && origin.lng) coords.push([origin.lat, origin.lng]);
    if (destination && destination.lat && destination.lng) coords.push([destination.lat, destination.lng]);
    if (alternative && alternative.lat && alternative.lng && (alternative.lat !== destination.lat || alternative.lng !== destination.lng)) {
      coords.push([alternative.lat, alternative.lng]);
    }
    
    if (coords.length > 0) {
      if (coords.length === 1) {
        map.setView(coords[0], 5);
      } else {
        map.fitBounds(coords, { padding: [80, 80], maxZoom: 6 });
      }
    }
  }, [origin, destination, alternative, map]);
  
  return null;
}

// Custom glowing markers
const createGlowingIcon = (colorHex, label, symbol = "⚓") => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: ${colorHex}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${colorHex}; border: 2px solid white; box-shadow: 0 0 12px ${colorHex}; display: flex; align-items: center; justify-content: center; font-size: 8px; color: white; font-weight: bold;">
          ${symbol}
        </div>
        <span style="position: absolute; top: 26px; background-color: rgba(10, 15, 30, 0.95); padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 700; white-space: nowrap; color: #f8fafc; border: 1px solid rgba(255,255,255,0.18); box-shadow: 0 4px 10px rgba(0,0,0,0.5);">${label}</span>
      </div>
      <style>
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      </style>
    `,
    className: "custom-marker-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// SVG Ship Icon that handles rotation
const createShipIcon = (angleHex, pulseColor = "#3b82f6") => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background-color: ${pulseColor}; opacity: 0.25; animation: ship-pulse 1.5s infinite;"></div>
        <div style="transform: rotate(${angleHex}deg); transition: transform 0.1s linear; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 22H22L12 2Z" fill="${pulseColor}" stroke="white" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="12" cy="14" r="2.5" fill="white"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes ship-pulse {
          0% { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    className: "custom-ship-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

function MapComponent({
  originCoords,
  destinationCoords,
  alternativeCoords,
  originName,
  destinationName,
  alternativeName,
  risk,
  riskScore,
  originalCost,
  optimizedCost,
  destIntel,
  altIntel,
  stormZones = []
}) {
  const defaultPosition = [22, 10]; // Global oceanic center
  const defaultZoom = 2;
  
  // Interpolation states for animated ship
  const [shipCoords, setShipCoords] = useState(null);
  const [shipAngle, setShipAngle] = useState(0);
  const [activePath, setActivePath] = useState("optimized"); // 'original' or 'optimized'
  
  const animationFrameRef = useRef(null);
  const tRef = useRef(0);
  
  const isOptimized = risk === "HIGH" && alternativeCoords && 
    (alternativeCoords.lat !== destinationCoords?.lat || alternativeCoords.lng !== destinationCoords?.lng);

  // Decide active path target coordinates
  const getRouteTarget = () => {
    if (activePath === "optimized" && isOptimized && alternativeCoords) {
      return alternativeCoords;
    }
    return destinationCoords;
  };

  useEffect(() => {
    // Reset interpolation parameter on coordinate changes
    tRef.current = 0;
    
    if (originCoords && destinationCoords) {
      const target = getRouteTarget();
      setShipCoords(originCoords);
      
      // Calculate initial angle
      const dx = target.lng - originCoords.lng;
      const dy = target.lat - originCoords.lat;
      const rad = Math.atan2(dy, dx);
      const deg = rad * (180 / Math.PI);
      setShipAngle(90 - deg); // Adjust so 0 points Up/North
    } else {
      setShipCoords(null);
    }
  }, [originCoords, destinationCoords, alternativeCoords, activePath, risk]);

  // Animate ship gliding along polyline
  useEffect(() => {
    if (!originCoords) return;
    
    const animate = () => {
      const target = getRouteTarget();
      if (!target) return;
      
      tRef.current += 0.003; // Smooth speed increments
      if (tRef.current > 1) {
        tRef.current = 0; // Loop ship sailing
      }
      
      const currentLat = originCoords.lat + (target.lat - originCoords.lat) * tRef.current;
      const currentLng = originCoords.lng + (target.lng - originCoords.lng) * tRef.current;
      
      setShipCoords({ lat: currentLat, lng: currentLng });
      
      // Bearing calculation
      const dx = target.lng - originCoords.lng;
      const dy = target.lat - originCoords.lat;
      const rad = Math.atan2(dy, dx);
      const deg = rad * (180 / Math.PI);
      setShipAngle(90 - deg);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [originCoords, destinationCoords, alternativeCoords, activePath, risk]);

  // Decide colors based on risk
  let routeColor = "#10b981"; // Green for LOW
  if (risk === "MEDIUM") {
    routeColor = "#f59e0b"; // Yellow
  } else if (risk === "HIGH") {
    routeColor = "#ef4444"; // Red
  }

  // Active HUD metrics for display overlay
  const activeTargetName = activePath === "optimized" && isOptimized ? alternativeName : destinationName;
  const activeIntel = activePath === "optimized" && isOptimized ? altIntel : destIntel;
  const activeCost = activePath === "optimized" && isOptimized ? optimizedCost : originalCost;

  return (
    <div className="w-full h-full relative" style={{ minHeight: "450px" }}>
      
      {/* Absolute Map Control Overlay (HUD) */}
      {originCoords && destinationCoords && (
        <div className="absolute top-4 right-4 z-[999] bg-[#0c1530]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-72 shadow-[0_4px_25px_rgba(0,0,0,0.5)] text-xs text-white space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-extrabold flex items-center gap-1.5 uppercase text-blue-400">
              <Navigation size={12} className="animate-pulse" />
              Navigation HUD
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
              activePath === "optimized" && isOptimized ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}>
              {activePath === "optimized" && isOptimized ? "Optimized Path" : "Original Path"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <p className="text-gray-400 font-bold uppercase text-[8px]">Transit Risk Score</p>
              <p className={`font-extrabold text-sm ${
                activePath === "optimized" && isOptimized ? "text-emerald-400" : "text-red-400"
              }`}>{activePath === "optimized" && isOptimized ? (riskScore ? Math.max(15, Math.round(riskScore - 32)) : 35) : (riskScore || 75)}/100</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[8px]">Fuel & Logistics Cost</p>
              <p className="font-extrabold text-sm text-purple-400 font-mono">
                ${activeCost?.total ? activeCost.total.toLocaleString() : "--"}
              </p>
            </div>
          </div>

          {/* Toggle buttons to switch paths */}
          {isOptimized && (
            <div className="flex bg-black/30 rounded-xl p-0.5 border border-white/5">
              <button 
                onClick={() => setActivePath("original")}
                className={`flex-1 text-center py-1 rounded-lg font-bold transition-all ${
                  activePath === "original" ? "bg-red-500/25 text-red-400" : "text-gray-400 hover:text-white"
                }`}
              >
                Original (Risky)
              </button>
              <button 
                onClick={() => setActivePath("optimized")}
                className={`flex-1 text-center py-1 rounded-lg font-bold transition-all ${
                  activePath === "optimized" ? "bg-emerald-500/25 text-emerald-400" : "text-gray-400 hover:text-white"
                }`}
              >
                AI Optimized
              </button>
            </div>
          )}

          {/* Dynamic Port Intelligence Hud */}
          {activeIntel && activeIntel.harbor_size && (
            <div className="bg-black/20 rounded-xl p-2.5 border border-white/5 space-y-1.5">
              <p className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Info size={10} className="text-emerald-400" />
                Destination Intelligence
              </p>
              <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[9px] text-gray-300">
                <p>Harbor: <span className="font-bold text-white">{activeIntel.harbor_size}</span></p>
                <p>Type: <span className="font-bold text-white truncate max-w-[80px] inline-block align-bottom">{activeIntel.harbor_type}</span></p>
                <p>Container Cap: <span className={activeIntel.container_facilities === "Yes" ? "text-emerald-400" : "text-red-400"}>{activeIntel.container_facilities}</span></p>
                <p>Capacity Ind: <span className="text-blue-400 font-mono">{activeIntel.port_capacity_pct}%</span></p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actual Map Container */}
      <MapContainer
        center={defaultPosition}
        zoom={defaultZoom}
        style={{ width: "100%", height: "100%", borderRadius: "1.5rem" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />
        
        {/* Origin Port Marker */}
        {originCoords && (
          <Marker 
            position={[originCoords.lat, originCoords.lng]} 
            icon={createGlowingIcon("#3b82f6", originName || "Origin", "🛫")}
          >
            <Popup>
              <div className="text-slate-900 font-semibold p-1">
                <h4 className="font-bold border-b pb-1 mb-1 text-blue-600">Origin Departure</h4>
                <p>{originName || "Origin Port"}</p>
                <p className="text-xs text-slate-500 font-normal">Lat: {originCoords.lat.toFixed(4)}, Lng: {originCoords.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Destination Port Marker */}
        {destinationCoords && (
          <Marker 
            position={[destinationCoords.lat, destinationCoords.lng]} 
            icon={createGlowingIcon(isOptimized ? "#ef4444" : routeColor, destinationName || "Destination", isOptimized ? "🚨" : "⚓")}
          >
            <Popup>
              <div className="text-slate-900 font-semibold p-1">
                <h4 className="font-bold border-b pb-1 mb-1 text-red-500">Original Destination</h4>
                <p>{destinationName || "Destination Port"}</p>
                <p className="text-xs text-slate-500 font-normal">Lat: {destinationCoords.lat.toFixed(4)}, Lng: {destinationCoords.lng.toFixed(4)}</p>
                {destIntel && (
                  <p className="text-xs text-slate-600 font-normal mt-1 border-t pt-1">
                    Harbor Size: {destIntel.harbor_size}<br />
                    Capacity Load: {destIntel.port_capacity_pct}%
                  </p>
                )}
                <p className="text-xs font-extrabold mt-1 text-red-500">Risk Assessment: HIGH RISK ({riskScore || 75}/100)</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Alternative Port Marker */}
        {isOptimized && alternativeCoords && (
          <Marker 
            position={[alternativeCoords.lat, alternativeCoords.lng]} 
            icon={createGlowingIcon("#10b981", alternativeName || "Alternative", "✅")}
          >
            <Popup>
              <div className="text-slate-900 font-semibold p-1">
                <h4 className="font-bold border-b pb-1 mb-1 text-emerald-600">AI Alternative Hub (Optimized)</h4>
                <p>{alternativeName || "Alternative Port"}</p>
                <p className="text-xs text-slate-500 font-normal">Lat: {alternativeCoords.lat.toFixed(4)}, Lng: {alternativeCoords.lng.toFixed(4)}</p>
                {altIntel && (
                  <p className="text-xs text-slate-600 font-normal mt-1 border-t pt-1">
                    Harbor Size: {altIntel.harbor_size}<br />
                    Capacity Load: {altIntel.port_capacity_pct}%
                  </p>
                )}
                <p className="text-xs text-emerald-500 font-extrabold mt-1">Recommended Optimization Endpoint</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route Lines */}
        {originCoords && destinationCoords && (
          <Polyline
            positions={[
              [originCoords.lat, originCoords.lng],
              [destinationCoords.lat, destinationCoords.lng]
            ]}
            pathOptions={{
              color: isOptimized ? "#ef4444" : routeColor,
              weight: isOptimized && activePath === "optimized" ? 2 : 4,
              opacity: isOptimized && activePath === "optimized" ? 0.4 : 0.85,
              dashArray: isOptimized ? "5, 10" : undefined
            }}
          />
        )}
        
        {isOptimized && originCoords && alternativeCoords && (
          <Polyline
            positions={[
              [originCoords.lat, originCoords.lng],
              [alternativeCoords.lat, alternativeCoords.lng]
            ]}
            pathOptions={{
              color: "#10b981",
              weight: activePath === "optimized" ? 5 : 2,
              opacity: activePath === "optimized" ? 0.95 : 0.4,
              dashArray: activePath === "original" ? "10, 5" : undefined
            }}
          />
        )}

        {/* Animated Ship Marker */}
        {shipCoords && (
          <Marker
            position={[shipCoords.lat, shipCoords.lng]}
            icon={createShipIcon(shipAngle, activePath === "optimized" && isOptimized ? "#10b981" : (isOptimized ? "#ef4444" : routeColor))}
          >
            <Popup>
              <div className="text-slate-900 font-semibold p-1">
                <h4 className="font-bold border-b pb-1 mb-1 text-blue-600 flex items-center gap-1">
                  <Ship size={12} className="animate-spin" />
                  Live Vessel Tracking
                </h4>
                <p className="text-xs text-slate-600">Navigating lane towards {activeTargetName}</p>
                <p className="text-xs font-mono mt-1 text-purple-600">Heading: {Math.round(shipAngle)}° NNE</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Weather Intelligence Layer (Storm Zones) */}
        {stormZones && stormZones.map((zone) => {
          const stormColor = zone.severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
          return (
            <Circle
              key={zone.id}
              center={[zone.center_lat, zone.center_lng]}
              radius={zone.radius_km * 1000} // convert km to meters
              pathOptions={{
                color: stormColor,
                fillColor: stormColor,
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: "4, 6"
              }}
            >
              <Popup>
                <div className="text-slate-900 p-1 font-semibold max-w-[200px]">
                  <h4 className={`font-bold border-b pb-1 mb-1 flex items-center gap-1.5 ${
                    zone.severity === "CRITICAL" ? "text-red-500" : "text-amber-500"
                  }`}>
                    <CloudLightning size={14} className="animate-bounce" />
                    {zone.name}
                  </h4>
                  <p className="text-[11px] font-normal leading-relaxed text-slate-700">{zone.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">Severity: {zone.severity}</p>
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        {/* Map Recenter Controller */}
        <MapRecenter 
          origin={originCoords} 
          destination={destinationCoords} 
          alternative={alternativeCoords} 
        />
      </MapContainer>
    </div>
  );
}

export default MapComponent;
