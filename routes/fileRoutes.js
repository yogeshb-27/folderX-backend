const multer = require("multer");
const { uploadFile } = require("../controllers/fileController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const router = require("express").Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticateUser);

router.post("/:folderId?", upload.single("file"), uploadFile);
module.exports = router;
