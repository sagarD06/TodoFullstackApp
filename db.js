const mongoose = require("mongoose");
require("dotenv").config();

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// Connect to MongoDB
function dbConnect() {
  mongoose.connect(process.env.MONGODB_URI);
}

// Schemas
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const todoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: ObjectId,
    ref: "userSchema",
  },
});

// creating Models

const UserModel = mongoose.model("users", userSchema);
const TodoModel = mongoose.model("todos", todoSchema);

module.exports = { UserModel, TodoModel, dbConnect };
