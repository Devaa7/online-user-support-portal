const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: String,
    description: String,
    category: String,
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low"
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
