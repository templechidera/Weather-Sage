import { useState, useEffect } from "react";
import WeatherDisplay from "./WeatherDisplay";
import SearchBar from "./SearchBar";
import "./App.css";

function App() {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

  // State Management
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track Network Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Simplified Geolocation Routine on Mount (No High Accuracy)
  useEffect(() => {
    if (!isOnline) {
      setError("You are offline. Please check your internet connection.");
      return;
    }
    if (!navigator.geolocation) {
      handleLocationDenied();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        fetchWeatherData(latitude, longitude, null);
      },
      (err) => {
        console.log("Geolocation error:", err);
        handleLocationDenied();
      },
      {
        enableHighAccuracy: false, // ⚡ Off: Lightweight network-based location for instant mobile loading
        timeout: 10000, // 10 seconds max wait time
        maximumAge: Infinity, // Pull instantly from browser cache if available
      },
    );
  }, [isOnline]);

  // Combined Current Weather and 5-Day/3-Hour Forecast Fetch Logic
  const fetchWeatherData = async (latitude, longitude, city) => {
    if (!isOnline) {
      setError("No internet connection. Please check your network.");
      return;
    }

    setIsLoading(true);
    setError("");

    const currentQuery = city
      ? `${BASE_URL}?q=${city}&units=metric&appid=${API_KEY}`
      : `${BASE_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

    const forecastQuery = city
      ? `${FORECAST_URL}?q=${city}&units=metric&appid=${API_KEY}`
      : `${FORECAST_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(currentQuery),
        fetch(forecastQuery),
      ]);

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      if (currentData.cod && currentData.cod !== 200) {
        setWeather(null);
        setForecast([]);
        setError(city ? `City not found: "${city}"` : "Could not fetch data.");
        return;
      }

      setWeather(currentData);

      if (forecastData.list) {
        // Filter out the 3-hour chunks to get one clean midday snapshot per day
        const dailyData = forecastData.list.filter((item) =>
          item.dt_txt.includes("12:00:00"),
        );
        setForecast(dailyData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setWeather(null);
      setForecast([]);
      setError("Could not retrieve details. Check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationDenied = () => {
    fetchWeatherData(null, null, "Lagos");
  };

  // Triggered when a user hits Enter in the search box
  const handleSearchEnter = () => {
    if (!inputValue.trim()) return;
    fetchWeatherData(null, null, inputValue.trim());
  };

  return (
    <div className="app-container minimal-layout">
      {/* 👑 Application Name Header Title */}
      <header className="app-branding-header">
        <h1 className="app-main-title">weather sage</h1>
      </header>

      {/* Top Search Component placement */}
      <SearchBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        onEnter={handleSearchEnter}
      />

      {/* Main Dynamic Weather Display Workspace Component */}
      <WeatherDisplay
        weather={weather}
        forecast={forecast}
        isLoading={isLoading}
        error={error}
      />

      {/* Center-aligned Tagline Footer */}
      <footer className="minimal-footer">
        <p>Developed by Temple Chidera</p>
      </footer>
    </div>
  );
}

export default App;
