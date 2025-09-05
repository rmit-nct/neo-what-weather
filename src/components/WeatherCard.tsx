import { CurrentWeather } from "@/services/weatherApi";
import { MapPin, Clock, Info } from "lucide-react";
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

  // Suggest action
  const suggestionMap: Record<string, string> = {
    Clear: "Nice weather to hang out 🌞",
    Clouds: "It's cloudy, bring a light jacket ☁️",
    Rain: "It might rain, don't forget your umbrella ☔",
    Thunderstorm: "The weather is bad, stay indoors ⚡",
    Snow: "It's cold, dress warmly ❄️",
    Mist: "Limited visibility, drive carefully 🌫️",
  };
  const suggestion =
    suggestionMap[currentWeather.main] || "Prepare for every situation!";

  return (
    <div
      className={`p-4 rounded-2xl shadow-lg lg:!h-[560px] flex-grow-0 flex flex-col ${className}`}
    >
      <h2 className="text-lg font-semibold mb-3">Current Weather</h2>

      {/* Card with gradient overlays only */}
      <div className="p-8 relative rounded-xl overflow-hidden shadow-md h-[90%] flex flex-col justify-between bg-slate-900">
        {/* Overlays */}
        <div className="absolute inset-0 z-0 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-500/95 to-slate-900/95 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-blue-300/30 to-transparent mix-blend-overlay rounded-xl" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-start space-y-3">
          <img
            src={iconUrl}
            alt={currentWeather.description}
            className="w-32 h-32 drop-shadow-lg"
          />
          <div>
            <div className="flex items-start text-white/90">
              <span className="text-6xl font-bold leading-none">
                {Math.round(weather.main.temp)}
              </span>
              <span className="text-3xl font-medium ml-1 mt-1">°C</span>
            </div>
            <div className="text-lg capitalize text-white/80 font-medium mt-1">
              {currentWeather.description}
            </div>
          </div>
        </div>

        <hr className="relative z-10 border-t border-white/40 my-4" />

        {/* Sub content */}
        <div className="relative z-10 mt-6 space-y-3 text-white text-base">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <span className="font-semibold">
              {weather.name}, {weather.sys.country}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>{nowLocal.toFormat("h:mm a")}</span>
          </div>

          <div className="flex space-x-5 font-medium">
            <span>H: {Math.round(weather.main.temp_max)}°</span>
            <span>L: {Math.round(weather.main.temp_min)}°</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-white/90">
            <Info size={18} />
            <span>{suggestion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
