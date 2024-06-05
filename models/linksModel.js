import mongoose from "mongoose";

const linkSchema = mongoose.Schema({
  title: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  show: {
    type: Boolean,
    default: false,
  },
});

linkSchema.pre("save", async function (next) {
  try {
    // Check if this is a new document
    if (this.isNew) {
      // Find the highest order value and increment it by 1
      const highestOrderLink = await this.constructor
        .findOne({})
        .sort("-order")
        .exec();
      if (highestOrderLink) {
        this.order = highestOrderLink.order + 1;
      } else {
        this.order = 1;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Link", linkSchema);
