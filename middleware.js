const jwt = require("jsonwebtoken");
require("dotenv").config();


// Authenticaton middleware
function auth(req, res, next) {
  const token = req.headers.token || "";
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  const userId = jwt.verify(token, process.env.JWT_SECRET);
  if (!userId) {
    return res.status(403).json({ message: "Incorrect token", success: false });
  }

  req.userId = userId;

  next();
}

module.exports = {auth}