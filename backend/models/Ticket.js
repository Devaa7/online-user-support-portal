const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    roomNumber: {
  type: String,
  required: true,
  trim: true,
},
    category: {
  type: String,
  enum: [
    "Electrical",
    "Plumbing",
    "WiFi/Network",
    "Room Damage",
    "Mess Complaint",
    "General",
  ],
  default: "General",
},
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    slaHours: {
      type: Number,
      default: 48,
    },
  slaDueAt: {
    type: Date,
  },
  history: [
  {
    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);