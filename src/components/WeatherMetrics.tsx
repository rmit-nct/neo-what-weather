import { CurrentWeather, weatherApi } from "@/services/weatherApi";
// Icons
import { Wind, Eye, Droplets, Thermometer, Sun, Sunset } from "lucide-react";
// Library to get time based on timezone
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
// Charts
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useWindForecast } from "@/hooks/useWindForecast";
import GaugeChart from "react-gauge-chart";

interface WeatherMetricsProps {
  weather: CurrentWeather;
  className?: string;
}

// --- Separate Gauge Components ---
interface UVIndexCardProps {
  uvIndex: number;
}

const UVIndexCard = ({ uvIndex }: UVIndexCardProps) => {
  return (
    <div className="weather-card p-6 row-span-2">
      <div className="text-weather-text-secondary flex justify-between items-center">
        <h3>UV Index</h3>
        <Sun />
      </div>
      <GaugeChart
        id="uv-gauge"
        nrOfLevels={12}
        colors={["#00FF00", "#FFFF00", "#FF8000", "#FF0000"]}
        percent={Math.min(uvIndex / 11, 1)}
        arcPadding={0.02}
        textColor="#fff"
        animate={true}
        formatTextValue={() => uvIndex.toFixed(1)}
      />
      <div className="text-3xl text-weather-text-primary font-light mt-2">
        {uvIndex} UV
      </div>
    </div>
  );
};

interface SunGaugeCardProps {
  nowLocal: DateTime;
  sunriseLocal: DateTime;
  sunsetLocal: DateTime;
}

const SunGaugeCard = ({
  nowLocal,
  sunriseLocal,
  sunsetLocal,
}: SunGaugeCardProps) => {
  const sunPercent = Math.max(
    0,
    Math.min(
      (nowLocal.toSeconds() - sunriseLocal.toSeconds()) /
        (sunsetLocal.toSeconds() - sunriseLocal.toSeconds()),
      1,
    ),
  );

  return (
    <div className="weather-card p-6 row-span-2">
      <div className="text-weather-text-secondary flex justify-between items-center">
        <h3>Sunrise & Sunset</h3>
        <Sunset />
      </div>
      <GaugeChart
        id="sun-gauge"
        nrOfLevels={24}
        colors={["#FFA500", "#FFFF00"]}
        percent={sunPercent}
        arcPadding={0.02}
        textColor="#fff"
        animate={true}
        formatTextValue={() => nowLocal.toFormat("h:mm a")}
      />
      <div className="text-3xl text-weather-text-primary font-light mt-2">
        Sunrise: {sunriseLocal.toFormat("h:mm a")}
      </div>
      <div className="text-3xl text-weather-text-primary font-light">
        Sunset: {sunsetLocal.toFormat("h:mm a")}
      </div>
    </div>
  );
};

// --- Main Component ---
const WeatherMetrics = ({ weather, className = "" }: WeatherMetricsProps) => {
  const uvIndex = weatherApi.calculateUVIndex(weather);

  // take IANA timezone name based on coordinates
  const tzName = tzlookup(weather.coord.lat, weather.coord.lon);

  const { windData, loading, error } = useWindForecast(
    weather.coord.lat,
    weather.coord.lon,
    tzName,
  );

  // time now, sunrise, sunset according to timezone location
  const nowLocal = DateTime.fromSeconds(weather.dt, { zone: tzName });
  const sunriseLocal = DateTime.fromSeconds(weather.sys.sunrise, {
    zone: tzName,
  });
  const sunsetLocal = DateTime.fromSeconds(weather.sys.sunset, {
    zone: tzName,
  });

  const metrics = [
    {
      title: "Wind Status",
      value: `${Math.round(weather.wind.speed * 3.6)}`,
      unit: "km/h",
      subtitle: `${weather.wind.deg}°`,
      icon: Wind,
      progress: Math.min(((weather.wind.speed * 3.6) / 50) * 100, 100),
      time: nowLocal.toFormat("h:mm a"),
    },
    {
      title: "Humidity",
      value: weather.main.humidity.toString(),
      unit: "%",
      subtitle:
        weather.main.humidity > 70
          ? "High"
          : weather.main.humidity > 30
            ? "Normal"
            : "Low",
      icon: Droplets,
      progress: weather.main.humidity,
    },
    {
      title: "Visibility",
      value: `${Math.round(weather.visibility / 1000)}`,
      unit: "km",
      subtitle:
        weather.visibility > 8000
          ? "Good"
          : weather.visibility > 5000
            ? "Moderate"
            : "Poor",
      icon: Eye,
      progress: Math.min((weather.visibility / 10000) * 100, 100),
    },
    {
      title: "Feels Like",
      value: Math.round(weather.main.feels_like).toString(),
      unit: "°C",
      subtitle:
        Math.abs(weather.main.feels_like - weather.main.temp) <= 2
          ? "Similar to actual"
          : "Different from actual",
      icon: Thermometer,
      progress: ((weather.main.feels_like + 20) / 60) * 100,
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[150px] ${className}`}
    >
      {/* Wind Card */}
      <div className="weather-card p-6 row-span-2 bg-weather-card rounded-2xl shadow-md flex flex-col">
        <div className="text-weather-text-secondary flex justify-between items-center mb-2">
          <h3 className="text-2xl font-medium text-weather-text-primary">
            Wind Status
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {loading ? (
            <div className="text-weather-text-secondary">
              Loading forecast...
            </div>
          ) : error ? (
            <div className="text-red-400">Error: {error}</div>
          ) : (
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={windData}>
                <defs>
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4FC3F7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4FC3F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4FC3F7"
                  strokeWidth={2.5}
                  fill="url(#windGradient)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  labelStyle={{ color: "#94A3B8" }}
                  itemStyle={{ color: "#E2E8F0" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-between items-baseline mt-4">
          <div className="flex items-baseline">
            <span className="text-5xl text-weather-text-primary">
              {Math.round(weather.wind.speed * 3.6)}
            </span>
            <span className="text-2xl text-weather-text-primary font-light ml-1">
              km/h
            </span>
          </div>
          <div className="text-2xl text-weather-text-primary font-thin">
            {nowLocal.toFormat("h:mm a")}
          </div>
        </div>
      </div>

      {/* UV Index Card */}
      <UVIndexCard uvIndex={uvIndex} />

      {/* Sunrise/Sunset Card */}
      <SunGaugeCard
        nowLocal={nowLocal}
        sunriseLocal={sunriseLocal}
        sunsetLocal={sunsetLocal}
      />

      {/* Other Metrics */}
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.title}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-weather-text-secondary text-sm font-medium">
                {metric.title}
              </h3>
              <Icon size={20} className="text-weather-text-secondary" />
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-light text-weather-text-primary">
                  {metric.value}
                </span>
                {metric.unit && (
                  <span className="text-weather-text-secondary text-sm">
                    {metric.unit}
                  </span>
                )}
              </div>
              {metric.subtitle && (
                <div className="text-weather-text-secondary text-sm mt-1">
                  {metric.subtitle}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherMetrics;
