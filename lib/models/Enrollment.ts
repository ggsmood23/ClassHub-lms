import mongoose, { Schema, models, model } from "mongoose";

const EnrollmentSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    progress: {
      type: Number,
      default: 0,
    },

    completedLessons: [
      {
        type: String,
      },
    ],

    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment =
  models.Enrollment || model("Enrollment", EnrollmentSchema);

export default Enrollment;
