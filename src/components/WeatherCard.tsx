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
      className={`p-4 bg-weather-card rounded-2xl shadow-lg lg:!h-[600px] flex-grow-0 flex flex-col ${className}`}
    >
      <h2 className="text-lg font-semibold mb-4">Current Weather</h2>

      {/* content  */}
      <div
        className="relative rounded-xl overflow-hidden shadow-md h-[90%] flex flex-col justify-between p-4"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay to read eaiser */}
        <div className="absolute inset-0 bg-black/40 z-0 rounded-xl" />

        {/* main content */}
        <div className="relative z-10 flex items-center gap-4">
          <img
            src={iconUrl}
            alt={currentWeather.description}
            className="w-20 h-20 drop-shadow-lg"
          />
          <div>
            <div className="text-5xl font-semibold text-white/90">
              {Math.round(weather.main.temp)}°C
            </div>
            <div className="text-lg capitalize text-white/80 font-medium">
              {currentWeather.description}
            </div>
          </div>
        </div>

        {/* sub content */}
        <div className="relative z-10 mt-4 space-y-3 text-white text-base">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="font-semibold">
              {weather.name}, {weather.sys.country}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>{nowLocal.toFormat("h:mm a")}</span>
          </div>

          <div className="flex space-x-4 font-medium">
            <span>H: {Math.round(weather.main.temp_max)}°</span>
            <span>L: {Math.round(weather.main.temp_min)}°</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-white/90">
            <Info size={16} />
            <span>{suggestion}</span>
          </div>

          {/* Suggest action */}
          <div className="flex items-center gap-1 mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
