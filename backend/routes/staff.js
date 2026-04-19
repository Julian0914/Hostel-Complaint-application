const express = require("express");
const { protect, authorise } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/staffController");

const router = express.Router();

router.use(protect, authorise("staff"));
router.get("/", ctrl.getAssigned);
router.put("/:id/complete", ctrl.markCompleted);
router.put("/:id/progress", ctrl.addNote);

module.exports = router;
