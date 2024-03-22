const {
  getFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
} = require("../controllers/folderController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();
router.use(authenticateUser);

router
  .get("/:folderId?", getFolderContents)
  .post("/", createFolder)
  .patch("/:folderId?", renameFolder)
  .delete("/:folderId?", deleteFolder);
module.exports = router;
