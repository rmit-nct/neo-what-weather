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

  // Load user location on mount
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
      <div className="pl-5">
        <div className="p-0">
          {/* Header with Search */}
          <div className="flex items-center justify-end mb-8">
            <WeatherSearch onCitySelect={handleCitySelect} className="w-96" />
          </div>

          {currentWeather && (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_3fr] lg:h-[calc(100vh-12rem)]">
              {/* Left Column: Weather + Forecast */}
              <div className="flex flex-col gap-6">
                <WeatherCard weather={currentWeather} />
                {forecast && <ForecastCard forecast={forecast.list} />}
              </div>

              {/* Right Column: Weather Metrics */}
              <div>
                <WeatherMetrics weather={currentWeather} />
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

