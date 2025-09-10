const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"), (err) => {
    if (err) console.error("Database error:", err);
    else console.log("Connected to SQLite database.");
});

// Create highscores table if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS highscores (
    name TEXT PRIMARY KEY,
    score INTEGER NOT NULL
);
`);

const TOKENS = {}; // { token: expiration_timestamp }

const TOKEN_LIFETIME_MS = 0.5 * 60 * 1000; // 30 seconds

// Issue token
app.get("/get-token", (req, res) => {
    const token = crypto.randomBytes(16).toString("hex");
    const expires = Date.now() + TOKEN_LIFETIME_MS;
    TOKENS[token] = expires;
    res.json({ token, expires });
});

// Middleware to check token
function checkToken(req, res, next) {
    const token = req.headers["x-game-token"];
    if (!token || !TOKENS[token]) {
        return res.status(403).json({ error: "Invalid token" });
    }
    if (Date.now() > TOKENS[token]) {
        delete TOKENS[token];
        return res.status(403).json({ error: "Token expired" });
    }
    next();
}


// Submit/update score
app.post("/submit", checkToken, (req, res) => {
    const { name, score } = req.body;

    db.get("SELECT score FROM highscores WHERE name = ?", [name], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            if (score > row.score) {
                db.run("UPDATE highscores SET score = ? WHERE name = ?", [score, name]);
            }
        } else if(name != null && name != "") {
            db.run("INSERT INTO highscores (name, score) VALUES (?, ?)", [name, score], function(err) {
                if (err) {
                    console.error("Failed to insert:", err.message);
                } else {
                    console.log(`Inserted ${name} with score ${score}`);
                }
            });
        }else{
            return res.status(400).json({ error: "Name cannot be empty" });
        }

        delete TOKENS[req.headers["x-game-token"]];

        res.json({ success: true });
    });
});

// Get player’s score
app.get("/score/:name", (req, res) => {
    const name = req.params.name;
    db.get("SELECT score FROM highscores WHERE name = ?", [name], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ name, score: row ? row.score : 0 });
    });
});

// Get leaderboard
app.get("/leaderboard", (req, res) => {
    db.all("SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
