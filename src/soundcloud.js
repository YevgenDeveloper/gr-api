const express = require("express");
const axios = require("axios");
const router = express.Router();
const client = `?client_id=${process.env.SND_ID}`;
const api = `https:
const user = `${api}users/713729887/tracks${client}`;
router.use(express.json());
router.get("/:offset", async (req, res) => {
  const link = `${user}&limit=12&offset=${req.params.offset}`;
  try {
    const sounds = await axios.get(link);
    res.send(sounds.data);
  } catch {
    res.status(404).json({
      error: "not found",
    });
  }
});
router.get("/tracks/:id", async (req, res) => {
  const link = `${api}tracks/${req.params.id}${client}`;
  try {
    const track = await axios.get(link);
    if (track.data.user.permalink != "zoneestradio") {
      res.status(404).json({
        error: "not found",
      });
    } else {
      res.send(track.data);
    }
  } catch {
    res.status(404).json({
      error: "not found",
    });
  }
});
router.post("/search", async (req, res) => {
  let offset = req.body.offset ? req.body.offset : 0;
  const link = `https:
    req.body.search
  }&client_id=${process.env.SND_ID}&limit=20&offset=${offset}`;
  try {
    const track = await axios.get(link);
    res.send(track.data);
  } catch {
    res.status(403).json({
      error: "not found",
    });
  }
});
module.exports = router;
