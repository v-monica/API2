import express from 'express';
import fs from 'fs';

const router = express.Router();

const leerBancos = () => {
  const data = fs.readFileSync('./bancos.json');
  return JSON.parse(data);
};

const guardarBancos = (bancos) => {
  fs.writeFileSync('./bancos.json', JSON.stringify(bancos, null, 2));
};

router.get('/', (req, res) => {
  res.send('¡Bienvenidos a la versión 2.');
});

router.get('/banco', (req, res) => {
  const infoBancos = leerBancos();

  const bancosConVersion = infoBancos.map(b => ({
    ...b,
    version: '2.0'
  }));

  res.json(bancosConVersion);
});

router.get("/banco/:valor", (req, res) => {
  const infoBancos = leerBancos();
  const valor = req.params.valor;

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(b => b.nombre.toLowerCase() === valor.toLowerCase());
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  res.json({ ...banco, version: '2.0' });
});

router.get("/banco/:valor/personas", (req, res) => {
  const infoBancos = leerBancos();
  const valor = req.params.valor;

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(b => b.nombre.toLowerCase() === valor.toLowerCase());
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  let personas = banco.personas;

  if (req.query.nombre) {
    personas = personas.filter(p =>
      p.nombre.toLowerCase() === req.query.nombre.toLowerCase()
    );
  }

  if (req.query.apellido) {
    personas = personas.filter(p =>
      p.apellido.toLowerCase() === req.query.apellido.toLowerCase()
    );
  }

  if (req.query.cuenta) {
    personas = personas.filter(p =>
      p.cuenta.toLowerCase() === req.query.cuenta.toLowerCase()
    );
  }

  if (req.query.ciudad) {
    personas = personas.filter(p =>
      p.ciudad.toLowerCase() === req.query.ciudad.toLowerCase()
    );
  }

  res.json(personas);
});

router.post("/banco/:valor/personas", (req, res) => {
  const infoBancos = leerBancos();
  const valor = req.params.valor;

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(b => b.nombre.toLowerCase() === valor.toLowerCase());
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
  const valor = req.params.valor;
  const idPersona = parseInt(req.params.idPersona);

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(b => b.nombre.toLowerCase() === valor.toLowerCase());
  }

  if (!banco) {
    return res.status(404).json({ error: "Banco no encontrado" });
  }

  const persona = banco.personas.find(p => p.id === idPersona);

  if (!persona) {
    return res.status(404).json({ error: "Persona no encontrada" });
  }

  persona.nombre = req.body.nombre;
  persona.apellido = req.body.apellido;
  persona.cuenta = req.body.cuenta;
  persona.numeroCuenta = req.body.numeroCuenta;
  persona.ciudad = req.body.ciudad;

  guardarBancos(infoBancos);

  res.json(persona);
});

router.delete("/banco/:valor/personas/:idPersona", (req, res) => {
  const infoBancos = leerBancos();
  const valor = req.params.valor;
  const idPersona = parseInt(req.params.idPersona);

  let banco = infoBancos.find(b => b.id === parseInt(valor));

  if (!banco) {
    banco = infoBancos.find(b => b.nombre.toLowerCase() === valor.toLowerCase());
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

router.get("/personas", (req, res) => {

  const infoBancos = leerBancos();

  let todasLasPersonas = [];

  infoBancos.forEach(banco => {
    banco.personas.forEach(persona => {
      todasLasPersonas.push({
        banco: banco.nombre,
        ...persona
      });
    });
  });

  if (req.query.ciudad) {
    todasLasPersonas = todasLasPersonas.filter(p =>
      p.ciudad && p.ciudad.toLowerCase() === req.query.ciudad.toLowerCase()
    );
  }

  res.json(todasLasPersonas);

});

export default router;