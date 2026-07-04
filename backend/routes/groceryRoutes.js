const express = require("express");
const db = require("../database");

const router = express.Router();

// Add grocery item
router.post("/add", (req, res) => {
  const { userId, itemName, quantity, price, category } = req.body;

  db.run(
    `INSERT INTO grocery_items 
    (user_id, item_name, quantity, price, category, purchased)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, itemName, quantity, price, category || "Other", 0],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      res.json({ message: "Item added successfully" });
    }
  );
});

// Get user grocery items
router.get("/:userId", (req, res) => {
  db.all(
    "SELECT * FROM grocery_items WHERE user_id = ?",
    [req.params.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      res.json(rows);
    }
  );
});

// Mark purchased / unpurchased
router.patch("/toggle/:id", (req, res) => {
  const { purchased } = req.body;

  db.run(
    "UPDATE grocery_items SET purchased = ? WHERE id = ?",
    [purchased, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      res.json({ message: "Item updated" });
    }
  );
});

// Delete item
router.delete("/:id", (req, res) => {
  db.run(
    "DELETE FROM grocery_items WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      res.json({ message: "Item deleted" });
    }
  );
});

module.exports = router;