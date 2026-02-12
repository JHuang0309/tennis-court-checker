// VenueCard.jsx
import { useState } from "react";
import { TimeBar } from "./TimeBar";

function formatDuration(start: string, end: string): string {
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let minutes = (endH * 60 + endM) - (startH * 60 + startM);
  if (minutes <= 0) return "";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs > 0 && mins > 0) return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${mins} min${mins > 1 ? "s" : ""}`;
}


export default function VenueCard({ venue, courts, searchHour }: { venue: string; courts: Array<{ court: string; time: string; venue: string; link: string;}>; searchHour: number }) {
  const [showAll, setShowAll] = useState(false);

  // Check if a venue is Willis Park (Voyager)
  const isWillisPark = (v: string): boolean => v.toLowerCase().includes('willis');

  const venueBookingLink = courts.length > 0 ? courts[0].link : "#";

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  };

  // Check if court has at least 1 hour of consecutive availability and return the hour block
const getFullConsecutiveBlock = (
  times: string[],
  searchHour: number
): { start: string; end: string } | null => {
  if (times.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // if searchHour is current hour, start from next 30-min/15-min interval
  let searchTimeMinutes;
  if (searchHour === now.getHours()) {
    // Round up to next interval
    searchTimeMinutes = currentMinutes;
  } else {
    searchTimeMinutes = searchHour * 60;
  }

  const interval = isWillisPark(venue) ? 30 : 15;

  const validTimes = times
    .map(timeToMinutes)
    .filter(t => t >= searchTimeMinutes && t <= searchTimeMinutes + 180) // allow longer blocks
    .sort((a, b) => a - b);

  if (validTimes.length === 0) return null;

  let longestStart = -1;
  let longestEnd = -1;

  let chainStart = validTimes[0];
  let prev = validTimes[0];

  for (let i = 1; i < validTimes.length; i++) {
    if (validTimes[i] === prev + interval) {
      prev = validTimes[i];
    } else {
      // chain ended
      if (prev - chainStart + interval >= 60) {
        longestStart = chainStart;
        longestEnd = prev + interval;
        //  break; // first valid chain ≥ 1hr (remove break if you want absolute longest)
      }
      chainStart = validTimes[i];
      prev = validTimes[i];
    }
  }

  // Handle final chain
  if (longestStart === -1 && prev - chainStart + interval >= 60) {
    longestStart = chainStart;
    longestEnd = prev + interval;
  }

  if (longestStart === -1) return null;

  return {
    start: minutesToTime(longestStart),
    end: minutesToTime(longestEnd)
  };
};

  // Group courts by name and check each for 1-hour availability
  const courtsByName = new Map<string, string[]>();
  courts.forEach(court => {
    if (!courtsByName.has(court.court)) {
      courtsByName.set(court.court, []);
    }
    courtsByName.get(court.court)!.push(court.time);
  });

  // Filter top 2 courts with at least 1 hour of availability
  const topCourts = Array.from(courtsByName.entries())
  .map(([courtName, times]) => {
    const block = getFullConsecutiveBlock(times, searchHour);
    if (!block) return null;

    return {
      court: courtName,
      timeRange: block,
      venue
    };
  })
  .filter((c): c is { court: string; timeRange: { start: string; end: string }; venue: string } => c !== null)
  .slice(0, 2);

  // All courts
  const allCourts = Array.from(courtsByName.entries())
    .map(([courtName, times]) => ({
      court: courtName,
      times: times.sort(),
      venue: venue
    }));

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-bold mb-2">{venue}</h3>
      {topCourts && topCourts.length > 0 ? (
        <div className="flex flex-row justify-between">
          {/* Court list */}
          <div className="space-y-3 basis-4/5">
            {topCourts.map((court, idx) => {
              return (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded"
                >
                  <div>
                    <span className="font-medium text-gray-900">{court.court}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">
                      {court.timeRange.start} - {court.timeRange.end}{" "}
                    </span>
                    <span className="text-sm text-gray-500 italic ml-2">
                      {formatDuration(court.timeRange.start, court.timeRange.end)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-px bg-gray-300 mx-2" />
          {/* Book now & count */}
          <div className="flex flex-col items-center mt-3 basis-1/5">
            <span className="text-sm font-medium text-gray-700">
              {topCourts.length == 1 ? (
                <p>1 court available</p>
              ) : (
                <p>{topCourts.length} courts available</p>
              )} 
            </span>
            <a href={venueBookingLink} target="_blank" rel="noreferrer">
              <button className="bg-blue-600 text-black px-2 py-1 rounded hover:bg-blue-700 text-xs">
                Book now
              </button>
            </a>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No courts available in the next 2 hours (min 1 hrs)</p>
      )}
      

      {/* Show all courts */}
      {allCourts.length > 0 && (
        <div className="flex-col">
          {/* Show all courts button */}
          <div className="flex justify-start mt-2 ml-1">
            <span
              onClick={() => setShowAll(!showAll)}
              className="flex items-center text-blue-600 text-sm font-medium cursor-pointer border-b-1 border-transparent hover:border-blue-100"
            >
              {showAll ? "Hide other courts" : "Show all courts"}
              {/* Double arrow down icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-4 ml-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
              </svg>
            </span>
          </div>

          {showAll && (
            <div className="mt-4 space-y-3">
              {allCourts.map((court, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-gray-200 rounded"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{court.court}</span>
                    <span className="text-xs text-gray-500">{court.times.length} available slots</span>
                  </div>
                  <TimeBar
                    times={court.times}
                    isWillisPark={isWillisPark(venue)}
                    searchHour={searchHour}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      )}
    </div>
  );
}
