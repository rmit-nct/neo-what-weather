import { CurrentWeather, ForecastResponse } from '@/services/weatherApi';

// Mock data for demo purposes when API is not available
export const mockCurrentWeather: CurrentWeather = {
  id: 4166865,
  name: "Florida",
  country: "US",
  weather: [
    {
      id: 201,
      main: "Thunderstorm",
      description: "thunderstorm with rain",
      icon: "11d"
    }
  ],
  main: {
    temp: 28,
    feels_like: 32,
    temp_min: 25,
    temp_max: 31,
    pressure: 1012,
    humidity: 84,
    sea_level: 1012,
    grnd_level: 1011
  },
  visibility: 8000,
  wind: {
    speed: 7.9,
    deg: 180,
    gust: 12.5
  },
  clouds: {
    all: 75
  },
  dt: 1642781400,
  sys: {
    type: 2,
    id: 2005015,
    country: "US",
    sunrise: 1642764000,
    sunset: 1642802400
  },
  timezone: -18000,
  coord: {
    lon: -82.46,
    lat: 27.77
  }
};

export const mockForecast: ForecastResponse = {
  list: [
    {
      dt: 1642781400,
      main: {
        temp: 29,
        feels_like: 33,
        temp_min: 26,
        temp_max: 32,
        pressure: 1013,
        humidity: 80
      },
      weather: [
        {
          id: 801,
          main: "Clouds",
          description: "few clouds",
          icon: "02d"
        }
      ],
      clouds: { all: 20 },
      wind: { speed: 6.2, deg: 190 },
      visibility: 10000,
      pop: 0.2,
      dt_txt: "2024-01-21 12:00:00"
    },
    {
      dt: 1642867800,
      main: {
        temp: 21,
        feels_like: 24,
        temp_min: 18,
        temp_max: 24,
        pressure: 1015,
        humidity: 65
      },
      weather: [
        {
          id: 500,
          main: "Rain",
          description: "light rain",
          icon: "10d"
        }
      ],
      clouds: { all: 60 },
      wind: { speed: 4.5, deg: 200 },
      visibility: 8000,
      pop: 0.8,
      dt_txt: "2024-01-22 12:00:00"
    },
    {
      dt: 1642954200,
      main: {
        temp: 24,
        feels_like: 26,
        temp_min: 21,
        temp_max: 27,
        pressure: 1016,
        humidity: 70
      },
      weather: [
        {
          id: 802,
          main: "Clouds",
          description: "scattered clouds",
          icon: "03d"
        }
      ],
      clouds: { all: 40 },
      wind: { speed: 5.1, deg: 210 },
      visibility: 9000,
      pop: 0.3,
      dt_txt: "2024-01-23 12:00:00"
    },
    {
      dt: 1643040600,
      main: {
        temp: 30,
        feels_like: 35,
        temp_min: 27,
        temp_max: 33,
        pressure: 1011,
        humidity: 85
      },
      weather: [
        {
          id: 200,
          main: "Thunderstorm",
          description: "thunderstorm with light rain",
          icon: "11d"
        }
      ],
      clouds: { all: 90 },
      wind: { speed: 8.2, deg: 170 },
      visibility: 6000,
      pop: 0.9,
      dt_txt: "2024-01-24 12:00:00"
    },
    {
      dt: 1643127000,
      main: {
        temp: 23,
        feels_like: 25,
        temp_min: 20,
        temp_max: 26,
        pressure: 1018,
        humidity: 60
      },
      weather: [
        {
          id: 800,
          main: "Clear",
          description: "clear sky",
          icon: "01d"
        }
      ],
      clouds: { all: 5 },
      wind: { speed: 3.8, deg: 220 },
      visibility: 10000,
      pop: 0.1,
      dt_txt: "2024-01-25 12:00:00"
    }
  ],
  city: {
    id: 4166865,
    name: "Florida",
    coord: {
      lat: 27.77,
      lon: -82.46
    },
    country: "US",
    population: 21944577,
    timezone: -18000,
    sunrise: 1642764000,
    sunset: 1642802400
  }
};