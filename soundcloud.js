const express = require('express');
const axios = require('axios');
const router = express.Router();
const client = `?client_id=${process.env.SND_ID}`;
const api = `https:
const user = `${api}users/713729887/tracks${client}`;
router.get('/:offset', async (req, res) => {
  const link = `${user}&limit=13&offset=${req.params.offset}`;
  try {
    const sounds = await axios.get(link);
    res.send(sounds.data);
  } catch {
    res.status(404).json({
      error: 'not found',
    });
  }
});
router.get('/tracks/:id', async (req, res) => {
  const link = `${api}tracks/${req.params.id}${client}`;
  try {
    const track = await axios.get(link);
    res.send(track.data);
  } catch {
    res.status(404).json({
      error: 'not found',
    });
  }
});
module.exports = router;
