interface Props {
  value: string;
  onChange: (date: string) => void;
}

export const SearchDateSelector = ({ value, onChange }: Props) => {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // monthIndex is 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="inline-flex items-center">
      <label className="mr-2 font-small text-gray-700 text-sm">
        Date:
      </label>

      <div className="relative">
        <input
          type="date"
          value={value}
          min={formatLocalDate(today)}
          max={formatLocalDate(maxDate)}
          onChange={(e) => onChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        />
      </div>
    </div>
  );
};