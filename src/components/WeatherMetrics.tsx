import { CurrentWeather, weatherApi } from "@/services/weatherApi";
import { Wind, Eye, Droplets, Thermometer, Sun, Sunset } from "lucide-react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useWindForecast } from "@/hooks/useWindForecast";
import { lazy, Suspense } from "react";

const GaugeChart = lazy(() => import("react-gauge-chart"));

interface WeatherMetricsProps {
  weather: CurrentWeather;
  className?: string;
}

const WeatherMetrics = ({ weather, className = "" }: WeatherMetricsProps) => {
  const uvIndex = weatherApi.calculateUVIndex(weather);
  const tzName = tzlookup(weather.coord.lat, weather.coord.lon);
  const { windData, loading, error } = useWindForecast(
    weather.coord.lat,
    weather.coord.lon,
    tzName,
  );

  const nowLocal = DateTime.fromSeconds(weather.dt, { zone: tzName });
  const sunriseLocal = DateTime.fromSeconds(weather.sys.sunrise, {
    zone: tzName,
  });
  const sunsetLocal = DateTime.fromSeconds(weather.sys.sunset, {
    zone: tzName,
  });

  const sunPercent = Math.max(
    0,
    Math.min(
      (nowLocal.toSeconds() - sunriseLocal.toSeconds()) /
        (sunsetLocal.toSeconds() - sunriseLocal.toSeconds()),
      1,
    ),
  );

  const metrics = [
    {
      title: "Wind Status",
      value: Math.round(weather.wind.speed * 3.6),
      unit: "km/h",
      subtitle: `${weather.wind.deg}°`,
      icon: Wind,
      chart: true,
    },
    {
      title: "UV Index",
      value: uvIndex.toFixed(1),
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
      gauge: true,
      gaugePercent: Math.min(uvIndex / 11, 1),
      gaugeColors: ["#00FF00", "#FFFF00", "#FF8000", "#FF0000"],
    },
    {
      title: "Sunrise & Sunset",
      value: sunriseLocal.toFormat("h:mm a"),
      unit: "",
      subtitle: sunsetLocal.toFormat("h:mm a"),
      icon: Sunset,
      gauge: true,
      gaugePercent: sunPercent,
      gaugeColors: ["#FFA500", "#FFFF00"],
    },
    {
      title: "Humidity",
      value: weather.main.humidity,
      unit: "%",
      subtitle:
        weather.main.humidity > 70
          ? "High"
          : weather.main.humidity > 30
            ? "Normal"
            : "Low",
      icon: Droplets,
    },
    {
      title: "Visibility",
      value: Math.round(weather.visibility / 1000),
      unit: "km",
      subtitle:
        weather.visibility > 8000
          ? "Good"
          : weather.visibility > 5000
            ? "Moderate"
            : "Poor",
      icon: Eye,
    },
    {
      title: "Feels Like",
      value: Math.round(weather.main.feels_like),
      unit: "°C",
      subtitle:
        Math.abs(weather.main.feels_like - weather.main.temp) <= 2
          ? "Similar to actual"
          : "Different from actual",
      icon: Thermometer,
    },
  ];

  return (
    <div className={`grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.title}
            className="weather-card p-4 bg-weather-card rounded-xl shadow flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-weather-text-secondary font-medium text-sm">
                {metric.title}
              </h3>
              <Icon size={18} className="text-weather-text-secondary" />
            </div>

            {metric.chart ? (
              <div className="flex-1 flex items-center justify-center h-16">
                {loading ? (
                  <span className="text-weather-text-secondary text-xs">
                    Loading...
                  </span>
                ) : error ? (
                  <span className="text-red-400 text-xs">{error}</span>
                ) : (
                  <ResponsiveContainer width="100%" height={50}>
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
                        fill="url(#windGradient)"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E293B",
                          border: "none",
                          borderRadius: "6px",
                        }}
                        labelStyle={{ color: "#94A3B8" }}
                        itemStyle={{ color: "#E2E8F0" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : metric.gauge ? (
              <div className="flex-1 flex items-center justify-center h-16">
                <Suspense fallback={<span>Loading gauge...</span>}>
                  <GaugeChart
                    id={`${metric.title}-gauge`}
                    nrOfLevels={metric.gaugeColors.length * 3}
                    colors={metric.gaugeColors}
                    percent={metric.gaugePercent}
                    arcPadding={0.02}
                    textColor="#fff"
                    animate={true}
                    formatTextValue={() => metric.value.toString()}
                  />
                </Suspense>
              </div>
            ) : null}

            <div className="mt-2 flex justify-between items-baseline">
              <span className="text-2xl font-semibold text-weather-text-primary">
                {metric.value}
                {metric.unit && (
                  <span className="text-sm font-light ml-1">{metric.unit}</span>
                )}
              </span>
              {metric.subtitle && (
                <span className="text-xs text-weather-text-secondary">
                  {metric.subtitle}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeatherMetrics;
