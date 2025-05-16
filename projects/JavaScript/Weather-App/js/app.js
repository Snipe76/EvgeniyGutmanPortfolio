/**
 * Weather App
 * A clean, Apple-inspired weather application using OpenWeatherMap Current Weather API
 */

// DOM Elements
const weatherApp = document.querySelector('.weather-app');
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const useLocationButton = document.getElementById('use-location');
const weatherDisplay = document.getElementById('weather-display');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const currentDate = document.getElementById('current-date');

// Weather information elements
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');

// API Configuration for Current Weather API
const API_KEY = '76f80bacf1a061420af342dcb3d8472b';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Default city (if geolocation and localStorage fail)
const DEFAULT_CITY = 'London,uk';

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Display current date
    updateCurrentDate();

    // Set up event listeners
    searchForm.addEventListener('submit', handleSearch);
    useLocationButton.addEventListener('click', getUserLocation);

    // Initialize weather data
    initializeWeatherData();
});

/**
 * Initialize the app with weather data
 * Priority: 1. Cache if not expired, 2. Last city from localStorage, 3. Geolocation, 4. Default city
 */
function initializeWeatherData() {
    // First check if we have valid cached data
    const cachedData = getCachedWeatherData();

    if (cachedData) {
        console.log('Using cached weather data');
        displayWeatherData(cachedData);
        return;
    }

    // If no valid cache, try to load last location from localStorage
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        console.log('Using last searched city:', lastCity);
        getWeatherByCity(lastCity);
        return;
    }

    // If no stored city, try geolocation
    if (navigator.geolocation) {
        console.log('Attempting to get user location');
        showLoading();

        // Set a timeout for geolocation in case it hangs
        const geoTimeout = setTimeout(() => {
            console.log('Geolocation timed out, using default city');
            getWeatherByCity(DEFAULT_CITY);
        }, 5000);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(geoTimeout);
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                clearTimeout(geoTimeout);
                console.error('Geolocation error:', error);
                getWeatherByCity(DEFAULT_CITY);
            },
            { timeout: 5000, maximumAge: 60000 }
        );
    } else {
        // If geolocation is not available, use default city
        console.log('Geolocation not supported, using default city');
        getWeatherByCity(DEFAULT_CITY);
    }
}

/**
 * Get cached weather data if available and not expired
 * @returns {Object|null} Cached weather data or null if no valid cache exists
 */
function getCachedWeatherData() {
    const cachedData = localStorage.getItem('weatherData');
    const cacheTimestamp = localStorage.getItem('weatherTimestamp');

    if (cachedData && cacheTimestamp) {
        const now = new Date().getTime();
        const timestamp = parseInt(cacheTimestamp);

        // Check if cache is still valid (not expired)
        if (now - timestamp < CACHE_DURATION) {
            try {
                return JSON.parse(cachedData);
            } catch (e) {
                console.error('Error parsing cached data:', e);
                return null;
            }
        }
    }

    return null;
}

/**
 * Cache weather data for future use
 * @param {Object} data - Weather data to cache
 */
function cacheWeatherData(data) {
    try {
        localStorage.setItem('weatherData', JSON.stringify(data));
        localStorage.setItem('weatherTimestamp', new Date().getTime().toString());
    } catch (e) {
        console.error('Error caching weather data:', e);
    }
}

/**
 * Handle search form submission
 * @param {Event} event - The form submit event
 */
function handleSearch(event) {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (city) {
        getWeatherByCity(city);
        cityInput.blur(); // Remove focus from input
    }
}

/**
 * Get user's current location
 */
function getUserLocation() {
    if (navigator.geolocation) {
        showLoading();

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoordinates(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                showError('Unable to get your location. Please try searching for a city instead.');
            },
            { timeout: 10000 }
        );
    } else {
        showError('Geolocation is not supported by your browser. Please search for a city instead.');
    }
}

/**
 * Get weather for a specific city using Current Weather API
 * @param {string} city - City name
 */
function getWeatherByCity(city) {
    showLoading();

    // Using the official Current Weather API endpoint with city name
    // Format: https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
    fetch(`${API_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                const errorMessage = getErrorMessageForStatus(response.status);
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            // Save to localStorage
            localStorage.setItem('lastCity', city);
            // Cache the data
            cacheWeatherData(data);
        })
        .catch(error => {
            console.error('Weather data error:', error);
            showError(error.message);
            // Try to fall back to cached data if available
            const cachedData = getCachedWeatherData();
            if (cachedData) {
                displayWeatherData(cachedData);
                showCachedDataNotice();
            }
        });
}

/**
 * Get weather by geographic coordinates using Current Weather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function getWeatherByCoordinates(lat, lon) {
    // Using the official Current Weather API endpoint with coordinates
    // Format: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
    fetch(`${API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                const errorMessage = getErrorMessageForStatus(response.status);
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then(data => {
            displayWeatherData(data);
            // Save to localStorage if city name is available
            if (data.name) {
                localStorage.setItem('lastCity', data.name);
            }
            // Cache the data
            cacheWeatherData(data);
        })
        .catch(error => {
            console.error('Weather data error:', error);
            showError(error.message);
            // Try to fall back to cached data if available
            const cachedData = getCachedWeatherData();
            if (cachedData) {
                displayWeatherData(cachedData);
                showCachedDataNotice();
            } else {
                // If no cached data, fall back to default city
                getWeatherByCity(DEFAULT_CITY);
            }
        });
}

/**
 * Display weather data in the UI
 * @param {Object} data - Weather data from OpenWeatherMap API
 */
function displayWeatherData(data) {
    // Update UI elements
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°`;
    feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
    weatherDescription.textContent = data.weather[0].description;

    // Set the weather icon using the official icon URL format
    // Format: https://openweathermap.org/img/wn/{icon}@2x.png
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Update additional details
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed)} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Apply theme based on weather conditions
    applyWeatherTheme(data);

    // Show weather display
    hideLoading();
    weatherDisplay.classList.remove('hidden');
}

/**
 * Apply appropriate theme based on weather conditions
 * Uses the weather ID codes from the OpenWeatherMap API documentation
 * @param {Object} data - Weather data
 */
function applyWeatherTheme(data) {
    // Remove existing theme classes
    weatherApp.className = 'weather-app';

    const weatherCode = data.weather[0].id;
    const iconCode = data.weather[0].icon;
    const isNight = iconCode.includes('n');

    // Apply theme based on weather code per the API documentation
    if (weatherCode >= 200 && weatherCode < 300) {
        // Thunderstorm (codes 2xx)
        weatherApp.classList.add('theme-thunder');
    } else if (weatherCode >= 300 && weatherCode < 600) {
        // Rain and drizzle (codes 3xx and 5xx)
        weatherApp.classList.add('theme-rain');
    } else if (weatherCode >= 600 && weatherCode < 700) {
        // Snow (codes 6xx)
        weatherApp.classList.add('theme-snow');
    } else if (weatherCode >= 700 && weatherCode < 800) {
        // Atmosphere (codes 7xx - fog, mist, etc.)
        weatherApp.classList.add('theme-cloudy');
    } else if (weatherCode === 800) {
        // Clear sky (code 800)
        weatherApp.classList.add(isNight ? 'theme-clear-night' : 'theme-clear-day');
    } else {
        // Clouds (codes 801-804)
        weatherApp.classList.add('theme-cloudy');
    }
}

/**
 * Update current date display
 */
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

/**
 * Show loading indicator
 */
function showLoading() {
    weatherDisplay.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingIndicator.classList.remove('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    weatherDisplay.classList.add('hidden');
    loadingIndicator.classList.add('hidden');

    const errorContent = errorMessage.querySelector('p');
    if (errorContent) {
        errorContent.textContent = message;
    }

    errorMessage.classList.remove('hidden');
}

/**
 * Show a notice that cached data is being displayed
 */
function showCachedDataNotice() {
    const errorContent = errorMessage.querySelector('p');
    if (errorContent) {
        errorContent.textContent = 'Showing cached weather data. Unable to fetch latest data.';
    }
    errorMessage.classList.remove('hidden');
}

/**
 * Get a user-friendly error message based on HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} User-friendly error message
 */
function getErrorMessageForStatus(status) {
    switch (status) {
        case 401:
            return 'API key error. Please check your OpenWeatherMap API key.';
        case 404:
            return 'City not found. Please check the spelling or try another location.';
        case 429:
            return 'Too many requests. Please try again later.';
        case 500:
        case 502:
        case 503:
        case 504:
            return 'Weather service is temporarily unavailable. Please try again later.';
        default:
            return 'An error occurred while fetching weather data. Please try again.';
    }
} 