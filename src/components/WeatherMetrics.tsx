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
    <div className={className}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.title}
            className="weather-card p-6 bg-weather-card rounded-2xl shadow-lg flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-weather-text-secondary font-medium text-base">
                {metric.title}
              </h3>
              <Icon size={20} className="text-weather-text-secondary" />
            </div>

            {/* Chart / Gauge */}
            {metric.chart ? (
              <div className="flex-1 flex items-center justify-center h-20">
                {/* chart code same */}
              </div>
            ) : metric.gauge ? (
              <div className="flex-1 flex items-center justify-center h-20">
                <Suspense fallback={<span>Loading gauge...</span>}>
                  <GaugeChart
                    id={`${metric.title}-gauge`}
                    nrOfLevels={metric.gaugeColors.length * 3}
                    colors={metric.gaugeColors}
                    percent={metric.gaugePercent}
                    arcPadding={0.02}
                    textColor="#fff"
                    animate
                    formatTextValue={() => metric.value.toString()}
                  />
                </Suspense>
              </div>
            ) : null}

            {/* Value */}
            <div className="mt-4 flex justify-between items-baseline">
              <span className="text-3xl font-semibold text-weather-text-primary">
                {metric.value}
                {metric.unit && (
                  <span className="text-base font-light ml-1">
                    {metric.unit}
                  </span>
                )}
              </span>
              {metric.subtitle && (
                <span className="text-sm text-weather-text-secondary">
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
