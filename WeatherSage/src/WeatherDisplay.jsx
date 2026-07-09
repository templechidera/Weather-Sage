import React from "react";

export default function WeatherDisplay({
  weather,
  forecast = [],
  isLoading,
  error,
}) {
  if (isLoading) {
    return (
      <div className="dashboard-content">
        <div
          className="weather-card-main skeleton-pulse"
          style={{ height: "240px", width: "100%" }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="weather-error-container">
          <span className="error-icon">⚠️</span>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather || !weather.main) return null;

  const getWeatherEmoji = (iconCode) => {
    if (!iconCode) return "☀️";
    if (iconCode.includes("01")) return "☀️";
    if (
      iconCode.includes("02") ||
      iconCode.includes("03") ||
      iconCode.includes("04")
    )
      return "⛅";
    if (iconCode.includes("09") || iconCode.includes("10")) return "🌧️";
    if (iconCode.includes("11")) return "⛈️";
    if (iconCode.includes("13")) return "❄️";
    return "💨";
  };

  const formatDayName = (dateText) => {
    if (!dateText) return "---";
    const date = new Date(dateText);
    if (isNaN(date.getTime())) return "---";
    return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  };

  // 🎯 NEW SMART WEATHER CONDITION CALCULATOR
  const getWeatherConditionStats = () => {
    const id = weather.weather?.[0]?.id;
    const humidity = weather.main?.humidity || 50;
    const cloudCover = weather.clouds?.all || 0;

    if (!id) return "☀️ Sky: Clear";

    if (id >= 200 && id < 600) {
      return "🌧️ Rain Prob: 95%";
    }

    if (id >= 600 && id < 700) {
      return "❄️ Snow Prob: 90%";
    }

    // 3. For clear sky (Group 800)
    if (id === 800) {
      return "☀️ Sunshine: High";
    }

    if (id > 800 && id <= 804) {
      const calculatedProbability = Math.round((cloudCover + humidity) / 2);

      if (calculatedProbability < 40) {
        return "⛅ Sunshine: Moderate";
      }

      return `🌧️ Rain Prob: ${calculatedProbability}%`;
    }

    return "☀️ Sky: Stable";
  };

  return (
    <div className="dashboard-content">
      <div className="main-display-column">
        <div className="weather-card-main">
          <div className="card-header-info">
            <h2 className="location-name">{weather.name}</h2>
            <div className="temp-condition-row">
              <h1 className="main-temperature">
                {Math.round(weather.main.temp)}°
              </h1>
              <div className="main-weather-icon-box">
                {getWeatherEmoji(weather.weather?.[0]?.icon)}
              </div>
            </div>
            <p className="weather-condition-text">
              {weather.weather?.[0]?.main || "Clear"}
            </p>

            <div className="compact-stats-row">
              <span>{getWeatherConditionStats()}</span>
              <span>💧 Humidity {weather.main.humidity}%</span>
              <span>🌬️ Wind {Math.round(weather.wind.speed)}m/s</span>
            </div>
          </div>
        </div>

        <div className="forecast-container-box">
          <h3 className="details-box-title">Upcoming Forecast</h3>
          <div className="forecast-horizontal-row">
            {forecast && forecast.length > 0 ? (
              forecast.map((day, index) => (
                <div key={index} className="forecast-mini-card">
                  <span className="forecast-day-title">
                    {formatDayName(day.dt_txt)}
                  </span>
                  <div className="forecast-mini-icon">
                    {getWeatherEmoji(day.weather?.[0]?.icon)}
                  </div>
                  <span className="forecast-mini-temp">
                    {day.main ? Math.round(day.main.temp) : "--"}°
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: "#64748b", fontSize: "14px", padding: "8px" }}>
                No forecast data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
