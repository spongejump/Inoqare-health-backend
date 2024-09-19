const express = require("express");
const { upload, getListFiles, download, remove } = require("../controllers/file");

const router = express.Router({ mergeParams: true });

router.post("/upload", upload);
router.get("/files", getListFiles);
router.get("/files/:name", download);
router.delete("/files/:name", remove);

module.exports = router;
