const {
  getFolderContents,
  createFolder,
  renameFolder,
} = require("../controllers/folderController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();
router.use(authenticateUser);

router
  .get("/:folderId?", getFolderContents)
  .post("/", createFolder)
  .patch("/:folderId?", renameFolder);
module.exports = router;
