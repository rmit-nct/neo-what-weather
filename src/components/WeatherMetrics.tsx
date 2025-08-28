import { CurrentWeather, weatherApi } from "@/services/weatherApi";
import { Wind, Eye, Droplets, Thermometer, Sun, Sunset } from "lucide-react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useWindForecast } from "@/hooks/useWindForecast";
import { lazy, Suspense } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

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
    tzName
  );

  const sunriseLocal = DateTime.fromSeconds(weather.sys.sunrise, { zone: tzName });
  const sunsetLocal = DateTime.fromSeconds(weather.sys.sunset, { zone: tzName });

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
      gaugeType: "uv",
      gaugePercent: Math.min(uvIndex / 11, 1),
      gaugeColors: ["#00FF00", "#FFFF00", "#FF8000", "#FF0000"],
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
      gauge: true,
      gaugeType: "circular", // humidity dùng circular progressbar
    },
    {
      title: "Sunrise & Sunset",
      value: sunriseLocal.toFormat("h:mm a"),
      unit: "",
      subtitle: sunsetLocal.toFormat("h:mm a"),
      icon: Sunset,
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

  // Chart renderer
  const renderMetricChart = (metric: (typeof metrics)[number]) => {
    if (metric.chart) {
      if (loading) {
        return (
          <span className="text-xs text-weather-text-secondary">
            Loading...
          </span>
        );
      }
      if (error) {
        return (
          <span className="text-xs text-red-400">
            Failed to load wind data
          </span>
        );
      }
      if (!windData || windData.length === 0) {
        return (
          <span className="text-xs text-weather-text-secondary">
            No wind data
          </span>
        );
      }
      return (
        <ResponsiveContainer width="100%" height={64}>
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
      );
    }

    if (metric.gauge && metric.gaugeType === "uv") {
      return (
        <Suspense fallback={<span className="text-xs">Loading...</span>}>
          <GaugeChart
            id={`${metric.title}-gauge`}
            nrOfLevels={metric.gaugeColors.length * 3}
            colors={metric.gaugeColors}
            percent={metric.gaugePercent}
            arcPadding={0.02}
            textColor="#fff"
            animate
            formatTextValue={() => metric.value.toString()}
            style={{ height: "64px" }}
          />
        </Suspense>
      );
    }

    if (metric.gauge && metric.gaugeType === "circular") {
      const humidityValue =
        typeof metric.value === "number" ? metric.value : Number(metric.value);

      const pathColor =
        humidityValue > 70
          ? "#EF4444"
          : humidityValue > 40
          ? "#FACC15"
          : "#22C55E";

      return (
        <div className="flex items-center justify-center">
          <div style={{ width: 150, height: 100 }}>
            <CircularProgressbar
              value={humidityValue}
              maxValue={100}
              text={`${humidityValue}%`}
              styles={buildStyles({
                pathColor,
                trailColor: "#1E293B",
                textColor: "#E2E8F0",
                strokeLinecap: "round",
                textSize: "16px",
                pathTransitionDuration: 0.5,
              })}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`p-4 bg-weather-card rounded-2xl shadow-lg h-[600px] flex flex-col ${className}`}
    >
      <h2 className="text-lg font-semibold mb-4">Today's Highlight</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 grid-rows-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isTopRow = index < 3;

          return (
            <div
              key={metric.title}
              className={`min-h-[150px] bg-weather-bg rounded-xl p-4 flex flex-col justify-between shadow-md transition-all duration-300 hover:scale-[1.02] ${
                isTopRow ? "row-span-2 h-[360px]" : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-weather-text-secondary font-semibold ">
                  {metric.title}
                </h3>
                <Icon size={22} className="text-weather-text-secondary" />
              </div>

              {/* Chart / Gauge */}
              <div className="flex-1 flex items-center justify-center min-h-[10px]">
                {renderMetricChart(metric)}
              </div>

              {/* Value */}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-bold text-weather-text-primary">
                  {metric.value}
                  {metric.unit && (
                    <span className="text-sm font-light ml-1">
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
    </div>
  );
};

export default WeatherMetrics;

