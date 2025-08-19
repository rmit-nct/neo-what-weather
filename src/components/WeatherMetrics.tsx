import { CurrentWeather, weatherApi } from '@/services/weatherApi';
import { 
  Wind, 
  Eye, 
  Droplets, 
  Thermometer, 
  Sun, 
  Sunset,
  Gauge
} from 'lucide-react';
import { format } from 'date-fns';

interface WeatherMetricsProps {
  weather: CurrentWeather;
  className?: string;
}

const WeatherMetrics = ({ weather, className = "" }: WeatherMetricsProps) => {
  const uvIndex = weatherApi.calculateUVIndex(weather);
  const sunrise = new Date(weather.sys.sunrise * 1000);
  const sunset = new Date(weather.sys.sunset * 1000);
  
  const metrics = [
    {
      title: "Wind Status",
      value: `${weather.wind.speed}`,
      unit: "km/h",
      subtitle: `${weather.wind.deg}°`,
      icon: Wind,
      progress: Math.min((weather.wind.speed / 50) * 100, 100),
    },
    {
      title: "UV Index",
      value: uvIndex.toString(),
      unit: "UV",
      subtitle: uvIndex <= 2 ? "Low" : uvIndex <= 5 ? "Moderate" : uvIndex <= 7 ? "High" : "Very High",
      icon: Sun,
      progress: (uvIndex / 11) * 100,
    },
    {
      title: "Sunrise & Sunset",
      value: format(sunrise, 'h:mm a'),
      unit: "",
      subtitle: format(sunset, 'h:mm a'),
      icon: Sunset,
      progress: 75, // Sample progress for sunset
    },
    {
      title: "Humidity",
      value: weather.main.humidity.toString(),
      unit: "%",
      subtitle: weather.main.humidity > 70 ? "High" : weather.main.humidity > 30 ? "Normal" : "Low",
      icon: Droplets,
      progress: weather.main.humidity,
    },
    {
      title: "Visibility",
      value: `${Math.round(weather.visibility / 1000)}`,
      unit: "km",
      subtitle: weather.visibility > 8000 ? "Good" : weather.visibility > 5000 ? "Moderate" : "Poor",
      icon: Eye,
      progress: Math.min((weather.visibility / 10000) * 100, 100),
    },
    {
      title: "Feels Like",
      value: Math.round(weather.main.feels_like).toString(),
      unit: "°C",
      subtitle: Math.abs(weather.main.feels_like - weather.main.temp) <= 2 ? "Similar to actual" : "Different from actual",
      icon: Thermometer,
      progress: ((weather.main.feels_like + 20) / 60) * 100, // Normalized progress
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <div 
            key={metric.title}
            className="weather-card weather-card-hover p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-weather-text-secondary text-sm font-medium">
                {metric.title}
              </h3>
              <Icon size={20} className="text-weather-text-secondary" />
            </div>
            
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-light text-weather-text-primary">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-weather-text-secondary text-sm">
                    {metric.unit}
                  </span>
                )}
              </div>
              {metric.subtitle && (
                <div className="text-weather-text-secondary text-sm mt-1">
                  {metric.subtitle}
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full h-1 bg-weather-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(metric.progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherMetrics;