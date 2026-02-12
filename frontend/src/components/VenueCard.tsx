// VenueCard.jsx
import { useState } from "react";
import { TimeBar } from "./TimeBar";

export default function VenueCard({ venue, courts }: { venue: string; courts: Array<{ court: string; time: string; venue: string; link: string;}> }) {
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
  times: string[]
): { start: string; end: string } | null => {
  if (times.length === 0) return null;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const interval = isWillisPark(venue) ? 30 : 15;

  const validTimes = times
    .map(timeToMinutes)
    .filter(t => t >= currentMinutes && t <= currentMinutes + 180) // allow longer blocks
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
    const block = getFullConsecutiveBlock(times);
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
                  <span className="font-medium text-gray-900">{court.court}</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {court.timeRange.start} - {court.timeRange.end}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Book now & count */}
          <div className="flex flex-col items-center mt-3 ml-5 basis-1/5">
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
        <p className="text-gray-500 text-sm">No courts available in the next 2 hours</p>
      )}
      

      {/* Show all courts */}
      {allCourts.length > 0 && (
        <>
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-blue-600"
          >
            {showAll ? "Hide other courts" : "Show all courts"}
          </button>

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
                  <TimeBar times={court.times} isWillisPark={isWillisPark(venue)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
