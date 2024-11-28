const express = require('express');
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const program = new Command();
const multer = require ('multer');
const mmmm = multer()
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
  },
  apis: [__filename], 
});

program
  .requiredOption('-h, --host <host>', 'server host')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <path>', 'cache directory');

program.parse(process.argv);
const options = program.opts();

const app = express();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

/**
 * @swagger
 * /notes/{note_name}:
 *   get:
 *     summary: Отримати нотатку за іменем файлу
 *     parameters:
 *       - in: path
 *         name:  note_name
 *         required: true
 *         description: Назва файлу(нотатки)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Нотатку успішно отримано
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Нотатку не знайдено
 */

app.get('/notes/:name', (req, res) => {
  const notePath = path.join(options.cache, `${req.params.name}.txt`);
  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Not found');
  }
  const noteText = fs.readFileSync(notePath, 'utf-8');
  res.send(noteText);
});

/**
 * @swagger
 * /notes/{note_name}:
 *   put:
 *     summary: Оновити існуючу нотатку за іменем файлу
 *     parameters:
 *       - in: path
 *         name: note_name
 *         required: true
 *         description: Назва файлу(нотатки)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Текст для оновлення нотатки
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Нотатку успішно оновлено
 *       404:
 *         description: Нотатку не знайдено
 */

app.put('/notes/:name', (req, res) => {
  const notePath = path.join(options.cache, `${req.params.name}.txt`);
  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Not found');
  }
  fs.writeFileSync(notePath, req.body.text);
  res.sendStatus(200);
});

/**
 * @swagger
 * /notes/{note_name}:
 *   delete:
 *     summary: Видалити нотатку за іменем файлу
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: Назва файлу(нотатки)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Нотатку успішно видалено
 *       404:
 *         description: Нотатку не знайдено
 */

app.delete('/notes/:name', (req, res) => {
  const notePath = path.join(options.cache, `${req.params.name}.txt`);
  if (!fs.existsSync(notePath)) {
    return res.status(404).send('Not found');
  }
  fs.unlinkSync(notePath);
  res.sendStatus(200);
});

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Отримати всі нотатки
 *     responses:
 *       200:
 *         description: Успішно отримано список нотаток
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   text:
 *                     type: string
 */

app.get('/notes', (req, res) => {
  const files = fs.readdirSync(options.cache);
  const notes = files.map(file => {
    const name = path.basename(file);
    const text = fs.readFileSync(path.join(options.cache, file), 'utf-8');
    return { name, text };
  });
  res.status(200).json(notes);
});

/**
 * @swagger
 * /write:
 *   post:
 *     summary: Створити нову нотатку
 *     requestBody:
 *       required: true
 *       description: Дані для створення нотатки
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note_name:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Успішно створено нотатку
 *       400:
 *         description: Нотатка з такою назвою вже існує
 */

app.post('/write', mmmm.none(), (req, res) => {
  const noteName = req.body.note_name;
  const noteText = req.body.note;
  const notePath = path.join(options.cache, `${noteName}.txt`);

  if (fs.existsSync(notePath)) {
    return res.status(400).send('Bad request');
  }
  fs.writeFileSync(notePath, noteText);
  res.sendStatus(201);
});

/**
 * @swagger
 * /UploadForm.html:
 *   get:
 *     summary: Отримати форму для завантаження нотаток
 *     responses:
 *       200:
 *         description: Успішно отримано форму
 */

app.get('/UploadForm.html', (req, res) => {
  const formPath = path.join(__dirname, 'UploadForm.html');
  res.sendFile(formPath);
});

app.listen(options.port, options.host, () => {
  console.log(`Server runnig at http://${options.host}:${options.port}/`);
});