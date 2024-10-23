// Cargando el modulo de Express.js
const express = require('express')
// Cargando la librería de express-fileupload
const fileUpload = require('express-fileupload')
// Este variable define el puerto del computador donde la API esta disponible
const fs = require('fs');
const path = require('path');
const PORT = 3000;
// Definimos la variable que inicializa la libreria Express.js
const app = express();
// Middleware
app.use(fileUpload({
    createParentPath: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde el directorio public

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Enviar el archivo index.html como respuesta
});

//muestra el html en el navegador de forma dinamica
app.get('/files', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'files.html')); // Enviar el archivo index.html como respuesta
});


//funcion para mostrar archivos subidos como json, para ver en postman
app.get('/files-cargados', (req, res) => {
    const uploadDir = path.join(__dirname, 'cargados');

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).send({
                code: 500,
                error: true,
                mensaje: 'Error al listar archivos',
                files: []
            });
        }
        //ojo como se envia la informacion, debe ser un json para que se pueda consumir en el front
        res.status(200).json({ archivos: files });
    });
});

app.post('/upload', (req, res) => {
    //si no hay archivos o keys en igual a 0, retornar error
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({
            error: true,
            codigo: 400,
            mensaje: 'Debe incluir a lo menos un archivo!',
        });
    }

    //El archivo se encuentra en req.files.
    let archivo = req.files.factura;


    //Validar si la carpeta no existe, en el directorio ./ nombre de la carpeta uploads
    if (!fs.existsSync('./cargados')) {
        //Crear la carpeta ./uploads
        fs.mkdirSync('./cargados');
    }

    //Mover el archivo a la carpeta de destino con el metodo mv, donde se indica el nombre del archivo
    archivo.mv(`./cargados/${archivo.name}`, err => {
        //Si hay un error retornar el error
        if (err) {
            return res.status(500).send({
                error: true,
                codigo: 500,
                mensaje: err
            });
        }
        //Si no hay error retornar el archivo subido
        res.send({
            error: false,
            codigo: 200,
            mensaje: 'Archivo subido correctamente',
            archivo: archivo.name,
            size: (archivo.size / (1024 * 1024)) + " MB.",
            type: archivo.mimetype
        });
    });
});

//metodo para descargar archivos
app.get('/archivo/:name', (req, res) => {
    const fileName = req.params.name;
    const filePath = path.join(__dirname, 'cargados', fileName);

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
        res.status(404).send('Archivo no encontrado');
        return;
    }

    // Descargar el archivo
    res.download(filePath, fileName);
});

//metodo para eliminar archivos
app.delete('/archivo/:nombreArchivo', (req, res) => {
    const nombreArchivo = req.params.nombreArchivo;
    const rutaArchivo = `./cargados/${nombreArchivo}`;

    fs.unlink(rutaArchivo, (err) => {
        if (err) {
            res.status(404).send(`Archivo no encontrado: ${nombreArchivo}`);
        } else {
            res.send(`Archivo eliminado correctamente: ${nombreArchivo}`);
        }
    });
});



// 1 - El puerto donde esta disponible la API
// 2 - Una función de llamada (callback) cuando la API esta lista
app.listen(PORT, () =>
    console.log(`Corriendo en el servidor, API REST subida de archivos
express-fileupload que se esta ejecutando en: http://localhost:${PORT}.`)
);