const express = require('express');
const axios = require('axios');
const router = express.Router();
router.get('/', async (req, res) => {
  const link = `https:
  const frame = await axios.get(link);
  res.send(frame.data);
});
module.exports = router;
