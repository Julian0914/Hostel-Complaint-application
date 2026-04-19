const express = require("express");
const { protect, authorise } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorise("admin"));
router.get("/", ctrl.getAllComplaints);
router.get("/staff", ctrl.getStaffList);
router.put("/:id/assign", ctrl.assignStaff);
router.put("/:id/status", ctrl.updateStatus);
router.delete("/:id", ctrl.deleteComplaint);

module.exports = router;
