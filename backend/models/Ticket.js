const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    block: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F"],
      required: function () {
        return this.isNew;
      },
    },
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
      trim: true,
      required: function () {
        return this.isNew;
      },
      validate: {
        validator: function (value) {
          if (!this.isNew && !this.isModified("roomNumber")) return true;
          const num = Number(value);
          return Number.isInteger(num) && num >= 1 && num <= 200;
        },
        message: "Room number must be a number between 1 and 200",
      },
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
