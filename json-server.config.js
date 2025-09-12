/**
 * Configuración de JSON Server para Yo Pett
 * Maneja la base de datos de videos compartidos
 */

module.exports = {
  // Puerto del servidor de base de datos
  port: 3001,
  
  // Archivo de base de datos
  db: './database.json',
  
  // Configuración de rutas
  routes: {
    '/api/videos': '/videos',
    '/api/videos/:id': '/videos/:id',
    '/api/users': '/users',
    '/api/users/:id': '/users/:id',
    '/api/shares': '/shares',
    '/api/shares/:id': '/shares/:id'
  },
  
  // Middleware personalizado
  middlewares: [
    // CORS para permitir requests desde la app
    (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    },
    
    // Logging de requests
    (req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    }
  ],
  
  // Configuración de respuestas
  static: './public',
  
  // Configuración de delay (para simular red real)
  delay: 100,
  
  // Configuración de paginación
  pagination: {
    limit: 20
  }
};
