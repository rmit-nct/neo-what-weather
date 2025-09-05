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
      <h3 className="text-weather-text-primary text-base font-semibold mb-2 ml-1">
        5-Day Forecast
      </h3>
      <div className="bg-weather-card rounded-2xl p-3 space-y-1.5">
        {dailyForecast.map((day, index) => {
          const date = new Date(day.dt * 1000);
          const dayName = index === 0 ? "Today" : format(date, "EEE");
          const dateString = format(date, "dd MMM");
          const weather = day.weather[0];
          const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}.png`;

          return (
            <div
              key={day.dt}
              className="grid grid-cols-3 items-center py-2 px-2 rounded-lg bg-[#0d1016]"
            >
              {/* Weather Icon + Temp + Desc */}
              <div className="flex items-center gap-4 w-1/3">
                <img
                  src={iconUrl}
                  alt={weather.description}
                  className="w-8 h-8 weather-icon"
                />
                <div>
                  <div className="text-weather-text-primary text-sm font-medium leading-tight">
                    {Math.round(day.main.temp_max)}° /{" "}
                    <span className="text-weather-text-secondary">
                      {Math.round(day.main.temp_min)}°
                    </span>
                  </div>
                  <div className="text-weather-text-secondary text-sm leading-tight capitalize">
                    {weather.description}
                  </div>
                </div>
              </div>

              {/* Day */}
              <div className="w-1/3 text-center text-weather-text-primary font-medium text-sm">
                {dayName}
              </div>

              {/* Date */}
              <div className="w-1/3 text-right text-weather-text-secondary text-xs">
                {dateString}
              </div>
            </div>
          );
        })}

        {/* Tomorrow detailed highlight */}
        {dailyForecast.length > 1 && (
          <div className="mt-2 pt-2 border-t border-weather-border">
            <div className="flex items-center gap-2">
              <img
                src={`https://openweathermap.org/img/wn/${dailyForecast[1].weather[0].icon}.png`}
                alt="Tomorrow weather"
                className="w-10 h-10"
              />
              <div>
                <div className="text-weather-text-secondary text-xs">
                  Tomorrow
                </div>
                <div className="text-weather-text-primary text-base font-medium">
                  {Math.round(dailyForecast[1].main.temp)}°C
                </div>
                <div className="text-weather-text-secondary text-xs capitalize">
                  {dailyForecast[1].weather[0].description}
                </div>
              </div>

              {/* Mini trend chart */}
              <div className="flex items-end gap-0.5 ml-auto">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-primary/40 rounded-full"
                    style={{ height: `${8 + Math.random() * 10}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastCard;
