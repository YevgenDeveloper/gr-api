const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwtcheck = require('./jwtcheck');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './');
  },
  filename: function(req, file, cb) {
    cb(null, req.body.id);
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
module.exports = router;
