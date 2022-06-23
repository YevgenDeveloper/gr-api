const express = require("express");
const router = express.Router();
const multer = require("multer");
const shell = require("shelljs");
const jwtcheck = require("./jwtcheck");
const pool = require("./pool");
const fs = require("fs");
const WDIR = "/usr/src/app/uploads";
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, WDIR);
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
    cb(null, WDIR);
  },
  filename: function(req, file, cb) {
    cb(null, "background");
  },
});
const background_mobile_storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, WDIR);
  },
  filename: function(req, file, cb) {
    cb(null, "background_mobile");
  },
});
const upload = multer({ storage: storage });
const upload_insta = multer({ storage: insta_storage });
const upload_background = multer({ storage: background_storage });
const upload_background_mobile = multer({ storage: background_mobile_storage });
async function checkJWT(req, res, next) {
  const jwt = await jwtcheck({ req });
  if (
    jwt.authenticated &&
    (jwt.user.role == "admin" || jwt.user.role == "mod")
  ) {
    next();
  } else {
    res.status(400).json({ error: "you don't have the rights to do this." });
  }
}
async function statFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return 1;
    }
  } catch (err) {
    throw Exception;
  }
}
router.post(
  "/insta.png",
  (req, res, next) => checkJWT(req, res, next),
  upload_insta.single("image"),
  (req, res) => {
    const date = req.body.date;
    const month = req.body.month;
    const title = req.body.title.replace(/(["'$`\\])/g,'\\$1');;
    const artist = req.body.artist.replace(/(["'$`\\])/g,'\\$1');;
    const color = req.body.color;
    shell.exec(
      `cd submodules/layouts && ./layout.sh /tmp/insta_pic ${date} ${month} "${artist}" "${title}" ${color}`,
      function(code, stdout, stderr) {
        if (code != 0)
          res.status(400).json({ error: "problem converting the picture" });
        else res.status(201).sendFile("/tmp/output.png");
      }
    );
  }
);
router.get("/insta.png", (req, res) => {
  res.sendFile("/tmp/output.png");
});
router.post(
  "/color/:hex",
  (req, res, next) => checkJWT(req, res, next),
  (req, res) => {
    let color = `#${req.params.hex}`;
    fs.writeFile(`${WDIR}/color`, color, function(err) {
      if (err) {
        res.status(500).json({ error: "could not write to file" });
      }
      res.status(201).json({ success: true });
    });
  }
);
router.get("/color", (req, res) => {
  fs.readFile(`${WDIR}/color`, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      fs.writeFile(`${WDIR}/color`, "#5D58C9", function(errW) {
        if (errW) res.status(500).json({ error: "could not read from file" });
        res.status(201).json({ color: "#5D58C9" });
      });
    } else {
      res.status(201).json({ color: data });
    }
  });
});
router.post(
  "/background",
  (req, res, next) => checkJWT(req, res, next),
  upload_background.single("image"),
  (req, res) => {
    res.status(201).json({ success: true });
  }
);
router.get("/background", (req, res) => {
  if (fs.existsSync(`${WDIR}/background`)) {
    res.status(200).sendFile(`${WDIR}/background`);
  } else {
    res.status(404).json({ error: "No background has been established" });
  }
});
router.delete(
  "/background",
  (req, res, next) => checkJWT(req, res, next),
  (req, res) => {
    shell.exec(`rm ${WDIR}/background`, function(code, stdout, stderr) {
      if (code != 0)
        res.status(500).json({ error: "problem deleting the background" });
      else res.status(200).json({ success: true });
    });
  }
);
router.post(
  "/background_mobile",
  (req, res, next) => checkJWT(req, res, next),
  upload_background_mobile.single("image"),
  (req, res) => {
    res.status(201).json({ success: true });
  }
);
router.get("/background_mobile", (req, res) => {
  if (fs.existsSync(`${WDIR}/background_mobile`)) {
    res.status(200).sendFile(`${WDIR}/background_mobile`);
  } else {
    res
      .status(404)
      .json({ error: "No background mobile has been established" });
  }
});
router.delete(
  "/background_mobile",
  (req, res, next) => checkJWT(req, res, next),
  (req, res) => {
    shell.exec(`rm ${WDIR}/background_mobile`, function(code, stdout, stderr) {
      if (code != 0)
        res
          .status(400)
          .json({ error: "problem deleting the background mobile" });
      else res.status(200).json({ success: true });
    });
  }
);
router.post(
  "/",
  (req, res, next) => checkJWT(req, res, next),
  upload.single("image"),
  (req, res) => {
    res.status(201).json({ data: req.body.id });
  }
);
router.put(
  "/",
  (req, res, next) => checkJWT(req, res, next),
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
  express.static(WDIR)
);
module.exports = router;
