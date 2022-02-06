const express = require('express');
const router = express.Router();
const multer = require('multer');
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
const upload = multer({storage: storage});
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
router.get('/:id', (req, res, next) => {
  res.header('Cache-Control', `public, max-age=${3600 * 24 * 2}`);
  next();
}, express.static('./uploads'));
module.exports = router;
