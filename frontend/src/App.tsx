import { useState, useEffect } from 'react'
import './App.css'
import VenueCard from './components/VenueCard'
import { VenueFilter } from './components/VenueFilter'
import { SearchTimeSelector } from './components/SearchTimeSelector';
import { SearchDateSelector } from './components/SearchDateSelector';
import api from './apiClient';

function App() {
  const [courtsData, setCourtsData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [allVenues, setAllVenues] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchHour, setSearchHour] = useState(new Date().getHours());

  const today = new Date();
  const oneMonthAhead = new Date();
  oneMonthAhead.setMonth(today.getMonth() + 1);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // monthIndex is 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [searchDate, setSearchDate] = useState(formatLocalDate(today));

  const fetchCourts = async () => {
    setRefreshing(true)
    try {
      const res = await api.get("api/scan", {
        params: {
          date: searchDate,
        }
      });
      setCourtsData(res.data);

      const venues = [...new Set(res.data.map((court: any) => court.venue))] as string[];
      setAllVenues(venues);
      setSelectedVenues(venues);
      setRefreshing(false)
    } catch (err) {
      console.error(err);
    }
};

useEffect(() => {
  setError(null)
  setRefreshing(true)
  fetchCourts();
}, []);

  const filteredCourts = courtsData?.filter(court => selectedVenues.includes(court.venue));

  const venueObjects = allVenues.map(v => ({ id: v, name: v }));

  if (error) return <p>Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex items-center justify-between">
        <div className='flex items-center'>
          <img 
            src="/skyscanner.png" 
            alt="Court Scanner Logo" 
            className="h-10 w-10 object-contain" // optional styling
            />
          <h2 className="text-xl font-bold ml-2 text-left">Court Scanner</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <VenueFilter
            venues={venueObjects}
            selectedVenueIds={selectedVenues}
            onSelectionChange={setSelectedVenues}
          />

          {/* Refresh Button */}
          <button
            onClick={fetchCourts}
            className="bg-blue-600 text-black text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </nav>
    
      <div className="flex flex-col py-5 gap-6 flex-1 items-center">
        {/* Search time selector */}
          <div className="inline-flex mt-5 items-center gap-8 text-gray-700 bg-white rounded px-3 py-2 shadow">
            <SearchTimeSelector onChange={setSearchHour} />
            <SearchDateSelector
              value={searchDate}
              onChange={(date) => { setSearchDate(date); }}
            />
          </div>  
        {refreshing ? (
          <p className='text-lg font-medium text-blue-600 animate-pulse mt-100'>Finding courts near you...</p>
        ) : (
          <div className="flex-1 w-full space-y-4 max-w-[1045px]">
            {selectedVenues.length > 0 ? (
              selectedVenues.map(venue => (
                <VenueCard
                  key={venue}
                  venue={venue}
                  courts={(filteredCourts ?? []).filter(c => c.venue === venue)}
                  searchHour={searchHour}
                />
              ))
            ) : (
              <p className="text-lg font-medium text-gray-700 mt-100 text-center">
                No available courts
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
