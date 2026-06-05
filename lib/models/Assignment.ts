import mongoose, { Schema, models, model } from "mongoose";

const AssignmentSchema = new Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
    },

    dueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Draft", "Open", "Grading", "Closed"],
      default: "Draft",
    },
  },
  { timestamps: true },
);

AssignmentSchema.index({ course: 1, createdAt: -1 });

const Assignment = models.Assignment || model("Assignment", AssignmentSchema);

export default Assignment;
