import { CurrentWeather } from "@/services/weatherApi";
import { MapPin, Clock } from "lucide-react";
import tzlookup from "tz-lookup";
import { DateTime } from "luxon";

interface WeatherCardProps {
  weather: CurrentWeather;
  className?: string;
  width?: number | string;
  maxWidth?: number | string;
  variant?: "compact" | "tall";
}

const WeatherCard = ({
  weather,
  className = "",
  width = "100%",
  maxWidth,
  variant = "tall",
}: WeatherCardProps) => {
  const currentWeather = weather.weather[0];
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeather.icon}@4x.png`;

  const tall = "flex flex-col justify-between gap-2 max-h-[500px]";
  const compact = "flex items-center justify-between gap-2";

  const tzName = tzlookup(weather.coord.lat, weather.coord.lon);
  const nowLocal = DateTime.fromSeconds(weather.dt, { zone: tzName });

  return (
    <div
      className={`
        weather-card weather-card-hover w-full
        ${variant === "tall" ? tall : compact}
        ${className}
      `}
      style={{ width, maxWidth }}
    >
      {/* Weather Icon and Temperature */}
      <div className="flex items-center gap-2 ">
        <div className="flex items-center gap-2 w-full pr-0 pt-6">
          <div className="relative">
            <img
              src={iconUrl}
              alt={currentWeather.description}
              className="w-24 h-24 weather-icon"
            />
          </div>
          <div>
            <div className="text-6xl font-light text-weather-text-primary mt-1">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-weather-text-secondary capitalize text-lg">
              {currentWeather.description}
            </div>
          </div>
        </div>
      </div>

      {/* Location and Time */}
      <div className="p-4 text-3xl pb-8">
        <div className="flex items-center gap-1 mt-1">
          <MapPin size={18} className="text-weather-text-secondary" />
          <span className="text-weather-text-primary font-medium text-lg">
            {weather.name}, {weather.sys.country}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-1 pr-0">
          <Clock size={16} className="text-weather-text-secondary" />
          <span className="text-weather-text-secondary">
            {nowLocal.toFormat("h:mm a")}
          </span>
        </div>

        {/* Temperature Range */}
        <div className="text-weather-text-secondary flex space-x-2">
          <span className="text-sm">
            H: {Math.round(weather.main.temp_max)}°
          </span>
          <span className="text-sm">
            L: {Math.round(weather.main.temp_min)}°
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;