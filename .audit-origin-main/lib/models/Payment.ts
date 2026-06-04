import mongoose, { Schema, models, model } from "mongoose";

const PaymentSchema = new Schema(
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

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["simulation"],
      default: "simulation",
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

PaymentSchema.index({ student: 1, course: 1, status: 1 });

const Payment = models.Payment || model("Payment", PaymentSchema);

export default Payment;
