const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3008;
const partialJsonPath = process.env.PARTIAL_JSON_PATH || '';

// Inicializamos  el Motor de plantillas elegido 
app.set('view engine', 'ejs');

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

//app.use(express.static('views'))
app.use(express.static(path.join(__dirname,'views')))
const película= [
    { name: 'Peliculas', price: 0 },
    { name: 'Series', price: 0 },
    { name: 'Actriz', price: 0 }
]

//css
app.use(express.static('public'));

// Configurar la ubicación de las vistas (plantillas)
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

// Cargar datos desde el archivo JSON en una constante TRAILERFLIX
const rawData = fs.readFileSync(partialJsonPath, 'utf-8');
const TRAILERFLIX = JSON.parse(rawData);
const catalogo= TRAILERFLIX
// Ruta raíz (sin mensaje de Bienvenida)
app.get('/', (req, res) => {
  res.render('index'); // Renderiza la vista index.ejs
});

// Configurar EJS como el motor de plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Endpoint para la página de inicio
app.get('/inicio', (req, res) => {
  // TRAILERFLIX es JSON con las rutas de las imágenes y las URL de los trailers
  res.render('inicio', { catalogo: TRAILERFLIX });
});

//Renderiza la vista de index.ejs

app.get('/index',(req,res)=>{

//me tiraba error
res.render('index', { catalogo: TRAILERFLIX });

});


// Endpoint para listar el catálogo completo
app.get('/catalogo', (req, res) => {
    res.render('catalogo', { catalogo: TRAILERFLIX });
  });


// Ruta para  la búsqueda
app.get('/buscar', (req, res) => {
  const query = req.query.q.toLowerCase();
  const results = TRAILERFLIX.filter((item) =>
    item.titulo.toLowerCase().includes(query));
  res.json({ resultados: results, query: query });
  console.log("Se ha llamado a la ruta de búsqueda");
});

//endpoint para busqueda por titulo
app.get('/titulo/:title', (req, res) => {
  const searchTerm = req.params.title.toLowerCase();
  const results = catalogo.filter(item => item.titulo.toLowerCase().includes(searchTerm));

  if (results.length === 0) {
    res.status(404).json({ error: 'No se encontraron resultados para el título proporcionado.' });
  } else {
    res.json(results);
  }
});
function compareIgnoreCase(a, b) { 
  return a.toLowerCase() === b
}
//endpoint para busqueda por categoria
app.get('/categoria/:cat', (req, res) => {
  const category = req.params.cat.toLowerCase();
  const results = catalogo.filter(item => compareIgnoreCase(item.categoria, category));

  if (results.length === 0) {
    res.status(404).json({ error: 'No se encontraron resultados para la categoría proporcionada.' });
  } else {
    res.json(results);
  }
});

//endpoint para busqueda por reparto
app.get('/reparto/:act', (req, res) => {
  const actor = req.params.act.toLowerCase();
  const results = catalogo.filter(item => item.reparto.toLowerCase().includes(actor))
                         .map(item => ({ titulo: item.titulo, reparto: item.reparto }));

  if (results.length === 0) {
    res.status(404).json({ error: 'No se encontraron resultados para el actor proporcionado.' });
  } else {
    res.json(results);
  }
});

//endpoint para busqueda por trailer
app.get('/trailer/:id', (req, res) => {
  const id = req.params.id;
  const item = catalogo.find(item => compareIgnoreCase(item.id, id));

  if (!item) {
    res.status(404).json({ error: 'No se encontró ningún elemento con el ID proporcionado.' });
  } else {
    const result = {
      id: item.id,
      titulo: item.titulo,
      trailer: item.trailer
    }; // Añadir cierre de la estructura del objeto
    res.json(result);
  }
});

app.patch('/actualizar/:id', (req, res) => {
  const idToUpdate = req.params.id;
  const updates = req.body;

  const itemIndex = catalogo.findIndex(item => compareIgnoreCase(item.id, idToUpdate));

  if (itemIndex === -1) {
    res.status(404).json({ error: 'No se encontró ningún elemento con el ID proporcionado.' });
  } else {
    const updatedItem = { ...catalogo[itemIndex], ...updates };
    catalogo[itemIndex] = updatedItem;
    res.json({ message: 'Elemento actualizado exitosamente.', updatedItem });
  }
});


app.listen(port, () => {
  console.log(`Servidor web en http://localhost:${port}`);
});



