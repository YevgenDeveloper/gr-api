const express = require("express");
const router = express.Router();
const multer = require("multer");
const shell = require("shelljs");
const jwtcheck = require("./jwtcheck");
const pool = require("./pool");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: async function(req, file, cb) {
    const split = file.originalname.split(".");
    await pool.query("UPDATE Events SET imgformat = $1 WHERE id = $2;", [
      split[split.length - 1],
      req.body.id,
    ]);
    cb(null, `${req.body.id}.${split[split.length - 1]}`);
  },
});
const insta_storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function(req, file, cb) {
    cb(null, "insta_pic");
  },
});
const background_storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function(req, file, cb) {
    cb(null, "background");
  },
});
const upload = multer({ storage: storage });
const upload_insta = multer({ storage: insta_storage });
const upload_background = multer({ storage: background_storage });
router.post(
  "/insta",
  async (req, res, next) => {
    const jwt = await jwtcheck({ req });
    if (
      jwt.authenticated &&
      (jwt.user.role == "admin" || jwt.user.role == "mod")
    ) {
      next();
    } else res.status(400).json({ error: "you have no rights to upload" });
  },
  upload_insta.single("image"),
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
          res.status(400).json({ error: "problem converting the picture" });
        else res.status(201).sendFile("/tmp/output.png");
      }
    );
  }
);
router.post(
  "/color/:hex",
  async (req, res, next) => {
    const jwt = await jwtcheck({ req });
    if (
      jwt.authenticated &&
      (jwt.user.role == "admin" || jwt.user.role == "mod")
    ) {
      next();
    } else res.status(400).json({ error: "you have no rights to upload" });
  },
  (req, res) => {
    let color = `#${req.params.hex}`;
    fs.writeFile("/tmp/color", color, function(err) {
      if (err) {
        res.status(500).json({ error: "could not write to file" });
      }
      res.status(201).json({ success: true });
    });
  }
);
router.get("/color", (req, res) => {
  fs.readFile("/tmp/color", { encoding: "utf-8" }, (err, data) => {
    console.log(err);
    if (err) {
      fs.writeFile("/tmp/color", "#5D58C9", function(err) {
        if (err) res.status(500).json({ error: "could not read from file" });
        res.status(201).json({ color: "#5D58C9" });
      });
    } else {
      res.status(201).json({ color: data });
    }
  });
});
router.post(
  "/background",
  async (req, res, next) => {
    const jwt = await jwtcheck({ req });
    if (
      jwt.authenticated &&
      (jwt.user.role == "admin" || jwt.user.role == "mod")
    ) {
      next();
    } else res.status(400).json({ error: "you have no rights to upload" });
  },
  upload_background.single("image"),
  (req, res) => {
    res.status(201).json({ success: true });
  }
);
router.get("/background", (req, res) => {
  try {
    res.status(200).sendFile("/tmp/background");
  } catch {
    res.status(404).json({ error: "No background has been established" });
  }
});
router.delete("/background", (req, res) => {
  shell.exec("rm /tmp/background", function(code, stdout, stderr) {
    if (code != 0)
      res.status(400).json({ error: "problem deleting the background" });
    else res.status(200).json({ success: true });
  });
});
router.post(
  "/",
  async (req, res, next) => {
    const jwt = await jwtcheck({ req });
    if (jwt.authenticated && jwt.user.role == "admin") {
      next();
    } else res.status(400).json({ error: "you have no rights to upload" });
  },
  upload.single("image"),
  (req, res) => {
    res.status(201).json({ data: req.body.id });
  }
);
router.put(
  "/",
  async (req, res, next) => {
    const jwt = await jwtcheck({ req });
    if (jwt.authenticated && jwt.user.role == "admin") {
      next();
    } else res.status(400).json({ error: "you have no rights to upload" });
  },
  upload.single("image"),
  (req, res) => {
    res.status(201).json({ data: req.body.id });
  }
);
router.get(
  "/:id",
  (req, res, next) => {
    res.header("Cache-Control", `public, max-age=${3600 * 24 * 2}`);
    next();
  },
  express.static("./uploads")
);
module.exports = router;
