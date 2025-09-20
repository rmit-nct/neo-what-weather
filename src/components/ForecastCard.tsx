import { ForecastDay } from "@/services/weatherApi";
import { format } from "date-fns";

interface ForecastCardProps {
  forecast: ForecastDay[];
  className?: string;
}

const ForecastCard = ({ forecast, className = "" }: ForecastCardProps) => {
  // Group forecast by days and take first entry of each day for 5-day forecast
  const dailyForecast = forecast
    .reduce((acc: ForecastDay[], current) => {
      const currentDate = format(new Date(current.dt * 1000), "yyyy-MM-dd");
      const existingDay = acc.find(
        (item) =>
          format(new Date(item.dt * 1000), "yyyy-MM-dd") === currentDate,
      );

      if (!existingDay) {
        acc.push(current);
      }

      return acc;
    }, [])
    .slice(0, 5);

  return (
    <div className={`${className}`}>
      
      <h3 className="text-white text-lg font-semibold mb-3 ml-2">
        5-Day Forecast
      </h3>
      <div className="relative rounded-2xl overflow-hidden p-5 space-y-3">
        {/* Gradient backgrounds for forecast card */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-400/15 to-transparent mix-blend-overlay" />
        
        {/* Content */}
        <div className="relative z-10 space-y-3">
          {dailyForecast.map((day, index) => {
            const date = new Date(day.dt * 1000);
            const dayName = index === 0 ? "Today" : format(date, "EEE");
            const dateString = format(date, "dd MMM");
            const weather = day.weather[0];
            const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`;

            return (
              <div
                key={day.dt}
                className="grid grid-cols-3 items-center py-3 px-3 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-gray-700/30"
              >
                {/* Weather Icon + Temp + Desc */}
                <div className="flex items-center gap-3 w-full">
                  <img
                    src={iconUrl}
                    alt={weather.description}
                    className="w-12 h-12 weather-icon flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-base font-semibold leading-tight">
                      {Math.round(day.main.temp_max)}° /{" "}
                      <span className="text-gray-300 font-medium">
                        {Math.round(day.main.temp_min)}°
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm leading-relaxed capitalize mt-1">
                      {weather.description}
                    </div>
                  </div>
                </div>

                {/* Day */}
                <div className="text-center text-white font-semibold text-base">
                  {dayName}
                </div>

                {/* Date */}
                <div className="text-right text-gray-300 text-sm font-medium">
                  {dateString}
                </div>
              </div>
            );
          })}

          {/* Tomorrow detailed highlight */}
          {dailyForecast.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-600/50">
              <div className="flex items-center gap-4 bg-slate-800/30 rounded-xl p-4">
                <img
                  src={`https://openweathermap.org/img/wn/${dailyForecast[1].weather[0].icon}.png`}
                  alt="Tomorrow weather"
                  className="w-14 h-14 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-gray-300 text-sm font-medium mb-1">
                    Tomorrow's Highlight
                  </div>
                  <div className="text-white text-xl font-bold">
                    {Math.round(dailyForecast[1].main.temp)}°C
                  </div>
                  <div className="text-gray-300 text-sm capitalize mt-1">
                    {dailyForecast[1].weather[0].description}
                  </div>
                </div>

                {/* Mini trend chart */}
                <div className="flex items-end gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-blue-400/50 rounded-full"
                      style={{ height: `${12 + Math.random() * 16}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastCard;
