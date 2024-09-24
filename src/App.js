import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [occupancy, setOccupancy] = useState(null);
  const [occupancyHistory, setOccupancyHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the RMS value from the backend
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const response = await axios.get(
          "https://a702-134-241-33-1.ngrok-free.app/api/occupancy/api/occupancy"
        );
        const { resOccupancy, resOccupancyHistory } = response.data;
        setOccupancy(resOccupancy);
        setOccupancyHistory(resOccupancyHistory);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching occupancy data:", error);
        setIsLoading(false);
      }
    };

    fetchOccupancy();
  }, []);

  console.log(occupancyHistory);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6 text-black text-center">
        McCarthy Center Dining Hall - Occupancy Tracker
      </h1>
      {isLoading ? (
        <p className="text-lg text-black">Loading occupancy data...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 w-80 mb-48 md:w-3/5">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Estimated Occupancy Level
          </h2>
          <div className="text-5xl font-bold mb-2 text-[#fdb710]">
            {Math.round(occupancy)}%
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
            <div
              className="h-6 rounded-full"
              style={{
                width: `${Math.round(occupancy)}%`,
                backgroundColor: occupancy >= 70 ? "#fdb710" : "black",
              }}
            ></div>
          </div>

          <p className="text-black">
            This is the current estimated busyness of the dining hall based on
            noise levels. Last 5 readings:{" "}
            {occupancyHistory.map((value) => {
              return value + "%, ";
            })}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
