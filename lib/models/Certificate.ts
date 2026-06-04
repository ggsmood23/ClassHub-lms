import mongoose, { Schema, models, model } from "mongoose";

const CertificateSchema = new Schema(
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

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    completionDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

CertificateSchema.index({ student: 1, course: 1 }, { unique: true });

const Certificate =
  models.Certificate || model("Certificate", CertificateSchema);

export default Certificate;
