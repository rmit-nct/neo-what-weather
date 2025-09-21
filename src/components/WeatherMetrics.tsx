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

  const sunriseLocal = DateTime.fromSeconds(weather.sys.sunrise, {
    zone: tzName,
  });
  const sunsetLocal = DateTime.fromSeconds(weather.sys.sunset, {
    zone: tzName,
  });

  // Chart-based Sunrise/Sunset Arc Visualization (like wind chart)
  const SunriseArcVisualization = () => {
    const now = DateTime.now().setZone(tzName);
    
    // Calculate sun position (0 to 1, where 0 is sunrise, 1 is sunset)
    const calculateSunPosition = () => {
      const nowTime = now.toMillis();
      const sunrise = sunriseLocal.toMillis();
      const sunset = sunsetLocal.toMillis();
      
      if (nowTime <= sunrise) return 0;
      if (nowTime >= sunset) return 1;
      
      return (nowTime - sunrise) / (sunset - sunrise);
    };

    const sunProgress = calculateSunPosition();
    
    // Create arc data points for smooth curve (similar to wind chart)
    const createArcData = () => {
      const points = [];
      const numPoints = 50; // More points for smoother arc
      
      for (let i = 0; i <= numPoints; i++) {
        const progress = i / numPoints; // 0 to 1
        const angle = Math.PI * progress; // 0 to π radians
        
        // Create Y value for arc shape (inverted sine for sunrise arc)
        const y = Math.sin(angle) * 100; // 0 to 100 scale
        const time = sunriseLocal.plus({ 
          milliseconds: progress * (sunsetLocal.toMillis() - sunriseLocal.toMillis()) 
        });
        
        points.push({
          x: i,
          y: y,
          time: time.toFormat("h:mm a"),
          progress: progress,
          isCurrent: Math.abs(progress - sunProgress) < 0.02 // Mark current position
        });
      }
      
      return points;
    };

    const arcData = createArcData();

    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        {/* Interactive Arc Chart - full width to reach card padding */}
        <div className="w-full h-28 sm:h-32 mb-4 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={arcData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <defs>
                {/* Gradient fill for the arc */}
                <linearGradient id="sunArcGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCD34D" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#FCD34D" stopOpacity={0.1} />
                </linearGradient>
                
                {/* Radial gradient for sun glow effect */}
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FCD34D" stopOpacity={1} />
                  <stop offset="70%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#FCD34D" stopOpacity={0.3} />
                </radialGradient>
              </defs>
              
              <Area
                type="monotone"
                dataKey="y"
                stroke="#FCD34D"
                strokeWidth="3"
                fill="url(#sunArcGradient)"
                strokeDasharray="6 4" // Dashed line like reference
                strokeLinecap="round"
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-800/95 border border-amber-500/50 rounded-lg p-3 shadow-lg">
                        <div className="text-amber-400 text-sm font-medium">
                          {data.progress < 0.5 ? "Morning" : "Evening"}
                        </div>
                        <div className="text-white text-sm">{data.time}</div>
                        <div className="text-amber-200 text-xs">
                          {Math.round(data.progress * 100)}% through daylight
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Time labels positioned closer to edges */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full px-1 gap-4">
          <div className="text-center group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-8 h-8 mx-auto mb-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="text-amber-400 text-xs font-medium">Sunrise</div>
            <div className="text-white text-sm font-semibold">
              {sunriseLocal.toFormat("h:mm a")}
            </div>
          </div>
          
          <div className="text-center group cursor-pointer hover:scale-105 transition-transform">
            <div className="w-8 h-8 mx-auto mb-1 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="text-amber-400 text-xs font-medium">Sunset</div>
            <div className="text-white text-sm font-semibold">
              {sunsetLocal.toFormat("h:mm a")}
            </div>
          </div>
        </div>
        
        {/* Progress indicator moved down with full width */}
        <div className="w-full mt-2 sm:mt-4 px-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Daylight Progress</span>
            <span>{Math.round(sunProgress * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${sunProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const metrics = [
    {
      title: "Wind Status",
      value: Math.round(weather.wind.speed * 3.6),
      unit: "km/h",
      subtitle: `${weather.wind.deg}\u00B0`,
      icon: Wind,
      chart: true,
      gradient: {
        base: "bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95",
        overlay: "bg-gradient-to-r from-cyan-500/25 via-cyan-400/15 to-transparent mix-blend-overlay"
      }
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
      gradient: {
        base: "bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95",
        overlay: "bg-gradient-to-r from-orange-500/30 via-orange-400/20 to-transparent mix-blend-overlay"
      }
    },
    {
      title: "Sunrise & Sunset",
      value: sunriseLocal.toFormat("h:mm"),
      unit: sunriseLocal.toFormat("a"),
      subtitle: `${sunsetLocal.toFormat("h:mm")} ${sunsetLocal.toFormat("a")}`,
      icon: Sunset,
      sunArc: true,
      gradient: {
        base: "bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95",
        overlay: "bg-gradient-to-r from-amber-500/35 via-yellow-400/25 to-transparent mix-blend-overlay"
      }
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
      gradient: {
        base: "bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95",
        overlay: "bg-gradient-to-r from-slate-500/20 via-slate-400/10 to-transparent mix-blend-overlay"
      }
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
      gradient: {
        base: "bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95",
        overlay: "bg-gradient-to-r from-teal-500/25 via-teal-400/15 to-transparent mix-blend-overlay"
      }
    },
    {
      title: "Feels Like",
      value: Math.round(weather.main.feels_like),
      unit: "\u00B0C",
      subtitle:
        Math.abs(weather.main.feels_like - weather.main.temp) <= 2
          ? "Similar to actual"
          : "Different from actual",
      icon: Thermometer,
      gradient: {
        base: "bg-gradient-to-b from-slate-900/95 via-slate-600/95 to-slate-900/95",
        overlay: "bg-gradient-to-r from-slate-500/20 via-slate-400/10 to-transparent mix-blend-overlay"
      }
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
          <span className="text-xs text-red-400">Failed to load wind data</span>
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
            style={{ width: "100%", maxWidth: "260px", height: "120px" }}
          />
        </Suspense>
      );
    }

    if (metric.sunArc) {
      return <SunriseArcVisualization />;
    }

    return null;
  };

  return (
    <div
      className={`p-4 bg-weather-card rounded-2xl shadow-lg flex flex-col lg:!h-[600px] ${className}`}
    >
      <h2 className="text-lg font-semibold mb-4">Today's Highlight</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 flex-1 overflow-hidden">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isTopRow = index < 3;

          return (
            <div
              key={metric.title}
              className={`relative flex flex-col rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:scale-[1.02] ${
                isTopRow 
                  ? "xl:row-span-2 min-h-[170px] xl:min-h-0" 
                  : "min-h-[140px] xl:min-h-0"
              }`}
            >
              {/* Gradient backgrounds */}
              <div className={`absolute inset-0 ${metric.gradient.base}`} />
              <div className={`absolute inset-0 ${metric.gradient.overlay}`} />
              
              {/* Content */}
              <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 font-semibold text-sm">
                    {metric.title}
                  </h3>
                  <Icon size={22} className="text-gray-400" />
                </div>

                {/* Chart / Gauge / Sun Arc */}
                <div className="flex-1 flex items-center justify-center min-h-[10px] w-full">
                  {renderMetricChart(metric)}
                </div>

                {/* Value - Only show if not sunArc (since sunArc renders its own values) */}
                {!metric.sunArc && (
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-5xl font-medium text-white">
                      {metric.value}
                      {metric.unit && (
                        <span className="text-lg font-light ml-1 text-gray-400">
                          {metric.unit}
                        </span>
                      )}
                    </span>
                    {metric.subtitle && (
                      <span className="text-sm text-gray-300">
                        {metric.subtitle}
                      </span>
                    )}
                  </div>
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