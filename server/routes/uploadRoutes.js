const express = require("express");
const uploadController = require("../controllers/uploadController");

const upload = require("multer")().single("file");

const router = express.Router();

router.post("/", upload, uploadController.upload);

module.exports = router;
