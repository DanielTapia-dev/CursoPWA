// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push');

const mensajes = [

  {
    _id: 'XXX',
    user: 'spiderman',
    mensaje: 'Tia May hizo unos panqueques en forma de Iroman!'
  }

];





// Get mensajes
router.get('/', function (req, res) {
  res.json(mensajes);
});


// Post mensajes
router.post('/', function (req, res) {
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user
  };

  mensajes.push(mensaje);

  console.log(mensajes);

  res.json({
    ok: true,
    mensaje
  });
});

//Almacenar la subscripcion
router.post('/subscribe', (req, res) => {
  const suscripcion = req.body;

  push.addSubscription(suscripcion);

  res.json('subscribe');
});


//Almacenar la subscripcion
router.get('/key', (req, res) => {
  const key = push.getKey();

  res.send(key);
});

//Enviar una notificacion PUSH a las personas
// que nosotros queramos
//Es ALGO que se controla del lado del server
router.post('/push', (req, res) => {

  const notification = {
    titulo: req.body.titulo,
    cuerpo: req.body.cuerpo,
    usuario: req.body.usuario
  };

  push.sendPush(notification);

  res.json(notification);
});

module.exports = router;