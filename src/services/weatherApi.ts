import axios from 'axios';

// Demo mode - set to false to use real API calls
const DEMO_MODE = false;
// Fixed to use VITE_ prefix
const API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY || ''; // Replace with your actual API key if not using env
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export interface CurrentWeather {
  id: number;
  name: string;
  country: string;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  coord: {
    lon: number;
    lat: number;
  };
}

export interface ForecastDay {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  dt_txt: string;
}

export interface ForecastResponse {
  list: ForecastDay[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface CitySearchResult {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

class WeatherApiService {
  async getCurrentWeather(city: string): Promise<CurrentWeather> {
    if (DEMO_MODE) {
      // Return mock data for demo
      const { mockCurrentWeather } = await import('@/data/mockWeatherData');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...mockCurrentWeather, name: city.split(',')[0].trim() };
    }

    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('City not found or API error');
    }
  }

  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
    if (DEMO_MODE) {
      const { mockCurrentWeather } = await import('@/data/mockWeatherData');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockCurrentWeather;
    }

    try {
      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Weather data not available');
    }
  }

  async getForecast(city: string): Promise<ForecastResponse> {
    if (DEMO_MODE) {
      const { mockForecast } = await import('@/data/mockWeatherData');
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockForecast;
    }

    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Forecast data not available');
    }
  }

  async getForecastByCoords(lat: number, lon: number): Promise<ForecastResponse> {
    if (DEMO_MODE) {
      const { mockForecast } = await import('@/data/mockWeatherData');
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockForecast;
    }

    try {
      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('Forecast data not available');
    }
  }

  async searchCities(query: string): Promise<CitySearchResult[]> {
    if (query.length < 2) return [];

    if (DEMO_MODE) {
      // Mock search results
      const mockResults: CitySearchResult[] = [
        { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US', state: 'NY' },
        { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
        { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
        { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
      ].filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      );
      
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockResults;
    }
    
    try {
      const response = await axios.get(`${GEO_URL}/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: API_KEY
        }
      });
      return response.data;
    } catch (error) {
      return [];
    }
  }

  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  // UV Index calculation (approximate based on weather conditions)
  calculateUVIndex(weather: CurrentWeather): number {
    const cloudCover = weather.clouds.all;
    const baseUV = 5; // Base UV for clear conditions
    const reduction = (cloudCover / 100) * 3;
    return Math.max(1, Math.round(baseUV - reduction));
  }
}

export const weatherApi = new WeatherApiService();