const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

const router = express.Router();

/*
 REGISTER
*/
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username,email,password) VALUES (?,?,?)",
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({
            message: "Email already exists",
          });
        }

        res.status(201).json({
          message: "User registered successfully",
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

/*
 LOGIN
*/
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (!user) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    }
  );
});

/*
 CHANGE PASSWORD
*/
router.put("/change-password", (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  db.get(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    async (err, user) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const match = await bcrypt.compare(oldPassword, user.password);

      if (!match) {
        return res.status(401).json({
          message: "Old password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.run(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId],
        function (err) {
          if (err) {
            return res.status(500).json({
              message: err.message,
            });
          }

          res.json({
            message: "Password changed successfully",
          });
        }
      );
    }
  );
});

module.exports = router;