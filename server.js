// server.js (VERSIÓN RAILWAY + POSTGRES)
require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const { Pool } = require('pg'); // Cliente de PostgreSQL
const cors = require('cors');

const app = express();
// Railway nos asigna un puerto dinámico, si no existe usamos 3000
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE BASE DE DATOS (Railway nos dará esta URL automáticamente)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para conexiones seguras en Railway
    }
});

// Endpoint de prueba para ver si el servidor vive
app.get('/', (req, res) => {
    res.send('🚀 Servidor SubsiMatch funcionando en Railway!');
});

// RUTA PARA CREAR LA TABLA AUTOMÁTICAMENTE (Solo para inicializar)
app.get('/init-db', async (req, res) => {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS usuarios_lead (
                id SERIAL PRIMARY KEY,
                nombre_completo VARCHAR(255),
                email VARCHAR(255),
                telefono VARCHAR(50),
                region VARCHAR(100),
                macro_region VARCHAR(100),
                adultos INTEGER,
                ninos INTEGER,
                total_personas INTEGER,
                sueldo_clp INTEGER,
                banco_preferencia VARCHAR(100),
                tasa_banco NUMERIC(5,4),
                plazo_anos INTEGER,
                tiene_subsidio VARCHAR(10),
                tipo_subsidio VARCHAR(50),
                desea_postular VARCHAR(50),
                ahorro_uf NUMERIC(10,2),
                subsidio_uf NUMERIC(10,2),
                credito_max_uf NUMERIC(10,2),
                valor_max_vivienda_uf NUMERIC(10,2),
                joven_soltero VARCHAR(10),
                estado_lead VARCHAR(50) DEFAULT 'INSCRITO',
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(sql);
        res.send("✅ Tabla 'usuarios_lead' creada o verificada en PostgreSQL.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al crear tabla: " + err.message);
    }
});

// RUTA PRINCIPAL (GUARDAR LEAD)
app.post('/api/lead', async (req, res) => {
    try {
        const data = req.body;
        console.log("📩 Nuevo Lead:", data.EMAIL);

        const sql = `
            INSERT INTO usuarios_lead (
                nombre_completo, email, telefono, region, macro_region,
                adultos, ninos, total_personas,
                sueldo_clp, banco_preferencia, tasa_banco, plazo_anos,
                tiene_subsidio, tipo_subsidio, desea_postular,
                ahorro_uf, subsidio_uf, credito_max_uf, valor_max_vivienda_uf,
                joven_soltero
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            ) RETURNING id
        `;

        const values = [
            data.NOMBRE_COMPLETO, data.EMAIL, data.TELEFONO, data.REGION, data.MACRO_REGION,
            data.ADULTOS, data.NINOS, data.TOTAL_PERSONAS,
            data.SUELDO_CLP, data.BANCO, data.TASA_BANCO, data.PLAZO_ANOS,
            data.TIENE_SUBSIDIO, data.TIPO_SUBSIDIO, data.DESEA_POSTULAR,
            data.AHORRO_UF, data.SUBSIDIO_UF, data.CREDITO_MAX_UF, data.VALOR_MAX_VIVIENDA_UF,
            data.JOVEN_SOLTERO
        ];

        const result = await pool.query(sql, values);
        
        console.log("✅ Guardado ID:", result.rows[0].id);
        res.status(200).json({ success: true, id: result.rows[0].id });

    } catch (err) {
        console.error("❌ Error Postgres:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});