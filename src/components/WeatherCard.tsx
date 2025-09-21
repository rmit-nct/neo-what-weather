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

  // Nice weather images
  const backgroundMap: Record<string, string> = {
    Clear: "/weather-backgrounds/clear.jpg",
    Clouds: "/weather-backgrounds/clouds.jpg",
    Rain: "/weather-backgrounds/rain.jpg",
    Thunderstorm: "/weather-backgrounds/storm.jpg",
    Snow: "/weather-backgrounds/snow.jpg",
    Mist: "/weather-backgrounds/mist.jpg",
  };
  const backgroundImage =
    backgroundMap[currentWeather.main] || "/weather-backgrounds/default.jpg";

  // suggest action
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
      className={`relative p-4 rounded-2xl shadow-lg lg:!h-[600px] flex-grow-0 flex flex-col overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10">
        <h2 className="text-lg font-semibold mb-4 text-white">Current Weather</h2>

        {/* content  */}
        <div className="rounded-xl h-[90%] flex flex-col justify-center p-4">
          {/* Major content - Weather icon, temperature, and condition */}
          <div className="mb-6">
            {/* Weather icon - much bigger */}
            <div className="">
              <img
                src={iconUrl}
                alt={currentWeather.description}
                className="w-40 h-40 drop-shadow-lg"
              />
            </div>

            {/* Main temperature - left aligned */}
            <div className="mb-4">
              <div className="text-7xl font-bold text-white">
                {Math.round(weather.main.temp)}°C
              </div>
            </div>

            {/* Weather condition */}
            <div className="mb-6">
              <div className="text-xl capitalize text-white/90 font-medium">
                {currentWeather.description}
              </div>
            </div>
          </div>

          {/* Light separation line */}
          <div className="border-t border-white/20 mb-6"></div>

          {/* Minor content - Location, time, and additional info */}
          <div className="space-y-4">
            {/* Location */}
            <div className="flex items-center gap-2 text-white text-lg">
              <MapPin size={18} />
              <span className="font-semibold">
                {weather.name}, {weather.sys.country}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-white/80 text-base">
              <Clock size={16} />
              <span>{nowLocal.toFormat("h:mm a")}</span>
            </div>

            {/* High/Low temperatures */}
            <div className="flex space-x-6 font-medium text-white/80">
              <span>H: {Math.round(weather.main.temp_max)}°</span>
              <span>L: {Math.round(weather.main.temp_min)}°</span>
            </div>

            {/* Suggestion */}
            <div className="flex items-start gap-2 text-white/90">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <span className="text-sm">{suggestion}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
