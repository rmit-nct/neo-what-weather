import { CurrentWeather, weatherApi } from "@/services/weatherApi";
// Icons
import { Wind, Eye, Droplets, Thermometer, Sun, Sunset } from "lucide-react";
//library to get time based on timezone
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
// charts
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useWindForecast } from "@/hooks/useWindForecast";

interface WeatherMetricsProps {
  weather: CurrentWeather;
  className?: string;
}

const WeatherMetrics = ({ weather, className = "" }: WeatherMetricsProps) => {
  const uvIndex = weatherApi.calculateUVIndex(weather);

  // take IANA timezone name based on coordinates
  const tzName = tzlookup(weather.coord.lat, weather.coord.lon);

  const { windData, loading, error } = useWindForecast(
    weather.coord.lat,
    weather.coord.lon,
    tzName,
  );

  // time now, sunrise, sunset acording to timezone location
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
      value: `${weather.wind.speed}`,
      unit: "km/h",
      subtitle: `${weather.wind.deg}°`,
      icon: Wind,
      progress: Math.min((weather.wind.speed / 50) * 100, 100),
      time: nowLocal.toFormat("h:mm a"),
    },
    {
      title: "UV Index",
      value: uvIndex.toString(),
      unit: "UV",
      subtitle:
        uvIndex <= 2
          ? "Low"
          : uvIndex <= 5
            ? "Moderate"
            : uvIndex <= 7
              ? "High"
              : "Very High",
      icon: Sun,
      progress: (uvIndex / 11) * 100,
    },
    {
      title: "Sunrise & Sunset",
      value: sunriseLocal.toFormat("h:mm a"),
      unit: "",
      subtitle: sunsetLocal.toFormat("h:mm a"),
      icon: Sunset,
      progress: 75,
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
      {metrics.map((metric) => {
        const Icon = metric.icon;

        if (metric.title === "Wind Status") {
          return (
            <div
              key={metric.title}
              className="weather-card p-6 row-span-2 bg-weather-card rounded-2xl shadow-md flex flex-col"
            >
              {/* Title */}
              <div className="text-weather-text-secondary flex justify-between items-center mb-2">
                <h3 className="text-2xl font-medium text-weather-text-primary ">
                  {metric.title}
                </h3>
              </div>

              {/* Chart / Loading / Error */}
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
                        <linearGradient
                          id="windGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4FC3F7"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4FC3F7"
                            stopOpacity={0}
                          />
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

              {/* Wind speed and Time */}
              <div className="flex justify-between items-baseline mt-4">
                {/* Value + Unit */}
                <div className="flex items-baseline">
                  <span className="text-5xl text-weather-text-primary">
                    {metric.value}
                  </span>
                  <span className="text-2xl text-weather-text-primary font-light ml-1">
                    {metric.unit}
                  </span>
                </div>

                {/* Time */}
                <div className="text-2xl text-weather-text-primary font-thin">
                  {metric.time}
                </div>
              </div>
            </div>
          );
        }

        if (metric.title === "UV Index") {
          return (
            <div key={metric.title} className="weather-card p-6 row-span-2">
              <div className="text-weather-text-secondary flex justify-between items-center">
                <h3>{metric.title}</h3>
                <Icon />
              </div>
              <div className="text-3xl text-weather-text-primary font-light">
                {metric.value} {metric.unit}
              </div>
            </div>
          );
        }

        if (metric.title === "Sunrise & Sunset") {
          return (
            <div key={metric.title} className="weather-card p-6 row-span-2">
              <div className="text-weather-text-secondary flex justify-between items-center">
                <h3>{metric.title}</h3>
                <Icon />
              </div>
              <div className="text-3xl text-weather-text-primary font-light">
                {metric.value} {metric.unit}
              </div>
              <div className="text-3xl text-weather-text-primary font-light">
                {metric.subtitle}
              </div>
            </div>
          );
        }

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

            <div className="relative mt-auto"></div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherMetrics;
