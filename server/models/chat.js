import mongoose from 'mongoose';

const Chat = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Chat', Chat);
