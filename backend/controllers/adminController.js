const Complaint = require("../models/Complaint");
const User = require("../models/User");

exports.getAllComplaints = async (req, res) => {
  try {
    const filter = {};

    ["status", "category", "priority"].forEach((key) => {
      if (req.query[key]) {
        filter[key] = req.query[key];
      }
    });

    const complaints = await Complaint.find(filter)
      .populate("student", "name email roomNumber")
      .populate("assignedTo", "name department")
      .sort({ createdAt: -1 });

    const summary = {
      total: await Complaint.countDocuments(),
      pending: await Complaint.countDocuments({ status: "Pending" }),
      inProgress: await Complaint.countDocuments({ status: "In Progress" }),
      resolved: await Complaint.countDocuments({ status: "Resolved" }),
    };

    return res.json({ success: true, summary, complaints });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.assignStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.body.staffId);

    if (!staff || staff.role !== "staff") {
      return res.status(400).json({ message: "Invalid staff member." });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: req.body.staffId,
        status: "In Progress",
        $push: {
          statusLog: {
            status: "In Progress",
            updatedBy: req.user.id,
            note: `Assigned to ${staff.name}`,
          },
        },
      },
      { new: true }
    )
      .populate("assignedTo", "name department")
      .populate("student", "name email roomNumber");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const io = req.app.get("io");

    io.to(req.body.staffId).emit("new_assignment", {
      message: `New task assigned: ${complaint.title}`,
      complaintId: complaint._id,
    });

    io.to(complaint.student._id.toString()).emit("status_update", {
      message: "Your complaint is now In Progress.",
      status: "In Progress",
      complaintId: complaint._id,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        $push: {
          statusLog: {
            status,
            updatedBy: req.user.id,
            note: remarks || `Updated to ${status}`,
          },
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    req.app.get("io").to(complaint.student.toString()).emit("status_update", {
      message: `Complaint status changed to ${status}.`,
      status,
      complaintId: complaint._id,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getStaffList = async (req, res) => {
  const staff = await User.find({ role: "staff" }).select("-password").sort({ name: 1 });
  return res.json({ success: true, staff });
};

exports.deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findByIdAndDelete(req.params.id);

  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found." });
  }

  return res.json({ success: true, message: "Complaint deleted." });
};
