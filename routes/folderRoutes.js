const { getFolderContents } = require("../controllers/folderController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = require("express").Router();
router.use(authenticateUser);

router.get("/:folderId?", getFolderContents);
module.exports = router;
