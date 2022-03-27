const modelVino = require('../models/modelVino');

const controllerVino = {};

controllerVino.verVino = async (request, response, next) => {
  const { id } = request.query;

  if (Number.isNaN(Number(id)) || Number.isNaN(Number.parseInt(id, 10))) {
    response.status(500);
    next(new Error('El id tiene que ser un número válido'));
  } else {
    try {
      const [rows] = await modelVino.find(request.query.id);
      console.log(rows);
      if (rows === undefined) {
        response.status(500);
        next(new Error('No existe el vino con ese ID'));
      } else {
        rows.foto = rows.foto.toString('base64');
        response.render('vino_detalles', { res: null, vino: rows, title: 'Detalles del vino' });
      }
    } catch (e) {
      console.error(e);
      response.status(500);
      e.message = 'Error interno de acceso a la base de datos';
      next(e);
    }
  }
};

controllerVino.agregarVino = async (request, response, next) => {
  const alert = request.errors;
  if (alert.length > 0) {
    response.render('agregarVino', { alert });
    return;
  }

  const {
    nombre, clase, tipo, gradoAlcohol, bodega, localidad,
  } = request.body;
  const imagen = (request.file) ? request.file.buffer : null;
  try {
    const id = await modelVino.insert([
      nombre, clase, tipo, gradoAlcohol, bodega, localidad, imagen,
    ]);
    response.render('agregarVino', { id });
  } catch (e) {
    console.error(e);
    response.status(500);
    e.message = 'Error interno de acceso a la base de datos';
    next(e);
  }
};

controllerVino.borrarVino = async (request, response, next) => {
  const { id } = request.query;
  if (Number.isNaN(Number(id)) || Number.isNaN(Number.parseInt(id, 10))) {
    response.status(500);
    next(new Error('El id tiene que ser un número válido'));
  } else {
    try {
      const [rows] = await modelVino.findID(request.query.id);
      console.log(rows);
      if (rows === undefined) {
        response.status(500);
        next(new Error('No existe el vino con ese ID'));
      } else { 
        await modelVino.borrarVino(request.query.id);
        //response.render('index',{title : 'Bacowine dev'});
      }
    }
    catch (e) {
      console.error(e);
      response.status(500);
      e.message = 'Error interno de acceso a la base de datos';
      next(e);
    }
  }
};


module.exports = controllerVino;
