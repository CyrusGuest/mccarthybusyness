import React, { useState, useEffect } from "react";
import axios from "axios";

// Define the dining hall schedule
const schedule = {
  mondayToThursday: {
    breakfast: ["07:30", "10:30"],
    lunch: ["11:30", "14:30"],
    dinner: ["16:30", "19:30"],
  },
  friday: {
    breakfast: ["07:30", "10:30"],
    lunch: ["11:30", "14:30"],
    dinner: ["16:30", "19:00"],
  },
  weekend: {
    brunch: ["09:30", "14:30"],
    dinner: ["16:30", "19:00"],
  },
};

// Helper function to convert 24-hour time to 12-hour time
const formatTime12Hour = (time24) => {
  const [hour, minute] = time24.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

function App() {
  const [occupancy, setOccupancy] = useState(null);
  const [occupancyHistory, setOccupancyHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextOpeningTime, setNextOpeningTime] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const response = await axios.get(
          "https://6683-134-241-225-84.ngrok-free.app/api/occupancy",
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const { resOccupancy, resOccupancyHistory } = response.data;
        setOccupancy(34);
        setOccupancyHistory([30, 31, 30, 33, 34]);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching occupancy data:", error);
        setIsLoading(false);
      }
    };

    fetchOccupancy();
    checkSchedule();
  }, []);

  const checkSchedule = () => {
    const now = new Date();
    const day = now.getDay();
    const time = now.getHours() * 60 + now.getMinutes(); // Time in minutes from 00:00

    let currentSchedule = {};
    if (day >= 1 && day <= 4) {
      currentSchedule = schedule.mondayToThursday;
    } else if (day === 5) {
      currentSchedule = schedule.friday;
    } else {
      currentSchedule = schedule.weekend;
    }

    const isWithinTimeRange = (range) => {
      const [startHour, startMin] = range[0].split(":").map(Number);
      const [endHour, endMin] = range[1].split(":").map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;
      return time >= startTime && time <= endTime;
    };

    const findNextOpeningTime = (ranges) => {
      for (const range of ranges) {
        const [startHour, startMin] = range[0].split(":").map(Number);
        const startTime = startHour * 60 + startMin;
        if (time < startTime) {
          return formatTime12Hour(range[0]);
        }
      }
      return null;
    };

    let open = false;
    let nextOpen = null;
    const timeRanges = Object.values(currentSchedule);
    for (const range of timeRanges) {
      if (isWithinTimeRange(range)) {
        open = true;
        break;
      }
    }

    if (!open) {
      nextOpen = findNextOpeningTime(timeRanges);
    }

    setIsOpen(open);
    setNextOpeningTime(nextOpen);
  };

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
            Dining Hall Status
          </h2>
          {!isOpen ? (
            <div className="text-3xl font-bold mb-2 text-red-500">
              Currently closed.
              {nextOpeningTime && (
                <p className="text-lg text-black">
                  Opening at {nextOpeningTime}.
                </p>
              )}
            </div>
          ) : (
            <div className="text-5xl font-bold mb-2 text-[#fdb710]">
              {Math.round(occupancy)}%
            </div>
          )}

          {/* Progress Bar and Occupancy History */}
          {isOpen && (
            <>
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
                NOT ASSOCIATED WITH FSU, COMPLETELY INDEPENDENT - This is the
                current estimated busyness of the dining hall based on noise
                levels. Last 5 readings:{" "}
                {occupancyHistory.map((value, index) => (
                  <span key={index}>
                    {value}%{index < occupancyHistory.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
