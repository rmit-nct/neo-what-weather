import { ForecastDay } from '@/services/weatherApi';
import { format } from 'date-fns';

interface ForecastCardProps {
  forecast: ForecastDay[];
  className?: string;
}

const ForecastCard = ({ forecast, className = "" }: ForecastCardProps) => {
  // Group forecast by days and take first entry of each day for 5-day forecast
  const dailyForecast = forecast.reduce((acc: ForecastDay[], current) => {
    const currentDate = format(new Date(current.dt * 1000), 'yyyy-MM-dd');
    const existingDay = acc.find(item =>
      format(new Date(item.dt * 1000), 'yyyy-MM-dd') === currentDate
    );

    if (!existingDay) {
      acc.push(current);
    }

    return acc;
  }, []).slice(0, 5);

  return (
    <div className={`${className}`}>
      <h3 className="text-weather-text-primary text-lg font-semibold mb-3 ml-2">
        5 days Forecast
      </h3>
      <div className="weather-card weather-card-hover p-4 space-y-2">
        {dailyForecast.map((day, index) => {
          const date = new Date(day.dt * 1000);
          const dayName = index === 0 ? 'Today' : format(date, 'EEE');
          const dateString = format(date, 'dd MMM');
          const weather = day.weather[0];
          const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

          return (
            <div
              key={day.dt}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-weather-border last:border-b-0 py-2"
            >
              {/* Weather Icon and Temperature */}
              <div className="flex items-center gap-2">
                <img
                  src={iconUrl}
                  alt={weather.description}
                  className="w-10 h-10 weather-icon"
                />
                <div>
                  <div className="text-weather-text-primary text-sm">
                    <span className="font-medium">+{Math.round(day.main.temp_max)}°</span>
                    <span className="text-weather-text-secondary ml-1">+{Math.round(day.main.temp_min)}°</span>
                  </div>
                </div>
              </div>

              {/* Day */}
              <div className="text-center text-weather-text-secondary font-medium text-sm">
                {dayName}
              </div>
              
              {/* Date */}
              <div className="text-right text-weather-text-secondary text-xs">
                {dateString}
              </div>
            </div>
          );
        })}

        {/* Tomorrow's detailed forecast */}
        {dailyForecast.length > 1 && (
          <div className="mt-4 pt-4 border-t border-weather-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={`https://openweathermap.org/img/wn/${dailyForecast[1].weather[0].icon}@2x.png`}
                  alt="Tomorrow weather"
                  className="w-12 h-12"
                />
                <div>
                  <div className="text-weather-text-secondary text-sm">Tomorrow</div>
                  <div className="text-weather-text-primary text-lg font-medium">
                    {Math.round(dailyForecast[1].main.temp)}°C
                  </div>
                  <div className="text-weather-text-secondary text-xs">
                    {dailyForecast[1].weather[0].description}
                  </div>
                </div>
              </div>

              {/* Weather trend mini chart */}
              <div className="flex items-center gap-1 ml-auto">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary/30 rounded-full"
                    style={{ height: `${8 + Math.random() * 12}px` }}
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