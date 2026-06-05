import mongoose, { Schema, models, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["course_created", "course_updated", "enrollment_received", "course_completed"],
      required: true,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

NotificationSchema.index({ user: 1, createdAt: -1 });

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;
