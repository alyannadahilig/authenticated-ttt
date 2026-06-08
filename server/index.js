const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 3001;

const FILE_NAME = "boardHistory.json";
const USERS_FILE = "users.json";
const SECRET = "mysecret";

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const defaultGame = {
  history: [Array(9).fill(null)],
  currentMove: 0
};

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }

  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readGames() {
  if (!fs.existsSync(FILE_NAME)) {
    fs.writeFileSync(FILE_NAME, JSON.stringify({}));
  }

  return JSON.parse(fs.readFileSync(FILE_NAME));
}

function saveGames(games) {
  fs.writeFileSync(FILE_NAME, JSON.stringify(games, null, 2));
}

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).send("Account already exists. Please enter a different email");
  }

  const hash = await bcrypt.hash(password, 10);

  users.push({
    email: email,
    password: hash
  });

  saveUsers(users);

  res.send("New user has been registered");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(401).send("User not found. Please create an account first");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).send("Wrong password");
  }

  const token = jwt.sign({ email: email }, SECRET);

  res.cookie("token", token, {
    httpOnly: true
  });

  res.send("Logged in");
});

function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send("Not logged in");
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(403).send("Invalid token");
  }
}

app.get("/game", auth, (req, res) => {
  const games = readGames();
  const email = req.user.email;

  if (!games[email]) {
    games[email] = defaultGame;
    saveGames(games);
  }

  res.json(games[email]);
});

app.post("/game", auth, (req, res) => {
  const games = readGames();
  const email = req.user.email;

  games[email] = req.body;

  saveGames(games);

  res.json({ message: "Game saved" });
});

app.post("/reset", auth, (req, res) => {
  const games = readGames();
  const email = req.user.email;

  games[email] = defaultGame;

  saveGames(games);

  res.json(defaultGame);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});