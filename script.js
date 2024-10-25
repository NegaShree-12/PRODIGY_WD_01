document.addEventListener('DOMContentLoaded', function () {
    // Check if geolocation is available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon); 
        }, () => {
            getWeather(); 
        });
    } else {
        getWeather(); 
    }

    setInterval(getWeather, 900000); 
});

document.getElementById('city').addEventListener('input', function () {
    var city = this.value;
    getWeather(city); 
});

async function getWeather(city = 'New York') {
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                q: city,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            },
        });
        updateWeatherUI(response.data);
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                lat: lat,
                lon: lon,
                appid: '54a57bc234ad752a4f59e59cd372201d',
                units: 'metric'
            },
        });
        updateWeatherUI(response.data);
    } catch (error) {
        console.error('Error fetching weather data by coordinates:', error.message);
    }
}

function updateWeatherUI(data) {
    const currentTemperature = data.list[0].main.temp;
    document.querySelector('.weather-temp').textContent = Math.round(currentTemperature) + 'ºC';
    
    const dailyForecast = parseForecastData(data.list);
    
    document.querySelector('.date-dayname').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    document.querySelector('.location').textContent = data.city.name;
    document.querySelector('.weather-desc').textContent = dailyForecast[0].description;
    document.querySelector('.humidity .value').textContent = dailyForecast[0].humidity + ' %';
    document.querySelector('.wind .value').textContent = dailyForecast[0].windSpeed + ' m/s';

    const dayElements = document.querySelectorAll('.day-name');
    const tempElements = document.querySelectorAll('.day-temp');
    const iconElements = document.querySelectorAll('.day-icon');

    dayElements.forEach((dayElement, index) => {
        const day = dailyForecast[index].day;
        const data = dailyForecast[index];
        dayElement.textContent = day;
        tempElements[index].textContent = `${Math.round(data.minTemp)}º / ${Math.round(data.maxTemp)}º`;
        iconElements[index].innerHTML = getWeatherIcon(data.icon);
    });
}

function parseForecastData(forecastData) {
    const dailyForecast = {};
    forecastData.forEach((data) => {
        const day = new Date(data.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dailyForecast[day]) {
            dailyForecast[day] = {
                day: day,
                minTemp: data.main.temp_min,
                maxTemp: data.main.temp_max,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: data.weather[0].icon,
            };
        } else {
            dailyForecast[day].minTemp = Math.min(dailyForecast[day].minTemp, data.main.temp_min);
            dailyForecast[day].maxTemp = Math.max(dailyForecast[day].maxTemp, data.main.temp_max);
        }
    });
    return Object.values(dailyForecast).slice(0, 4); // Return forecast for 4 days
}

function getWeatherIcon(iconCode) {
    const iconBaseUrl = 'https://openweathermap.org/img/wn/';
    const iconSize = '@2x.png';
    return `<img src="${iconBaseUrl}${iconCode}${iconSize}" alt="Weather Icon">`;
}
