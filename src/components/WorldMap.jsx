import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

function WorldMap() {
  return (
    <ComposableMap
      projectionConfig={{
        scale: 140,
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
    >

      <Geographies geography={geoUrl}>

        {({ geographies }) =>
          geographies.map((geo) => (

            <Geography
              key={geo.rsmKey}
              geography={geo}
              style={{
                default: {
                  fill: "#1e293b",
                  stroke: "#0f172a",
                  outline: "none",
                },

                hover: {
                  fill: "#3b82f6",
                  outline: "none",
                },

                pressed: {
                  fill: "#2563eb",
                  outline: "none",
                },
              }}
            />

          ))
        }

      </Geographies>

    </ComposableMap>
  );
}

export default WorldMap;