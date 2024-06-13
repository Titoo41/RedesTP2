const WebSocket = require('ws');
const axios = require('axios');

const ws = new WebSocket('ws://localhost:8080');

const generarTemperatura = () => {
  const temperaturaBase = (Math.random() * (73 - 72) + 72).toFixed(2); // Base 72-73
  const temperaturaAlta = (Math.random() * (71 - 69) + 69).toFixed(2); // Alta 69-71

  // Probabilidad del 85% de temperatura base
  if (Math.random() < 0.85) {
    return temperaturaBase;
  } else {
    return temperaturaAlta;
  }
};



let token;

const authenticate = async () => {
  try {
    const response = await axios.post('http://localhost:3002/login', {
      username: 'prueba',
      password: '1234'
    });
    token = response.data.token;
    console.log('Token recibido:', token);
  } catch (error) {
    console.error('Error en la autenticación:', error);
  }
};

ws.on('open', async () => {
  console.log('Conexión establecida con el servidor WebSocket');
  await authenticate();

  setInterval(() => {
    const temperatura = generarTemperatura();
    console.log('Enviando temperatura al servidor WebSocket:', temperatura);
    ws.send(JSON.stringify({ temperatura, token }));
  }, 6000);
});

ws.on('close', () => {
  console.log('Conexión cerrada');
});

ws.on('error', (error) => {
  console.error('Error en la conexión WebSocket:', error);
});
