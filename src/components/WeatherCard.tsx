import { CurrentWeather } from '@/services/weatherApi';
import { MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface WeatherCardProps {
  weather: CurrentWeather;
  className?: string;
}

const WeatherCard = ({ weather, className = "" }: WeatherCardProps) => {
  const currentWeather = weather.weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`;
  
  return (
    <div className={`weather-card weather-card-hover p-8 ${className}`}>
      <div className="flex items-center gap-6">
        {/* Weather Icon and Temperature */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={iconUrl} 
              alt={currentWeather.description}
              className="w-24 h-24 weather-icon"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-primary/20 animate-pulse"></div>
          </div>
          
          <div>
            <div className="text-6xl font-light text-weather-text-primary mb-2">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-weather-text-secondary capitalize text-lg">
              {currentWeather.description}
            </div>
          </div>
        </div>
        
        {/* Location and Time */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2 mb-2">
            <MapPin size={18} className="text-weather-text-secondary" />
            <span className="text-weather-text-primary font-medium text-lg">
              {weather.name}, {weather.sys.country}
            </span>
          </div>
          
          <div className="flex items-center justify-end gap-2 mb-4">
            <Clock size={16} className="text-weather-text-secondary" />
            <span className="text-weather-text-secondary">
              {format(new Date(weather.dt * 1000), 'dd MMM, yyyy h:mm a')}
            </span>
          </div>
          
          {/* Temperature Range */}
          <div className="text-weather-text-secondary">
            <span className="text-sm">H: {Math.round(weather.main.temp_max)}°</span>
            <span className="mx-2">•</span>
            <span className="text-sm">L: {Math.round(weather.main.temp_min)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;