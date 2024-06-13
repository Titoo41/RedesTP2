const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg'); 
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(bodyParser.json());
app.use(cors())

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://usertemp:AfNoP6Azo7BnPtiGCskdNANxw9BAcBj7@dpg-cp7s30kf7o1s73ekdqv0-a.oregon-postgres.render.com/dbtemp_8tn8',
    ssl: { rejectUnauthorized: false }
});

const plainPassword = 'newpassword'; // Replace with the actual password
const username = 'newuser'; // Replace with the actual username

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const client = await pool.connect();

        // Fetch user from the 'usuarios' table
        const result = await client.query('SELECT * FROM usuarios WHERE usuario_username = $1', [username]);
        const user = result.rows[0];
        client.release(); // Release the client back to the pool

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.usuario_password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user.usuario_id }, 'maxiycami', { expiresIn: '1h' });

        res.json({ token });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.listen(3005, () => {
    console.log('Servidor de autenticación escuchando en el puerto 3005');
});
