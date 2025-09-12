
import React, { useState } from "react";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiCloudy,
} from "react-icons/wi";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);


  
  

  // Get background color for forecast cards
  const getCardColor = (code) => {
    if (code === 0) return "#FFE066"; // Sunny
    if (code >= 1 && code <= 3) return "#B0C4DE"; // Cloudy
    if (code === 45 || code === 48) return "#A9A9A9"; // Fog
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
      return "#87CEEB"; // Rain
    if (code >= 71 && code <= 77) return "#ADD8E6"; // Snow
    if (code >= 95 && code <= 99) return "#FF7F7F"; // Thunderstorm
    return "#E0E0E0"; // Default
  };

  // Weather icons with animations
  const getWeatherIcon = (code, size = 50) => {
    if (code === 0)
      return <WiDaySunny size={size} className="icon sun" color="#FFD700" />;
    if (code >= 1 && code <= 3)
      return <WiCloud size={size} className="icon cloud" color="#B0C4DE" />;
    if (code === 45 || code === 48)
      return <WiFog size={size} className="icon cloud" color="#778899" />;
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
      return <WiRain size={size} className="icon rain" color="#1E90FF" />;
    if (code >= 71 && code <= 77)
      return <WiSnow size={size} className="icon snow" color="#00BFFF" />;
    if (code >= 95 && code <= 99)
      return (
        <WiThunderstorm size={size} className="icon thunder" color="#FF4500" />
      );
    return <WiCloudy size={size} className="icon cloud" color="#A9A9A9" />;
  };

  // Fetch weather
  const fetchWeather = async () => {
    try {
      // 1. Get city coordinates
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found!");
        setWeather(null);
        setForecast([]);
        

        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // 2. Get weather data
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relative_humidity_2m,precipitation&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto`
      );
      const data = await res.json();

      if (!data.current_weather) {
        throw new Error("Weather data not available");
      }

  

      // 3. Update states
      setWeather({ ...data.current_weather, name, country });
      setForecast(data.daily);
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
      setWeather(null);
      setForecast(null);
     


    }
  };

  return (
    <div className="app">
      <h1>🌤 Weather App</h1>
      <div className="search">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>
            {weather?.name}, {weather?.country}
          </h2>
          {getWeatherIcon(weather.weathercode, 70)}
          <p>🌡 Temperature: {weather.temperature}°C</p>
          <p>💨 Wind Speed: {weather.windspeed} km/h</p>
          
        </div>
      )}

      {forecast.time &&  (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-container">
            {forecast.time.slice(0, 5).map((day, i) => (
              <div
                key={i}
                className="forecast-card"
                style={{ backgroundColor: getCardColor(forecast.weathercode[i]) }}
              >
                <h3>{day}</h3>
                {getWeatherIcon(forecast.weathercode[i], 40)}
                <p>🌡 Max: {forecast.temperature_2m_max[i]}°C</p>
                <p>❄ Min: {forecast.temperature_2m_min[i]}°C</p>
                <p>🌧 Rain: {forecast.precipitation_sum[i]} mm</p>
                
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
