const multer = require("multer");
const {
  uploadFile,
  deleteFile,
  renameFile,
  downloadFile,
  getFile,
} = require("../controllers/fileController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = require("express").Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticateUser);

router
  .post("/:folderId?", upload.single("file"), uploadFile)
  .delete("/:fileId", deleteFile)
  .patch("/:fileId", renameFile)
  .get("/download/:fileId", downloadFile)
  .get("/:fileId", getFile);
module.exports = router;
