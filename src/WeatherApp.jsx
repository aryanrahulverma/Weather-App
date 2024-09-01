import React, { useState, useEffect } from "react";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";

const API_KEY = "bd5e378503939ddaee76f12ad7a97608"; // Replace with your actual API key

const WeatherIcon = ({ condition }) => {
  switch (condition.toLowerCase()) {
    case "clear":
      return <WiDaySunny className="text-yellow-400 text-6xl" />;
    case "clouds":
      return <WiCloudy className="text-gray-400 text-6xl" />;
    case "rain":
      return <WiRain className="text-blue-400 text-6xl" />;
    case "snow":
      return <WiSnow className="text-blue-200 text-6xl" />;
    case "thunderstorm":
      return <WiThunderstorm className="text-gray-600 text-6xl" />;
    default:
      return <WiFog className="text-gray-400 text-6xl" />;
  }
};

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (searchCity, lat = null, lon = null) => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&units=metric&appid=${API_KEY}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      const currentWeather = data.list[0];
      //   const forecast = data.list.filter((item, index) => index % 8 === 0).slice(1, 6);
      const forecastMap = new Map(); // Initialize a Map to track unique days

      for (const item of data.list) {
        const date = new Date(item.dt * 1000).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (!forecastMap.has(date)) {
          // Check if the date is already in the Map
          forecastMap.set(date, {
            // Add unique date with temperature and icon
            temp: Math.round(item.main.temp),
            icon: item.weather[0].main,
          });
        }
      }

      const forecast = Array.from(forecastMap.entries()).slice(1, 6).map(([day, { temp, icon }]) => ({
        day,
        temp,
        icon,
      }));
      setWeather({
        current: {
          city: data.city.name,
          temperature: Math.round(currentWeather.main.temp),
          condition: currentWeather.weather[0].main,
          humidity: currentWeather.main.humidity,
          windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
          icon: currentWeather.weather[0].main,
        },
        // forecast: forecast.map((item) => ({
        //   day: new Date(item.dt * 1000).toLocaleDateString("en-US", {
        //     weekday: "short",
        //   }),
        //   temp: Math.round(item.main.temp),
        //   icon: item.weather[0].main,
        // })),
        forecast,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city) fetchWeather(city);
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeather(null, lat, lon);
        },
        (error) => {
          setError("Error getting location. Please try entering a city name.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    fetchWeather("New York");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Weather App
        </h1>
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleGeolocation}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>

        {loading && <div className="text-center text-gray-600">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {weather && !loading && !error && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {weather.current.city}
              </h2>
              <div className="flex items-center justify-center mt-2">
                <WeatherIcon condition={weather.current.icon} />
                <span className="text-5xl ml-4">
                  {weather.current.temperature}°C
                </span>
              </div>
              <p className="text-xl mt-2 text-gray-600">
                {weather.current.condition}
              </p>
              <div className="flex justify-center gap-4 mt-2 text-gray-600">
                <p>Humidity: {weather.current.humidity}%</p>
                <p>Wind: {weather.current.windSpeed} km/h</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                5-Day Forecast
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {weather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="text-center bg-gray-100 rounded-lg p-2"
                  >
                    <p className="font-semibold text-gray-700">{day.day}</p>
                    <WeatherIcon condition={day.icon} />
                    <p className="text-gray-600">{day.temp}°C</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;
