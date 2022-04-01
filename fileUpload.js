const express = require('express');
const router = express.Router();
const multer = require('multer');
const shell = require('shelljs');
const jwtcheck = require('./jwtcheck');
const pool = require('./pool');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: async function(req, file, cb) {
    const split = file.originalname.split('.');
    await pool.query('UPDATE Events SET imgformat = $1 WHERE id = $2;', [
      split[split.length - 1],
      req.body.id,
    ]);
    cb(null, `${req.body.id}.${split[split.length - 1]}`);
  },
});
const insta_storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/tmp');
  },
  filename: function(req, file, cb) {
    cb(null, 'insta_pic');
  },
});
const upload = multer({storage: storage});
const upload_insta = multer({storage: insta_storage});
router.post(
  '/insta',
  async (req, res, next) => {
    const jwt = await jwtcheck({req});
    if (jwt.authenticated && jwt.user.role == 'admin') {
      next();
    } else res.status(400).json({error: 'you have no rights to upload'});
  },
  upload_insta.single('image'),
  (req, res) => {
    const date = req.body.date;
    const month = req.body.month;
    const title = req.body.title;
    const artist = req.body.artist;
    const color = req.body.color;
    shell.exec(
      `cd layouts && ./layout.sh /tmp/insta_pic ${date} ${month} "${artist}" "${title}" ${color}`,
      function(code, stdout, stderr) {
        if (code != 0)
          res.status(400).json({error: 'problem converting the picture'});
      },
    );
    res.status(201).sendFile('/tmp/output.png');
  },
);
router.post(
  '/',
  async (req, res, next) => {
    const jwt = await jwtcheck({req});
    if (jwt.authenticated && jwt.user.role == 'admin') {
      next();
    } else res.status(400).json({error: 'you have no rights to upload'});
  },
  upload.single('image'),
  (req, res) => {
    res.status(201).json({data: req.body.id});
  },
);
router.put(
  '/',
  async (req, res, next) => {
    const jwt = await jwtcheck({req});
    if (jwt.authenticated && jwt.user.role == 'admin') {
      next();
    } else res.status(400).json({error: 'you have no rights to upload'});
  },
  upload.single('image'),
  (req, res) => {
    res.status(201).json({data: req.body.id});
  },
);
router.get(
  '/:id',
  (req, res, next) => {
    res.header('Cache-Control', `public, max-age=${3600 * 24 * 2}`);
    next();
  },
  express.static('./uploads'),
);
module.exports = router;
