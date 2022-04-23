const express = require('express');

const { upload, imageHandler } = require('../middlewares/upload');
const cVinos = require('../controllers/controllerVino');
const vinoSchema = require('../validators/vino.validator');
const validate = require('../middlewares/schemaValidator');

const { ROLE, authRole } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get((_req, res) => res.redirect('/vino/agregarVino'));

router.route('/detalles')
  .get(cVinos.verVino);

router.route('/agregarVino')
  .get(authRole(ROLE.ADMIN), (_req, res) => res.render('agregarVino'))
  .post(authRole(ROLE.ADMIN), upload.single('imagen'), imageHandler, validate(vinoSchema), cVinos.agregarVino);

router.route('/borrarVino')
  .post(authRole(ROLE.ADMIN), cVinos.borrarVino);

router.route('/modificarVino')
  .post(authRole(ROLE.ADMIN), cVinos.modificarVino);
router.route('/modificarVinoFinal')
  .post(authRole(ROLE.ADMIN), cVinos.modificarVinoFinal);

router.route('/comentarVino')
  .post(authRole(ROLE.USER), cVinos.comentarVino);

router.route('/borrarComentario')
  .post(authRole([ROLE.USER, ROLE.ADMIN]), cVinos.borrarComentario);

module.exports = router;
