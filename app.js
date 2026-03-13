import express from 'express';
import version1 from './routes/version1.js';
import version2 from './routes/version2.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import {cors} from 'cors';

config();

const app = express();
const puerto = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const users = [];

function verificarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      mensaje: "Token requerido"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Formato de token inválido"
    });
  }

  try {

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    req.username = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      ok: false,
      mensaje: "Token inválido o expirado"
    });

  }

}

app.post("/register", async (req, res) => {

  const { username, password } = req.body;

  const userExists = users.find(u => u.username === username);

  if (userExists) {
    return res.status(400).send("El usuario ya existe");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    username,
    password: hashedPassword
  };

  users.push(newUser);

  res.status(201).send("Usuario registrado");

});

app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(400).send("Usuario no encontrado");
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(400).send("Contraseña incorrecta");
  }

  const token = jwt.sign(
    { username: user.username },
    process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });

});

app.use("/api/v1", verificarToken, version1);
app.use("/api/v2", verificarToken, version2);

app.listen(puerto, () => {
  console.log("Servidor escuchando en puerto " + puerto);
});