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
    <div className={`weather-card weather-card-hover p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-weather-text-primary text-lg font-semibold">
          5 days Forecast
        </h3>
      </div>
      
      <div className="space-y-4">
        {dailyForecast.map((day, index) => {
          const date = new Date(day.dt * 1000);
          const dayName = index === 0 ? 'Today' : format(date, 'EEEE');
          const dateString = format(date, 'dd MMM');
          const weather = day.weather[0];
          const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
          
          return (
            <div 
              key={day.dt}
              className="grid grid-cols-3 items-center py-3 border-b border-weather-border last:border-b-0  "
            >
              {/* Weather Icon and Description */}
              <div className="flex items-center gap-2 flex-1">
                <img 
                  src={iconUrl} 
                  alt={weather.description}
                  className="w-14 h-14 weather-icon"
                />
                <div>
                  <div className="text-weather-text-primary"
                  style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" }}>
                    <span className="text-xl font-semibold">+{Math.round(day.main.temp_max)}°/</span>
                    <span className="text-sm font-normal text-weather-text-secondary">+{Math.round(day.main.temp_min)}°</span>
                  </div>
                  
                </div>
              </div>
              
              {/* Temperature */}
              
              <div className="text-center text-weather-text-secondary font-medium text-sm ">
                {dayName}
              </div>
              <div className="text-right text-weather-text-secondary text-sm self-center">
                {dateString}
              </div>
            </div>
          
          );
        })}
      </div>
      
      {/* Tomorrow's detailed forecast */}
      {dailyForecast.length > 1 && (
        <div className="mt-6 pt-6 border-t border-weather-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={`https://openweathermap.org/img/wn/${dailyForecast[1].weather[0].icon}@2x.png`}
                alt="Tomorrow weather"
                className="w-8 h-8"
              />
              <div>
                <div className="text-weather-text-secondary text-sm">Tomorrow</div>
                <div className="text-weather-text-primary text-sm font-medium">
                  {Math.round(dailyForecast[1].main.temp)}°C
                </div>
              </div>
            </div>
            <div className="text-weather-text-secondary text-sm flex-1">
              Thunder Storm day
            </div>
            {/* Weather trend mini chart could go here */}
            <div className="flex items-center gap-1">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-primary/30 rounded-full"
                  style={{ height: `${8 + Math.random() * 16}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastCard;