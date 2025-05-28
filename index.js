
const express = require('express');                  
const pool = require('./bd');                        
const swaggerUi = require('swagger-ui-express');    
const YAML = require('yamljs');                      
const cors = require('cors');                        

const app = express();
const PORT = 3000;


app.use(cors());


app.use(express.json());


app.use(express.urlencoded({ extended: true }));


try {
    const swaggerDocument = YAML.load('./swagger.yaml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
    console.error('Error cargando swagger.yaml:', err.message);
}

//  ESTUDIANTES 

app.get('/api/estudiante/obtener', (req, res) => {
    pool.query('SELECT * FROM estudiantes', (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al recuperar estudiantes', error: error.message });
        res.status(200).json({ estudiantes: result.rows });
    });
});

app.post('/api/estudiante/guardar', (req, res) => {
    const { estudiante_id, nombre, correo, programa_academico } = req.body;
    const query = `INSERT INTO estudiantes (estudiante_id, nombre, correo, programa_academico) VALUES ($1, $2, $3, $4)`;
    pool.query(query, [estudiante_id, nombre, correo, programa_academico], (error) => {
        if (error) return res.status(500).json({ message: 'Error creando el estudiante', error: error.message });
        res.status(201).json({ estudiante_id, nombre, correo, programa_academico });
    });
});

app.put('/api/estudiante/actualizar/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, programa_academico } = req.body;
    const query = `UPDATE estudiantes SET nombre = $1, correo = $2, programa_academico = $3 WHERE estudiante_id = $4`;
    pool.query(query, [nombre, correo, programa_academico, id], (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al actualizar estudiante', error: error.message });
        if (result.rowCount === 0) return res.status(404).json({ message: `No se encontró el estudiante con ID ${id}` });
        res.status(200).json({ message: 'Estudiante actualizado correctamente' });
    });
});

app.delete('/api/estudiante/eliminar/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM estudiantes WHERE estudiante_id = $1';
    pool.query(query, [id], (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al eliminar estudiante', error: error.message });
        if (result.rowCount === 0) return res.status(404).json({ message: `No se encontró el estudiante con ID ${id}` });
        res.status(200).json({ message: 'Estudiante eliminado correctamente' });
    });
});

// PSICÓLOGOS 

app.get('/api/psicologo/obtener', (req, res) => {
    pool.query('SELECT * FROM psicologos', (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al recuperar psicólogos', error: error.message });
        res.status(200).json({ psicologos: result.rows });
    });
});

app.post('/api/psicologo/guardar', (req, res) => {
    const { psicologo_id, nombre, correo, especialidad } = req.body;
    const query = `INSERT INTO psicologos (psicologo_id, nombre, correo, especialidad) VALUES ($1, $2, $3, $4)`;
    pool.query(query, [psicologo_id, nombre, correo, especialidad], (error) => {
        if (error) return res.status(500).json({ message: 'Error creando el psicólogo', error: error.message });
        res.status(201).json({ psicologo_id, nombre, correo, especialidad });
    });
});

app.put('/api/psicologo/actualizar/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, especialidad } = req.body;
    const query = `UPDATE psicologos SET nombre = $1, correo = $2, especialidad = $3 WHERE psicologo_id = $4`;
    pool.query(query, [nombre, correo, especialidad, id], (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al actualizar psicólogo', error: error.message });
        if (result.rowCount === 0) return res.status(404).json({ message: `No se encontró el psicólogo con ID ${id}` });
        res.status(200).json({ message: 'Psicólogo actualizado correctamente' });
    });
});

app.delete('/api/psicologo/eliminar/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM psicologos WHERE psicologo_id = $1';
    pool.query(query, [id], (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al eliminar psicólogo', error: error.message });
        if (result.rowCount === 0) return res.status(404).json({ message: `No se encontró el psicólogo con ID ${id}` });
        res.status(200).json({ message: 'Psicólogo eliminado correctamente' });
    });
});

// CITAS 

app.get('/api/cita/obtener', async (req, res) => {
    const query = `
      SELECT 
        c.cita_id, c.estudiante_id, c.psicologo_id, 
        c.fecha, c.hora, c.modalidad, c.tipo_atencion, 
        e.nombre AS nombre_estudiante, 
        p.nombre AS nombre_psicologo
      FROM citas c
      JOIN estudiantes e ON c.estudiante_id = e.estudiante_id
      JOIN psicologos p ON c.psicologo_id = p.psicologo_id
    `;
    try {
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error en /api/cita/obtener:', error);
        res.status(500).json({ message: 'Error al obtener citas', error: error.message });
    }
});

app.post('/api/cita/guardar', async (req, res) => {
    const { estudiante_id, psicologo_id, fecha, hora, modalidad, tipo_atencion } = req.body;
    const query = `
      INSERT INTO citas (estudiante_id, psicologo_id, fecha, hora, modalidad, tipo_atencion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING cita_id
    `;
    try {
        const result = await pool.query(query, [estudiante_id, psicologo_id, fecha, hora, modalidad, tipo_atencion]);
        res.status(201).json({ message: 'Cita guardada correctamente', cita_id: result.rows[0].cita_id });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar cita', error: error.message });
    }
});

app.put('/api/cita/actualizar/:id', async (req, res) => {
    const { id } = req.params;
    const { estudiante_id, psicologo_id, fecha, hora, modalidad, tipo_atencion } = req.body;
    const query = `
      UPDATE citas
      SET estudiante_id = $1, psicologo_id = $2, fecha = $3, hora = $4, modalidad = $5, tipo_atencion = $6
      WHERE cita_id = $7
    `;
    try {
        await pool.query(query, [estudiante_id, psicologo_id, fecha, hora, modalidad, tipo_atencion, id]);
        res.status(200).json({ message: 'Cita actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cita', error: error.message });
    }
});

app.delete('/api/cita/eliminar/:id', async (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM citas WHERE cita_id = $1`;
    try {
        await pool.query(query, [id]);
        res.status(200).json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar cita', error: error.message });
    }
});

//PARA ASISTENCIA

app.post('/api/asistencia/registrar', (req, res) => {
    const { cita_id, estado, observaciones, registrada_por, hora_registro, fecha_registro } = req.body;

    console.log("Datos recibidos:", req.body);

   
    const ESTADOS_VALIDOS = ['asistió', 'no asistió', 'cancelada'];
    if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ message: 'Estado inválido. Debe ser: asistió, no asistió o justificado.' });
    }

    const query = `
        INSERT INTO asistencias (cita_id, estado, observaciones, registrada_por, hora_registro, fecha_registro)
        VALUES ($1, $2, $3, $4, $5, $6)
    `;

    pool.query(query, [cita_id, estado, observaciones, registrada_por, hora_registro, fecha_registro], (error) => {
        if (error) {
            console.error("Error al insertar asistencia:", error);
            return res.status(500).json({ message: 'Error registrando asistencia', error: error.message });
        }
        res.status(201).json({ message: 'Asistencia registrada exitosamente' });
    });
});

//NOTAS

app.get('/api/notas/estudiante/:id', (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT nc.*
        FROM notas_cita nc
        JOIN citas c ON nc.cita_id = c.cita_id
        WHERE c.estudiante_id = $1
        ORDER BY nc.creada_en DESC
    `;
    pool.query(query, [id], (error, result) => {
        if (error) return res.status(500).json({ message: 'Error al obtener notas', error: error.message });
        res.status(200).json({ notas: result.rows });
    });
});



app.post('/api/notas', (req, res) => {
    const { cita_id, contenido } = req.body;

 
    if (!cita_id || !contenido) {
        return res.status(400).json({ message: 'Faltan campos requeridos: cita_id y contenido' });
    }

    const query = `
        INSERT INTO notas_cita (cita_id, contenido, creada_en)
        VALUES ($1, $2, NOW())
        RETURNING *
    `;

    pool.query(query, [cita_id, contenido], (error, result) => {
        if (error) {
            return res.status(500).json({ message: 'Error al crear la nota', error: error.message });
        }

        res.status(201).json({ message: 'Nota creada correctamente', nota: result.rows[0] });
    });
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
