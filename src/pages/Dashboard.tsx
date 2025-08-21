import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import WeatherSearch from "@/components/WeatherSearch";
import WeatherCard from "@/components/WeatherCard";
import WeatherMetrics from "@/components/WeatherMetrics";
import ForecastCard from "@/components/ForecastCard";
import WeatherMap from "@/components/WeatherMap";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  weatherApi,
  CurrentWeather,
  ForecastResponse,
} from "@/services/weatherApi";

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

  // Get user's location and load default weather
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
            // Fallback to default city
            fetchWeatherData(selectedCity);
          }
        },
        () => {
          // Geolocation denied, use default city
          fetchWeatherData(selectedCity);
        },
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
    <div className="min-h-screen bg-weather-bg">
      <div className="pl-20">
        {" "}
        {/* Account for sidebar */}
        <div className="p-8">
          {/* Header with Search */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <WeatherSearch onCitySelect={handleCitySelect} className="w-96" />
            </div>
          </div>

          {currentWeather && (
            <>
              {/* Main Weather Card */}
              <div className="mb-8">
                <WeatherCard weather={currentWeather} />
              </div>

            </>
          )}

          {/* Loading overlay for subsequent searches */}
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

