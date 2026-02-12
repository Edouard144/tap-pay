const BACKEND_URL = 'http://localhost:3000';
const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const MQTT_TOPIC_PREFIX = 'rfid/edouard/';

// Configuration for different environments
const config = {
  // Automatically detect if running locally or on production
  getBackendUrl: function() {
    const hostname = window.location.hostname;
    
    // If running on localhost, use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8208';
    }
    
    // If running on production VPS
    return 'http://157.173.101.159:8208';
  }
};


// Export the backend URL

