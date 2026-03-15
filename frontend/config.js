const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8272'
  : 'http://157.173.101.159:8272';

const MQTT_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
const MQTT_TOPIC_PREFIX = 'rfid/user262/';

// Configuration for different environments
const config = {
  getBackendUrl: () => BACKEND_URL,
  getMqttPrefix: () => MQTT_TOPIC_PREFIX
};

