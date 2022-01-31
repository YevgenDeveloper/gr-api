const express = require('express');
const axios = require('axios');
const router = express.Router();
router.get('/', async (req, res) => {
  const link = `https:
  try {
    const frame = await axios.get(link);
    res.send(frame.data);
  } catch {
    res.status(404).json({
      error: 'not found',
    });
  }
});
router.get('/:show', async (req, res) => {
  const link = `https:
  try {
    const frame = await axios.get(link);
    res.send(frame.data);
  } catch {
    res.status(404).json({
      error: 'not found',
    });
  }
});
module.exports = router;
