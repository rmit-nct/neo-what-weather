import { useEffect, useState } from "react";
import { DateTime } from "luxon";

interface WindPoint {
  time: string;
  value: number;
}

interface ForecastItem {
  dt: number;
  wind: { speed: number };
}

interface ForecastResponse {
  list: ForecastItem[];
}

export function useWindForecast(lat: number, lon: number, tzName: string) {
  const [windData, setWindData] = useState<WindPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Read API key from Vite env
  const apiKey = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
        );
        if (!res.ok) throw new Error("Failed to fetch wind forecast");

        const data: ForecastResponse = await res.json();

        const formatted: WindPoint[] = data.list.slice(0, 8).map((item) => ({
          time: DateTime.fromSeconds(item.dt, { zone: tzName }).toFormat("h a"),
          value: Math.round(item.wind.speed * 3.6 * 10) / 10,
        }));

        setWindData(formatted);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }

    if (apiKey) {
      fetchForecast();
    } else {
      setError("Missing API key");
    }
  }, [lat, lon, tzName, apiKey]);

  return { windData, loading, error };
}
