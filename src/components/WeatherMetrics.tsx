import { CurrentWeather, weatherApi } from "@/services/weatherApi";
import { Wind, Eye, Droplets, Sun, Sunset } from "lucide-react";
import { DateTime } from "luxon";
import tzlookup from "tz-lookup";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { useWindForecast } from "@/hooks/useWindForecast";
import { lazy, Suspense } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import RadialSeparators from "@/components/ui/RadialSeparators";
import { Progress } from "@/components/ui/progress";

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
      progress: true,
      progressPercent: sunPercent * 100,
      sunrise: sunriseLocal.toFormat("h:mm a"),
      sunset: sunsetLocal.toFormat("h:mm a"),
      icon: Sunset,
    },
    {
      title: "Humidity",
      value: weather.main.humidity,
      subtitle:
        weather.main.humidity > 70
          ? "High"
          : weather.main.humidity > 30
            ? "Normal"
            : "Low",
      icon: Droplets,
      circular: true,
    },
    {
      title: "Visibility",
      value: Math.round(weather.visibility / 1000),
      subtitle:
        weather.visibility > 8000
          ? "Good"
          : weather.visibility > 5000
            ? "Moderate"
            : "Poor",
      icon: Eye,
      gauge: true,
      gaugePercent: Math.min(weather.visibility / 10000, 1), // normalize to 0–10 km
      gaugeColors: ["#ef4444", "#facc15", "#22c55e"],
    },
  ];

  return (
    <div
      className={`p-4 bg-weather-card rounded-2xl shadow-lg h-full flex flex-col ${className}`}
    >
      <h2 className="text-lg text-center font-semibold mb-4">HIGHLIGHTS</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-weather-bg rounded-xl p-3 flex flex-col justify-between shadow-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-weather-text-secondary font-medium text-sm">
                  {metric.title}
                </h3>
                <Icon size={16} className="text-weather-text-secondary" />
              </div>

              {/* Chart / Gauge / Progress */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[60px] space-y-2">
                {metric.chart ? (
                  loading ? (
                    <span className="text-xs text-weather-text-secondary">
                      Loading...
                    </span>
                  ) : error ? (
                    <span className="text-xs text-red-400">
                      Failed to load wind data
                    </span>
                  ) : windData && windData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={60}>
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
                    <span className="text-xs text-weather-text-secondary">
                      No wind data
                    </span>
                  )
                ) : metric.gauge ? (
                  <div className="h-24 w-full">
                    <Suspense
                      fallback={<span className="text-xs">Loading...</span>}
                    >
                      <GaugeChart
                        id={`${metric.title}-gauge`}
                        nrOfLevels={metric.gaugeColors.length * 3}
                        colors={metric.gaugeColors}
                        percent={metric.gaugePercent}
                        arcPadding={0.02}
                        textColor="#fff"
                        animate
                        formatTextValue={() =>
                          metric.title.includes("Visibility")
                            ? `${metric.value} km`
                            : metric.value?.toString()
                        }
                        style={{ height: "96px" }}
                      />
                    </Suspense>
                  </div>
                ) : metric.circular ? (
                  <div className="w-24 h-24">
                    <CircularProgressbarWithChildren
                      value={Number(metric.value)}
                      strokeWidth={10}
                      styles={buildStyles({
                        strokeLinecap: "butt",
                        pathColor:
                          Number(metric.value) > 70
                            ? "#ef4444"
                            : Number(metric.value) > 30
                              ? "#facc15"
                              : "#22c55e",
                        trailColor: "#1E293B",
                      })}
                    >
                      <RadialSeparators
                        count={12}
                        style={{
                          background: "#fff",
                          width: "2px",
                          height: "10%",
                        }}
                      />
                      <div className="text-sm font-semibold text-slate-200">
                        {metric.value}%
                      </div>
                    </CircularProgressbarWithChildren>
                  </div>
                ) : metric.progress ? (
                  <div className="w-full">
                    <Progress
                      value={metric.progressPercent}
                      className="h-3 bg-slate-800"
                    />
                    <div className="flex justify-between text-xs text-weather-text-secondary mt-1">
                      <span>{metric.sunrise}</span>
                      <span>{metric.sunset}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Subtitle / Extra info */}
              {metric.subtitle && (
                <div className="mt-2 text-center text-xs text-weather-text-secondary">
                  {metric.chart
                    ? `${metric.value} ${metric.unit} | ${metric.subtitle}`
                    : metric.subtitle}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherMetrics;
