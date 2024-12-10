// Importación de librerías
const express = require('express');
const sql = require('mssql');
const app = express();

// Uso de middleware para parsear datos
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Para parsear JSON si fuera necesario

// Configuración SQL Server
const dbconfig = {
    user: 'sa',
    password: '10jul1982',
    server: 'DESKTOP-SDO4OKI',
    database: 'VulnerableAPP',
    options: {
        encrypt: true, // Habilitar cifrado
        trustServerCertificate: true // Desactivar la validación del certificado
    }
};

// Ruta del inicio
app.get('/', (req, res) => {
    res.send(`
        <html lang="es">
            <head>
                <!-- Enlace al CSS de Bootstrap -->
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <!-- Enlace al JS de Bootstrap -->
                <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.3/dist/umd/popper.min.js"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                <title>Página Vulnerable</title>
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <h1 class="text-center mb-4">Página Vulnerable a XSS e Inyección SQL</h1>

                            <!-- Formulario de inicio de sesión -->
                            <div class="card">
                                <div class="card-body">
                                    <form action="/login" method="POST">
                                        <div class="form-group">
                                            <label for="username">Usuario:</label>
                                            <input type="text" class="form-control" name="username" id="username" required>
                                        </div>

                                        <div class="form-group">
                                            <label for="password">Contraseña:</label>
                                            <input type="text" class="form-control" name="password" id="password" required>
                                        </div>

                                        <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
                                    </form>
                                </div>
                            </div>

                            <!-- Formulario de búsqueda -->
                            <h2 class="mt-5">Búsqueda</h2>
                            <form action="/search" method="GET">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control" name="search" id="search" placeholder="Buscar..." required>
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="submit">Buscar</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Script para hacer que la página sea responsiva -->
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>
            </body>
        </html>
    `);
});

// Ruta de Inicio de sesión (vulnerable a SQL inyección)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // *** Advertencia: Esta es una consulta vulnerable a inyección SQL ***
    const query = `SELECT * FROM Users WHERE Username='${username}' AND Password='${password}'`;

    try {
        const pool = await sql.connect(dbconfig);
        const result = await pool.request().query(query);

        if (result.recordset.length > 0) {
            res.send(`¡Bienvenido al sistema, ${username}!`);
        } else {
            res.send('Credenciales incorrectas.');
            console.log(`Ingreso Usuario: ${username}!`);
            console.log(`Ingreso Password: ${password}!`);
        }
    } catch (err) {
        res.status(500).send('Error en el Servidor: ' + err.message);
        console.log(`Ingreso Usuario: ${username}!`);
        console.log(`Ingreso Password: ${password}!`);
    }
});

// Ruta de búsqueda (vulnerable a XSS)
app.get('/search', (req, res) => {
    const query = req.query.search; // Cambié "query" por "search" para coincidir con el formulario
    res.send(`Resultados para: ${query}`);
});

// Inicializar el Servidor
const PORT = 4000;  // Cambié el puerto de 3000 a 4000 para evitar el error de permisos
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
