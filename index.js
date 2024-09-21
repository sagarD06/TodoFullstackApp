const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const z = require("zod");
require("dotenv").config();
const { UserModel, TodoModel, dbConnect } = require("./db");
const { auth } = require("./middleware");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("./public")); // renders frontend

// Connect to MongoDB
dbConnect();

/*** NON AUTH ROUTES ***/
//Signup
app.post("/sign-up", async function (req, res) {
  const reqObject = z.object({
    username: z.coerce
      .string()
      .min(3, { message: "Min 5 characters expected" })
      .max(15, { message: "Maximum 15 characters are allowed" }),
    email: z.coerce
      .string()
      .email()
      .min(5, { message: "Min 5 characters expected" })
      .max(30, { message: "Maximum 30 characters are allowed" }),
    password: z.coerce
      .string()
      .min(8, { message: "Min 8 characters expected" })
      .max(20, { message: "Maximum 20 characters are allowed" }),
    // .regex(/^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
    //   message:
    //     "Passwords must contain atleast 1 uppercase atleast 1 lower case numbers and symbols",
    // }),
  });

  try {
    const validatedData = reqObject.safeParse(req.body);

    const { username, email, password } = validatedData.data;

    if (username == "undefined") {
      return res
        .status(400)
        .json({ message: "Username is required", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      username: username,
      email: email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: "User created successfully!",
      success: true,
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "something went wrong while signingup the user!",
      success: false,
    });
  }
});

//Sign in
app.post("/sign-in", async function (req, res) {
  const reqObject = z.object({
    identifier: z.coerce
      .string()
      .min(3, { message: "Min 5 characters expected" })
      .max(15, { message: "Maximum 15 characters are allowed" }),
    password: z.coerce
      .string()
      .min(8, { message: "Min 8 characters expected" })
      .max(20, { message: "Maximum 20 characters are allowed" }),
    // .regex(/^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
    //   message:
    //     "Passwords must contain atleast 1 uppercase atleast 1 lower case numbers and symbols",
    // }),
  });

  try {
    const validatedData = reqObject.safeParse(req.body);

    const { identifier, password } = validatedData.data;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    console.log(identifier, password);

    const user = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    console.log(user);

    const isVerified = await bcrypt.compare(password, user.password);

    console.log(isVerified);

    if (!isVerified) {
      return res.status(401).json({
        message: "Invalid credentials.",
        success: false,
      });
    }
    const id = user._id.toString();

    console.log(id);

    const token = jwt.sign(id, process.env.JWT_SECRET);

    console.log(token);

    return res.status(200).json({
      message: "User logged in successfully!",
      success: true,
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "something went wrong while signingup the user!",
      success: false,
    });
  }
});

/*** AUTHENTICATED ROUTES ***/
//Get todo
app.get("/get-todos", auth, async function (req, res) {
  const userId = req.userId;

  try {
    const todos = await TodoModel.find({
      userId,
    });
    return res.status(200).json({
      message: "Todos fetched successfully!",
      success: true,
      todos,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        error.message || "something went wrong while fetching user's todos!",
      success: false,
    });
  }
});

// create todo
app.post("/create-todo", auth, async function (req, res) {
  const userId = req.userId;
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({
      message: "Title is required.",
      success: false,
    });
  }

  try {
    const todo = await TodoModel.create({ title: title, userId: userId });
    return res.status(201).json({
      message: "Todo created successfully!",
      success: true,
      todo,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "something went wrong while creating todo!",
      success: false,
    });
  }
});

// update todo
app.put("/update-todo/:todoId", auth, async function (req, res) {
  const { title } = req.body;
  const { todoId } = req.params;

  try {
    const updatedTodo = await TodoModel.findByIdAndUpdate(
      {
        _id: todoId,
      },
      {
        title: title,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      message: "Todo updated successfully!",
      success: true,
      todo: updatedTodo,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "something went wrong while updating todo!",
      success: false,
    });
  }
});

// delete todo
app.delete("/delete-todo/:todoId", auth, async function (req, res) {
  const { todoId } = req.params;
  try {
    const res = await TodoModel.findByIdAndDelete({ _id: todoId });
    console.log(res);
    return res.status(200).json({
      message: "Todo deleted successfully!",
      success: true,
      res,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "something went wrong while deleting todo!",
      success: false,
    });
  }
});

app.listen(port, () => {
  console.log("Server running on port: ", port);
});
