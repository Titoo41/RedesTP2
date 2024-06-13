const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const secretKey = 'your_secret_key';

const sendTemperature = async (temperature, token) => {
  try {
    console.log('Enviando temperatura al REST API...');
    console.log('Token:', token); // Agregamos este log para verificar el token
    console.log('Temperatura:', temperature); // Agregamos este log para verificar la temperatura
    await axios.post('http://localhost:3002/temperatura', { temperature }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Temperatura enviada al REST API');
  } catch (error) {
    console.error('Error al enviar la temperatura al REST API:', error);
  }
};

app.post('/send-temperature', async (req, res) => {
  const { temperature } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  try {
    console.log('Recibida solicitud para enviar temperatura.');
    console.log('Token:', token); // Agregamos este log para verificar el token recibido
    console.log('Temperatura:', temperature); // Agregamos este log para verificar la temperatura recibida
    await sendTemperature(temperature, token);
    res.status(200).send('Temperatura enviada');
  } catch (error) {
    console.error('Error al enviar la temperatura:', error);
    res.status(500).send('Error al enviar la temperatura');
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Webhook service corriendo en el puerto ${PORT}`);
});
