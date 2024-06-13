require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { expressjwt: expressJwt } = require('express-jwt');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const secretKey = 'maxiycami';

// Middleware para proteger rutas
const authenticate = expressJwt({ secret: secretKey, algorithms: ['HS256'] });

// Endpoint para autenticación de usuarios
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE usuario_username = $1', [username]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.usuario_password)) {
      const token = jwt.sign({ userId: user.usuario_id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Credenciales inválidas');
    }
  } catch (error) {
    console.error('Error en el proceso de autenticación:', error);
    res.status(500).send('Error en el proceso de autenticación');
  }
});

// Proteger las rutas existentes
app.get('/temperatura', authenticate, async (req, res) => {
  console.log('Solicitud GET recibida en /temperatura');
  try {
    const result = await pool.query('SELECT temperaturas_valor, " temperaturas_timestamp" FROM temperaturas ORDER BY " temperaturas_timestamp"');
    console.log('Datos obtenidos de la base de datos:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los datos de temperatura:', error);
    res.status(500).send('Error al obtener los datos de temperatura: ' + error.message);
  }
});

app.post('/temperatura', authenticate, async (req, res) => {
  const { temperature } = req.body;
  console.log('Nueva solicitud POST recibida en /temperatura');
  console.log('Parámetros de la solicitud:', req.body);
  try {
    // Ajusta el timestamp a la zona horaria de Argentina
    await pool.query('INSERT INTO temperaturas (temperaturas_valor, temperaturas_timestamp) VALUES ($1, NOW() AT TIME ZONE \'America/Argentina/Cordoba\')', [temperature]);
    console.log('Nueva temperatura almacenada:', temperature);
    res.status(201).send('Temperatura almacenada');
  } catch (error) {
    console.error('Error al almacenar la temperatura en la base de datos:', error);
    res.status(500).send('Error al almacenar la temperatura: ' + error.message);
  }
});


app.listen(3002, () => {
  console.log('REST API corriendo en el puerto 3002');
});
