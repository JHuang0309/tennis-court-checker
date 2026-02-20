import { useState, useMemo } from "react";

interface SearchTimeSelectorProps {
  onChange: (time: number) => void; // hour in 24h format
}

export function SearchTimeSelector({ onChange }: SearchTimeSelectorProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const earliestHour = 6;

  // Generate options from current hour up to 22:00 (10pm)
  const options = useMemo(() => {
    const arr = [];
    for (let h = earliestHour; h <= 22; h++) {
      arr.push(h);
    }
    return arr;
  }, [earliestHour]);

  const [selectedHour, setSelectedHour] = useState(currentHour);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const hour = parseInt(e.target.value, 10);
    setSelectedHour(hour);
    onChange(hour);
  }

  return (
    <div className="inline-flex items-center">
      <label className="mr-2 font-small text-gray-700 text-sm">Search time:</label>
      <select
        value={selectedHour}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer"
      >
        {options.map((h) => (
          <option key={h} value={h}>
            {h}:00
          </option>
        ))}
      </select>
    </div>
  );
}
