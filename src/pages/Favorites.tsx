import { useState, useEffect } from 'react';
import { Heart, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WeatherSearch from '@/components/WeatherSearch';
import { weatherApi, CurrentWeather } from '@/services/weatherApi';
import { Button } from '@/components/ui/button';

interface FavoriteLocation {
  id: string;
  name: string;
  country: string;
  weather?: CurrentWeather;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherFavorites');
    if (savedFavorites) {
      const parsedFavorites = JSON.parse(savedFavorites);
      setFavorites(parsedFavorites);
      loadWeatherForFavorites(parsedFavorites);
    } else {
      // Add some default favorites
      const defaultFavorites = [
        { id: '1', name: 'New York', country: 'US' },
        { id: '2', name: 'London', country: 'GB' },
        { id: '3', name: 'Tokyo', country: 'JP' },
      ];
      setFavorites(defaultFavorites);
      localStorage.setItem('weatherFavorites', JSON.stringify(defaultFavorites));
      loadWeatherForFavorites(defaultFavorites);
    }
  }, []);

  const loadWeatherForFavorites = async (favoritesList: FavoriteLocation[]) => {
    setIsLoading(true);
    const updatedFavorites = await Promise.all(
      favoritesList.map(async (favorite) => {
        try {
          const weather = await weatherApi.getCurrentWeather(`${favorite.name}, ${favorite.country}`);
          return { ...favorite, weather };
        } catch (error) {
          return favorite;
        }
      })
    );
    setFavorites(updatedFavorites);
    setIsLoading(false);
  };

  const addToFavorites = async (cityName: string, country?: string) => {
    try {
      const weather = await weatherApi.getCurrentWeather(cityName);
      const newFavorite: FavoriteLocation = {
        id: Date.now().toString(),
        name: weather.name,
        country: weather.sys.country,
        weather,
      };

      // Check if already in favorites
      const alreadyExists = favorites.some(
        fav => fav.name.toLowerCase() === weather.name.toLowerCase() && 
               fav.country === weather.sys.country
      );

      if (alreadyExists) {
        toast({
          title: "Already in favorites",
          description: `${weather.name}, ${weather.sys.country} is already in your favorites.`,
        });
        return;
      }

      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem('weatherFavorites', JSON.stringify(updatedFavorites));
      setShowAddForm(false);

      toast({
        title: "Added to favorites",
        description: `${weather.name}, ${weather.sys.country} has been added to your favorites.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add city to favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(updatedFavorites);
    localStorage.setItem('weatherFavorites', JSON.stringify(updatedFavorites));

    toast({
      title: "Removed from favorites",
      description: "Location has been removed from your favorites.",
    });
  };

  return (
    <div className="min-h-screen bg-weather-bg">
      <div className="pl-20"> {/* Account for sidebar */}
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Heart className="text-primary" size={28} />
              <h1 className="text-2xl font-semibold text-weather-text-primary">
                Favorite Locations
              </h1>
            </div>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              className="bg-transparent border-weather-border text-weather-text-primary hover:bg-primary/10"
            >
              <Plus size={16} className="mr-2" />
              Add Location
            </Button>
          </div>

          {/* Add Location Form */}
          {showAddForm && (
            <div className="weather-card p-6 mb-8 relative z-[1] hover:z-10 hover:-translate-x-0.5 transition-all">
              <h3 className="text-weather-text-primary text-lg font-medium mb-4">
                Add New Favorite Location
              </h3>
              <WeatherSearch
                onCitySelect={addToFavorites}
                placeholder="Search for a city to add to favorites..."
                className="max-w-md"
              />
            </div>
          )}

          {/* Favorites Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="weather-card p-6 animate-pulse">
                  <div className="h-4 bg-weather-border rounded mb-4"></div>
                  <div className="h-8 bg-weather-border rounded mb-2"></div>
                  <div className="h-4 bg-weather-border rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="weather-card weather-card-hover p-6 relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromFavorites(favorite.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/30 flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Weather Info */}
                  {favorite.weather ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={`https://openweathermap.org/img/wn/${favorite.weather.weather[0].icon}@2x.png`}
                          alt={favorite.weather.weather[0].description}
                          className="w-16 h-16 weather-icon"
                        />
                        <div>
                          <div className="text-3xl font-light text-weather-text-primary">
                            {Math.round(favorite.weather.main.temp)}°C
                          </div>
                          <div className="text-weather-text-secondary text-sm capitalize">
                            {favorite.weather.weather[0].description}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-weather-text-primary font-medium text-lg">
                          {favorite.weather.name}
                        </h3>
                        <p className="text-weather-text-secondary text-sm">
                          {favorite.weather.sys.country}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-weather-text-secondary">Feels like</span>
                          <div className="text-weather-text-primary font-medium">
                            {Math.round(favorite.weather.main.feels_like)}°C
                          </div>
                        </div>
                        <div>
                          <span className="text-weather-text-secondary">Humidity</span>
                          <div className="text-weather-text-primary font-medium">
                            {favorite.weather.main.humidity}%
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-weather-text-secondary">Loading weather data...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {favorites.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <Heart size={48} className="text-weather-text-secondary mx-auto mb-4" />
              <h3 className="text-weather-text-primary text-xl font-medium mb-2">
                No Favorite Locations
              </h3>
              <p className="text-weather-text-secondary mb-6">
                Add your favorite cities to quickly check their weather.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Location
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;