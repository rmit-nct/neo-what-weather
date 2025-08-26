import { CurrentWeather } from "@/services/weatherApi";
import { MapPin, Clock } from "lucide-react";
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

interface WeatherCardProps {
  weather: CurrentWeather;
  className?: string;
}

const WeatherCard = ({ weather, className = "" }: WeatherCardProps) => {
  const currentWeather = weather.weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`;

  const tzName = tzlookup(weather.coord.lat, weather.coord.lon);
  const nowLocal = DateTime.fromSeconds(weather.dt, { zone: tzName });

  return (
    <div
      className={`p-4 bg-weather-card rounded-2xl shadow-lg h-[350px] flex-grow-0 flex flex-col ${className}`}
    >
      <h2 className="text-lg text-center font-semibold mb-4">
        CURRENT WEATHER
      </h2>
      {/* Weather Icon and Temperature */}
      <div className="bg-weather-bg rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={iconUrl}
              alt={currentWeather.description}
              className="w-16 h-16 weather-icon"
            />
          </div>
          <div>
            <div className="text-4xl font-light text-weather-text-primary">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-weather-text-secondary capitalize text-sm">
              {currentWeather.description}
            </div>
          </div>
        </div>

        {/* Location and Time */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-weather-text-secondary" />
            <span className="text-weather-text-primary font-medium text-sm">
              {weather.name}, {weather.sys.country}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Clock size={14} className="text-weather-text-secondary" />
            <span className="text-weather-text-secondary text-sm">
              {nowLocal.toFormat("h:mm a")}
            </span>
          </div>

          {/* Temperature Range */}
          <div className="text-weather-text-secondary flex space-x-3 text-sm">
            <span>H: {Math.round(weather.main.temp_max)}°</span>
            <span>L: {Math.round(weather.main.temp_min)}°</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
