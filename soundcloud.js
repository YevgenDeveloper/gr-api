const express = require('express');
const axios = require('axios');
const router = express.Router();
const api = `https:
router.get('/', async (req, res) => {
  const link = `${api}&limit=20&offset=0&app_locale=fr`;
  try {
    const sounds = await axios.get(link);
    res.send(sounds.data);
  } catch {
    res.status(404).json({
      error: 'not found',
    });
  }
});
module.exports = router;
