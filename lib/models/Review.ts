import mongoose, { Schema, models, model } from "mongoose";

const ReviewSchema = new Schema(
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },

    moderationStatus: {
      type: String,
      enum: ["published", "resolved"],
      default: "published",
    },
  },
  { timestamps: true },
);

ReviewSchema.index({ student: 1, course: 1 }, { unique: true });
ReviewSchema.index({ course: 1, createdAt: -1 });

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
