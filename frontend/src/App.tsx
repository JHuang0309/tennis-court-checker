import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'
import VenueCard from './components/VenueCard'
import { VenueFilter } from './components/VenueFilter'
import { SearchTimeSelector } from './components/SearchTimeSelector';

function App() {
  const [courtsData, setCourtsData] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [allVenues, setAllVenues] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchHour, setSearchHour] = useState(new Date().getHours());

  async function fetchCourts() {
    setRefreshing(true)
    setError(null)
    try {
      const res = await axios.get("http://localhost:5005/api/scan"); // Replace with your API
      setCourtsData(res.data);
      
      // Obtain unique venues
      const venues = [...new Set(res.data.map((court: any) => court.venue))] as string[];
      setAllVenues(venues);
      setSelectedVenues(venues); // Default: all selected

    } catch (err: any) {
      setError(err.message || 'Failed to fetch')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCourts()
  }, [])

  const filteredCourts = courtsData?.filter(court => selectedVenues.includes(court.venue));

  const venueObjects = allVenues.map(v => ({ id: v, name: v }));

  if (error) return <p>Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold mb-2 text-left">Court Scanner</h2>
        <div className="flex items-center gap-4">
          <VenueFilter
            venues={venueObjects}
            selectedVenueIds={selectedVenues}
            onSelectionChange={setSelectedVenues}
          />

          {/* Refresh Button */}
          <button
            onClick={fetchCourts}
            className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </nav>

      {/* Search time selector */}
      <span className='flex justify-start px-20'>  
        <SearchTimeSelector onChange={setSearchHour} />
      </span>
    
      <div className="flex flex-1 px-20 py-5 gap-6 min-h-screen justify-center">
        {refreshing ? (
          <p className='text-lg font-medium text-blue-600 text-lg animate-pulse mt-100'>Finding courts near you...</p>
        ) : (
          <div className="flex-1 space-y-4">
            {selectedVenues.map(venue => (
              <VenueCard
                key={venue}
                venue={venue}
                courts={(filteredCourts ?? []).filter(c => c.venue === venue)}
                searchHour={searchHour}  
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
