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
            slots.push(`${h.toString().padStart(2,
  '0')}:${m.toString().padStart(2, '0')}`);
          }
        }
      }
      return slots;
    }, [isWillisPark]);

    const availableSet = new Set(times);

    // Show only relevant hours
    const visibleSlots = allSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      return hour >= searchHour && hour <= 22;
    });

    // Calculate max-width based on 5 hours of slots
    const slotsPerHour = isWillisPark ? 2 : 4;
    const maxVisibleSlots = isWillisPark ? 6 * slotsPerHour : 5 * slotsPerHour; // 5 hours worth
    const slotMinWidth = isWillisPark ? 80 : 60;
    const maxWidth = maxVisibleSlots * slotMinWidth;

    // Calculate actual content width including gaps
    const actualContentWidth = visibleSlots.length * slotMinWidth +
  (visibleSlots.length - 1);

    return (
      <div className="overflow-x-auto py-1" style={{ maxWidth: `${maxWidth}px`
   }}>
        <div className="flex items-center gap-px h-6" style={{ width: 
  `${actualContentWidth}px` }}>
          {visibleSlots.map((slot, idx) => (
            <div
              key={idx}
              className={`h-6 ${
                availableSet.has(slot) ? "bg-green-600" : "bg-gray-300"
              }`}
              style={{ width: `${slotMinWidth}px` }}
              title={slot}
            />
          ))}
        </div>
        {/* Hour markings below bar */}
        <div className="relative h-4 mt-1" style={{ width: 
  `${actualContentWidth}px` }}>
          {visibleSlots.map((slot, idx) => {
            const [hour, minute] = slot.split(":");

            if (minute === "00") {
              // Account for gap-px (1px) between each slot
              const gapOffset = idx * 1;
              return (
                <div
                  key={idx}
                  className="absolute text-xs text-gray-600"
                  style={{
                    left: `${idx * slotMinWidth + gapOffset + slotMinWidth /
  2}px`,
                    transform: isWillisPark ? 'translateX(-100%)' : 
  'translateX(-80%)'
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