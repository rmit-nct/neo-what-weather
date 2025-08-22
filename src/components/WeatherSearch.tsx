import { useState, useEffect, useCallback } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { weatherApi, CitySearchResult } from "@/services/weatherApi";
import { cn } from "@/lib/utils";

interface WeatherSearchProps {
  onCitySelect: (city: string, country?: string) => void;
  placeholder?: string;
  className?: string;
}

const WeatherSearch = ({
  onCitySelect,
  placeholder = "Search for cities...",
  className,
}: WeatherSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (searchQuery.length >= 2) {
            setIsLoading(true);
            try {
              const cities = await weatherApi.searchCities(searchQuery);
              setResults(cities);
              setShowResults(true);
            } catch (error) {
              console.error("Search error:", error);
              setResults([]);
            } finally {
              setIsLoading(false);
            }
          } else {
            setResults([]);
            setShowResults(false);
          }
        }, 300);
      };
    })(),
    [],
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleCitySelect = (city: CitySearchResult) => {
    const cityName = `${city.name}${city.state ? `, ${city.state}` : ""}, ${city.country}`;
    setQuery(cityName);
    setShowResults(false);
    onCitySelect(cityName, city.country);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for click events
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-weather-text-secondary"
          size={20}
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="pl-12 pr-4 h-12 weather-card border-weather-border bg-transparent text-weather-text-primary placeholder:text-weather-text-secondary focus:ring-2 focus:ring-primary/50"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 weather-card border border-weather-border bg-card/95 backdrop-blur-md rounded-lg overflow-hidden z-50">
          {results.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleCitySelect(city)}
              className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors duration-200 flex items-center gap-3 border-b border-weather-border last:border-b-0"
            >
              <MapPin
                size={16}
                className="text-weather-text-secondary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-weather-text-primary font-medium truncate">
                  {city.name}
                </div>
                <div className="text-weather-text-secondary text-sm truncate">
                  {city.state && `${city.state}, `}
                  {city.country}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults &&
        results.length === 0 &&
        query.length >= 2 &&
        !isLoading && (
          <div className="absolute top-full left-0 right-0 mt-2 weather-card border border-weather-border bg-card/95 backdrop-blur-md rounded-lg p-4 z-50">
            <div className="text-weather-text-secondary text-center">
              No cities found for "{query}"
            </div>
          </div>
        )}
    </div>
  );
};

export default WeatherSearch;

