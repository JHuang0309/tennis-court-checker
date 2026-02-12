import { useMemo } from "react";

interface TimeBarProps {
  times: string[]
  isWillisPark: boolean
  searchHour: number
}

export function TimeBar({ times, isWillisPark, searchHour }: TimeBarProps) {
  // Generate all possible time slots in a 24-hour period
  const allSlots = useMemo(() => {
    const slots: string[] = [];
    if (isWillisPark) {
      // Willis Park: 30-min slots (x:00 and x:30)
      for (let h = 0; h < 24; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
        slots.push(`${h.toString().padStart(2, '0')}:30`);
      }
    } else {
      // Kuring Gai: 15-min slots (x:00, x:15, x:30, x:45)
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
          slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
      }
    }
    return slots;
  }, [isWillisPark]);

  const availableSet = new Set(times);

  // Show only relevant hours (5am to 10pm)
  const visibleSlots = allSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0], 10);
    return hour >= searchHour && hour <= searchHour + 4 && hour <= 22; // only show 6 hours
  });

  return (
    <div className="overflow-x-auto py-1">
      <div className="flex items-center gap-px h-6 min-w-[360px]"> {/* min-width for 6 hours */}
        {visibleSlots.map((slot, idx) => (
          <div
            key={idx}
            className={`flex-1 h-6 ${
              availableSet.has(slot) ? "bg-green-600" : "bg-gray-300"
            }`}
            title={slot}
          />
        ))}
      </div>
      {/* Hour markings below bar */}
      <div className="relative h-4 mt-1 min-w-[360px]">
        {visibleSlots.map((slot, idx) => {
          const [hour, minute] = slot.split(":");

          if (minute === "00") {
            return (
              <div
                key={idx}
                className="absolute text-xs text-gray-600"
                style={{
                  left: `${(idx / visibleSlots.length) * 100}%`
                }}
              >
                {hour}:00
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
