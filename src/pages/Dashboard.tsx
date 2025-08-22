import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import WeatherSearch from "@/components/WeatherSearch";
import WeatherCard from "@/components/WeatherCard";
import WeatherMetrics from "@/components/WeatherMetrics";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  weatherApi,
  CurrentWeather,
  ForecastResponse,
} from "@/services/weatherApi";
import ForecastCard from "@/components/ForecastCard";
import WeatherMap from "@/components/WeatherMap";

const Dashboard = () => {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null,
  );
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Florida, US");
  const { toast } = useToast();

  const fetchWeatherData = async (city: string) => {
    setIsLoading(true);
    try {
      const [weatherData, forecastData] = await Promise.all([
        weatherApi.getCurrentWeather(city),
        weatherApi.getForecast(city),
      ]);
      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to fetch weather data. Please check the city name and try again.",
        variant: "destructive",
      });
      console.error("Weather fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    fetchWeatherData(city);
  };

  // Load user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const [weatherData, forecastData] = await Promise.all([
              weatherApi.getCurrentWeatherByCoords(latitude, longitude),
              weatherApi.getForecastByCoords(latitude, longitude),
            ]);
            setCurrentWeather(weatherData);
            setForecast(forecastData);
            setSelectedCity(`${weatherData.name}, ${weatherData.sys.country}`);
          } catch (error) {
            fetchWeatherData(selectedCity);
          }
        },
        () => fetchWeatherData(selectedCity),
      );
    } else {
      fetchWeatherData(selectedCity);
    }
  }, []);

  if (isLoading && !currentWeather) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading weather data..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-weather-bg text-white">
      <div className="pl-20">
        <div className="p-8">
          {/* Header with Search */}
          <div className="flex items-center justify-end mb-8">
            <WeatherSearch onCitySelect={handleCitySelect} className="w-96" />
          </div>

          {currentWeather && (
            <div className="grid grid-cols-[1fr_2fr] gap-8">
              {/* Left: Main Weather Card */}
              <div>
                <WeatherCard weather={currentWeather} />
              </div>
              {/* Weather Metrics Grid */}
              <div className="mb-8">
                <WeatherMetrics weather={currentWeather} />
              </div>

              {/* Forecast and Map Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className='lg:col-span-1'>
                {/* 5-Day Forecast */}
                  {forecast && (
                    <ForecastCard forecast={forecast.list} />
                  )}
                </div>
                <div className='lg:col-span-2'>
                  {/* Weather Map */}
                  <WeatherMap />
                </div>
              </div>
            </div>
          )}

          {/* Loading overlay for searches */}
          {isLoading && currentWeather && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="weather-card p-6">
                <LoadingSpinner text="Updating weather data..." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;