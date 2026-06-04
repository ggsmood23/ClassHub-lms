import mongoose, { Schema, models, model } from "mongoose";

const LessonSchema = new Schema({
  title: String,
  videoUrl: String,
  duration: String,
});

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    thumbnail: {
      type: String,
    },

    thumbnailPublicId: {
      type: String,
    },

    price: {
      type: Number,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lessons: [LessonSchema],

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

CourseSchema.index({ title: "text", category: "text" });
CourseSchema.index({ category: 1, level: 1, isPaid: 1 });
CourseSchema.index({ teacher: 1, createdAt: -1 });

const Course = models.Course || model("Course", CourseSchema);

export default Course;
