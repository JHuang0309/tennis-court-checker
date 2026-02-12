import { useState } from 'react'
import { MapPin, ChevronDown, Check } from 'lucide-react'

interface Venue {
  id: string
  name: string
}

interface VenueFilterProps {
  venues: Venue[]
  selectedVenueIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function VenueFilter({ venues, selectedVenueIds, onSelectionChange }: VenueFilterProps) {
  const [open, setOpen] = useState(false)
  const allSelected = selectedVenueIds.length === venues.length
  const noneSelected = selectedVenueIds.length === 0

  function toggleVenue(id: string) {
    if (selectedVenueIds.includes(id)) {
      onSelectionChange(selectedVenueIds.filter((v) => v !== id))
    } else {
      onSelectionChange([...selectedVenueIds, id])
    }
  }

  function toggleAll() {
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(venues.map((v) => v.id))
    }
  }

  const label = allSelected
    ? "All Venues"
    : noneSelected
      ? "Select venues"
      : selectedVenueIds.length === 1
        ? venues.find((v) => v.id === selectedVenueIds[0])?.name ?? "1 venue"
        : `${selectedVenueIds.length} venues`

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 rounded px-3 py-2 hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
          <span className="truncate text-sm">{label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 shrink-0 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-gray-300 rounded shadow-lg z-50">
            <div className="p-3 border-b border-gray-200">
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors w-full"
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                  allSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                }`}>
                  {allSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                Select All
              </button>
            </div>
            <div className="max-h-[240px] overflow-y-auto p-2">
              {venues.map((venue) => {
                const isSelected = selectedVenueIds.includes(venue.id)
                return (
                  <label
                    key={venue.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    }`}
                    onClick={() => toggleVenue(venue.id)}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{venue.name}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
