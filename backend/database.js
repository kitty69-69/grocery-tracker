const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./grocery.db", (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("SQLite Connected");
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS grocery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  category TEXT DEFAULT 'Other',
  purchased INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
`);

db.run(`ALTER TABLE grocery_items ADD COLUMN category TEXT DEFAULT 'Other'`, () => {});
db.run(`ALTER TABLE grocery_items ADD COLUMN purchased INTEGER DEFAULT 0`, () => {});

module.exports = db;