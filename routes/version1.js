import express from 'express';
import fs from 'fs';

const router = express.Router();

const leerBancos = () => {
  const data = fs.readFileSync(new URL('../bancos.json', import.meta.url));
  return JSON.parse(data);
};

const guardarBancos = (bancos) => {
  fs.writeFileSync(
    new URL('../bancos.json', import.meta.url),
    JSON.stringify(bancos, null, 2)
  );
};

// 🔹 función para eliminar ciudad en v1
const quitarCiudad = (bancos) => {
  bancos.forEach(b =>
    b.personas.forEach(p => delete p.ciudad)
  );
};

router.get('/', (req, res) => {
  res.send('¡Bienvenidos a la versión 1.');
});

router.get('/banco', (req, res) => {

  const infoBancos = leerBancos();
  quitarCiudad(infoBancos);

  res.json(infoBancos);

});

router.get("/banco/:valor", (req, res) => {

  const infoBancos = leerBancos();
  quitarCiudad(infoBancos);

  const valor = req.params.valor.toLowerCase();

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(
      b => b.nombre.toLowerCase() === valor
    );
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  res.json(banco);

});

router.get("/banco/:valor/personas", (req, res) => {

  const infoBancos = leerBancos();
  quitarCiudad(infoBancos);

  const valor = req.params.valor.toLowerCase();

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(
      b => b.nombre.toLowerCase() === valor
    );
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  let personas = banco.personas;

  if (req.query.nombre) {
    personas = personas.filter(
      p => p.nombre.toLowerCase() === req.query.nombre.toLowerCase()
    );
  }

  if (req.query.apellido) {
    personas = personas.filter(
      p => p.apellido.toLowerCase() === req.query.apellido.toLowerCase()
    );
  }

  if (req.query.cuenta) {
    personas = personas.filter(
      p => p.cuenta.toLowerCase() === req.query.cuenta.toLowerCase()
    );
  }

  if (req.query.numeroCuenta) {
    personas = personas.filter(
      p => p.numeroCuenta === req.query.numeroCuenta
    );
  }

  res.json(personas);

});

router.post("/banco/:valor/personas", (req, res) => {

  const infoBancos = leerBancos();
  const valor = req.params.valor.toLowerCase();

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(
      b => b.nombre.toLowerCase() === valor
    );
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  const nuevaPersona = req.body;

  banco.personas.push(nuevaPersona);

  guardarBancos(infoBancos);

  res.json(nuevaPersona);

});

router.put("/banco/:valor/personas/:idPersona", (req, res) => {

  const infoBancos = leerBancos();
  const valor = req.params.valor.toLowerCase();
  const idPersona = parseInt(req.params.idPersona);

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(
      b => b.nombre.toLowerCase() === valor
    );
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  const persona = banco.personas.find(p => p.id === idPersona);

  if (!persona) {
    return res.status(404).json({ error: "Persona no encontrada" });
  }

  if (!req.body) {
    return res.status(400).json({ error: "Debe enviar datos en el body" });
  }

  persona.nombre = req.body.nombre || persona.nombre;
  persona.apellido = req.body.apellido || persona.apellido;
  persona.cuenta = req.body.cuenta || persona.cuenta;
  persona.numeroCuenta = req.body.numeroCuenta || persona.numeroCuenta;

  guardarBancos(infoBancos);

  res.json(persona);

});

router.delete("/banco/:valor/personas/:idPersona", (req, res) => {

  const infoBancos = leerBancos();
  const valor = req.params.valor.toLowerCase();
  const idPersona = parseInt(req.params.idPersona);

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(
      b => b.nombre.toLowerCase() === valor
    );
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  const indice = banco.personas.findIndex(p => p.id === idPersona);

  if (indice === -1) {
    return res.status(404).json({ error: "Persona no encontrada" });
  }

  banco.personas.splice(indice, 1);

  guardarBancos(infoBancos);

  res.json({ mensaje: "Persona eliminada" });

});

export default router;