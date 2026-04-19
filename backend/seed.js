require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Complaint = require("./models/Complaint");

const seed = async () => {
  try {
    await connectDB();

    await Complaint.deleteMany({});
    await User.deleteMany({});

    const [admin, staff, student] = await User.create([
      {
        name: "Admin Warden",
        email: "admin@hostel.edu",
        password: "123456",
        role: "admin",
      },
      {
        name: "Rajan Kumar",
        email: "staff@hostel.edu",
        password: "123456",
        role: "staff",
        department: "plumbing",
      },
      {
        name: "Arjun Sharma",
        email: "student@hostel.edu",
        password: "123456",
        role: "student",
        roomNumber: "A-204",
      },
    ]);

    await Complaint.create({
      student: student._id,
      title: "WiFi not working in room",
      description: "The hostel WiFi disconnects every few minutes and is unusable.",
      category: "wifi",
      priority: "high",
      roomNumber: student.roomNumber,
      assignedTo: staff._id,
      status: "In Progress",
      statusLog: [
        {
          status: "Pending",
          updatedBy: student._id,
          note: "Complaint submitted",
        },
        {
          status: "In Progress",
          updatedBy: admin._id,
          note: `Assigned to ${staff.name}`,
        },
      ],
    });

    console.log("Seeded demo data.");
    console.log("Admin: admin@hostel.edu / 123456");
    console.log("Staff: staff@hostel.edu / 123456");
    console.log("Student: student@hostel.edu / 123456");
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seed();
