import { useState, useMemo } from "react";

interface SearchTimeSelectorProps {
  onChange: (time: number) => void; // hour in 24h format
}

export function SearchTimeSelector({ onChange }: SearchTimeSelectorProps) {
  const now = new Date();
  const currentHour = now.getHours();

  // Generate options from current hour up to 22:00 (10pm)
  const options = useMemo(() => {
    const arr = [];
    for (let h = currentHour; h <= 22; h++) {
      arr.push(h);
    }
    return arr;
  }, [currentHour]);

  const [selectedHour, setSelectedHour] = useState(currentHour);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const hour = parseInt(e.target.value, 10);
    setSelectedHour(hour);
    onChange(hour);
  }

  return (
    <div className="inline-flex mt-5 items-center gap-2 bg-white text-gray-700 rounded px-3 py-2 shadow cursor-pointer">
      <label className="mr-2 font-small text-gray-700 text-sm">Search time:</label>
      <select
        value={selectedHour}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
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
