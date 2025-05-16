/**
 * OpenWeatherMap API Connection Test
 * This script tests if the API key and connection are working correctly
 */

// Get the API key from the main app.js file
const API_KEY = '76f80bacf1a061420af342dcb3d8472b';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Test location (London, UK)
const TEST_CITY = 'London,uk';

/**
 * Test the API connection with a sample request
 */
async function testApiConnection() {
    console.log('Testing OpenWeatherMap API connection...');

    try {
        // Using the official Current Weather API endpoint format
        const response = await fetch(`${API_URL}?q=${TEST_CITY}&units=metric&appid=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        console.log('API Connection Successful! ✅');
        console.log('Response data received:');
        console.log('City:', data.name);
        console.log('Weather:', data.weather[0].main);
        console.log('Description:', data.weather[0].description);
        console.log('Temperature:', data.main.temp, '°C');
        console.log('Full response:', data);

        return {
            success: true,
            data
        };
    } catch (error) {
        console.error('API Connection Failed! ❌');
        console.error('Error:', error.message);

        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test automatically
console.log('AUTO-TEST: Running API connection test automatically...');
testApiConnection().then(result => {
    console.log('AUTO-TEST RESULT:', result.success ? 'SUCCESS' : 'FAILED');
    if (!result.success) {
        console.error('AUTO-TEST ERROR:', result.error);
    }
});

// Export for use in HTML test page
if (typeof window !== 'undefined') {
    window.testApiConnection = testApiConnection;
} 