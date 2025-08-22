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
    <div className="border-8 border-grey-500 gap-5 p-5 rounded-lg weather-card-hover">
      <h2 className="text-xl font-semibold mb-4">
                  Today's Highlight
                </h2>
      <div className={className}>
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className={`weather-card bg-weather-card rounded-2xl shadow-lg flex flex-col justify-between 
            ${idx < 3 ? "p-6 min-h-[200px]" : "p-4 min-h-[100px]"}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-weather-text-secondary font-medium text-base">
                  {metric.title}
                </h3>
                {idx >= 3 && Icon && (
                  <Icon size={20} className="text-weather-text-secondary" />
                )}
              </div>

              {/* Chart / Gauge */}
              {metric.chart ? (
                <div className="flex-1 flex items-center justify-center h-20">
                  {loading ? (
                    <span className="text-sm text-weather-text-secondary">
                      Loading...
                    </span>
                  ) : error ? (
                    <span className="text-sm text-red-400">
                      Failed to load wind data
                    </span>
                  ) : windData && windData.length > 0 ? (
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
                  ) : (
                    <span className="text-sm text-weather-text-secondary">
                      No wind data
                    </span>
                  )}
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
    </div>
  );
};

export default WeatherMetrics;
