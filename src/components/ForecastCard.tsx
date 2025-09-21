import { ForecastDay } from "@/services/weatherApi";
import { format, parseISO } from "date-fns";

interface ForecastCardProps {
  forecast: ForecastDay[];
  className?: string;
}

const ForecastCard = ({ forecast, className = "" }: ForecastCardProps) => {
  // Aggregate 3-hour forecast entries into daily summaries for the next five days
  type DailySummary = {
    dateKey: string;
    timestamp: number;
    maxTemp: number;
    minTemp: number;
    avgTemp: number;
    icon: string;
    description: string;
  };

  const groupedByDay = forecast.reduce<Record<string, ForecastDay[]>>((acc, entry) => {
    const dateKey = entry.dt_txt.split(" ")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const dailyForecast: DailySummary[] = Object.entries(groupedByDay)
    .map(([dateKey, entries]) => {
      const sortedEntries = [...entries].sort((a, b) => a.dt - b.dt);
      const maxTemp = Math.max(...sortedEntries.map((entry) => entry.main.temp_max));
      const minTemp = Math.min(...sortedEntries.map((entry) => entry.main.temp_min));
      const avgTemp =
        sortedEntries.reduce((sum, entry) => sum + entry.main.temp, 0) / sortedEntries.length;
      const getHour = (value: ForecastDay) =>
        parseInt(value.dt_txt.split(" ")[1].split(":")[0], 10);
      const representativeEntry = sortedEntries.reduce((closest, entry) => {
        const currentDiff = Math.abs(getHour(entry) - 12);
        const closestDiff = Math.abs(getHour(closest) - 12);

        if (currentDiff === closestDiff) {
          return getHour(entry) >= 12 ? entry : closest;
        }

        return currentDiff < closestDiff ? entry : closest;
      }, sortedEntries[0]);

      return {
        dateKey,
        timestamp: sortedEntries[0].dt * 1000,
        maxTemp,
        minTemp,
        avgTemp,
        icon: representativeEntry.weather[0].icon,
        description: representativeEntry.weather[0].description,
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp)
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
            const date = parseISO(day.dateKey);
            const dayName = index === 0 ? "Today" : format(date, "EEE");
            const dateString = format(date, "dd MMM");
            const iconUrl = `https://openweathermap.org/img/wn/${day.icon}.png`;

            return (
              <div
                key={day.dateKey}
                className="py-3 px-3 rounded-xl bg-slate-800/40 backdrop-blur-sm border border-gray-700/30"
              >
                {/* Mobile Layout: Stack everything vertically */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {/* Day and Date Row */}
                  <div className="flex justify-between items-center">
                    <div className="text-white font-semibold text-base">
                      {dayName}
                    </div>
                    <div className="text-gray-300 text-sm font-medium">
                      {dateString}
                    </div>
                  </div>
                  
                  {/* Weather Icon + Temp + Description Row */}
                  <div className="flex items-center gap-3">
                    <img
                      src={iconUrl}
                      alt={day.description}
                      className="w-12 h-12 weather-icon flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-white text-base font-semibold leading-tight">
                        <span className="text-orange-400 text-xs font-medium">H:</span> {Math.round(day.maxTemp)}°{" "}
                        <span className="text-cyan-400 text-xs font-medium">L:</span>{" "}
                        <span className="text-gray-300 font-medium">
                          {Math.round(day.minTemp)}°
                        </span>
                      </div>
                      <div className="text-gray-300 text-sm leading-relaxed capitalize mt-1">
                        {day.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout: Grid layout for larger screens */}
                <div className="hidden sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
                  {/* Weather Icon + Temp + Desc */}
                  <div className="flex items-center gap-3">
                    <img
                      src={iconUrl}
                      alt={day.description}
                      className="w-12 h-12 weather-icon flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-base font-semibold leading-tight">
                        <span className="text-orange-400 text-xs font-medium">H:</span> {Math.round(day.maxTemp)}°{" "}
                        <span className="text-cyan-400 text-xs font-medium">L:</span>{" "}
                        <span className="text-gray-300 font-medium">
                          {Math.round(day.minTemp)}°
                        </span>
                      </div>
                      <div className="text-gray-300 text-sm leading-relaxed capitalize mt-1">
                        {day.description}
                      </div>
                    </div>
                  </div>

                  {/* Day */}
                  <div className="text-white font-semibold text-base text-center">
                    {dayName}
                  </div>

                  {/* Date */}
                  <div className="text-gray-300 text-sm font-medium text-right">
                    {dateString}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tomorrow detailed highlight */}
          {dailyForecast.length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-600/50">
              <div className="flex items-center gap-4 bg-slate-800/30 rounded-xl p-4">
                <img
                  src={`https://openweathermap.org/img/wn/${dailyForecast[1].icon}.png`}
                  alt="Tomorrow weather"
                  className="w-14 h-14 flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="text-gray-300 text-sm font-medium mb-1">
                    Tomorrow's Highlight
                  </div>
                  <div className="text-white text-xl font-bold">
                    {Math.round(dailyForecast[1].avgTemp)}
                  </div>
                  <div className="text-gray-300 text-sm capitalize mt-1">
                    {dailyForecast[1].description}
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
