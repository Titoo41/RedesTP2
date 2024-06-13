const WebSocket = require('ws');
const axios = require('axios');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Cliente conectado');

  ws.on('message', async message => {
    try {
      const data = JSON.parse(message);
      console.log('Temperatura recibida del cliente:', data.temperatura);

      // Llamar al microservicio webhook con el token
      await axios.post('http://localhost:3003/send-temperature', { temperature: data.temperatura }, {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      console.log('Temperatura enviada al servicio Webhook');
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

console.log('Servidor WebSocket escuchando en el puerto 8080');
