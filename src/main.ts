import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ms from "ms";

const app = express();
const port = 5500;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load secrets
const rawdata = fs.readFileSync("token_secrets.json", "utf8");
const tokens = JSON.parse(rawdata);
const ACCESS_TOKEN_SECRET: string = tokens.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET: string = tokens.REFRESH_TOKEN_SECRET;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// In-memory users
type User = {
  username: string;
  password: string;
  refreshtoken: string;
  secret: string;
  email: string;
};

let users: User[] = [];
const secrets = ["donut", "cake", "muffin", "ice cream", "pizza"];

function get_secret(): string {
  const rand_index = Math.floor(Math.random() * secrets.length);
  return secrets[rand_index];
}

app.get("/", (_req: Request, res: Response): void => {
  res.sendFile(path.resolve(__dirname, "./public/landingpage.html"));
});

app.post("/register", (req: Request, res: Response): void => {
  const { user, pwd, email } = req.body;
  if (!user || !pwd) {
    res.status(400).json({ message: "username and password are required" });
    return;
  }

  const duplicate = users.find((person) => person.username === user);
  if (duplicate) {
    res.sendStatus(409);
    return;
  }

  const hashedpwd = bcrypt.hashSync(pwd, 10);
  const newUser: User = {
    username: user,
    password: hashedpwd,
    refreshtoken: "",
    secret: get_secret(),
    email: email,
  };

  users.push(newUser);
  res.status(200).json({ success: true });
});

app.post("/login", (req: Request, res: Response): void => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    res.status(400).json({ message: "username and password are required" });
    return;
  }

  const foundUser = users.find((person) => person.username === user);
  if (!foundUser) {
    res.sendStatus(401);
    return;
  }

  const match = bcrypt.compareSync(pwd, foundUser.password);
  if (!match) {
    res.sendStatus(401);
    return;
  }

  const accesstoken = jwt.sign({ username: foundUser.username }, ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
  const refreshtoken = jwt.sign({ username: foundUser.username }, REFRESH_TOKEN_SECRET, { expiresIn: "1d" });

  foundUser.refreshtoken = refreshtoken;
  res.cookie("jwt", refreshtoken, { httpOnly: true, maxAge: ms("1d") as number });
  res.json({ accesstoken });
});

app.post("/secret", verifyJWT, (req: Request, res: Response): void => {
  const user = res.locals.username;
  const match = users.find((person) => person.username === user);
  if (!match) {
    res.sendStatus(403);
    return;
  }

  res.json({ secret: match.secret });
});

app.get("/username", verifyJWT, (req: Request, res: Response): void => {
  const user = res.locals.username;
  if (!user) {
    res.sendStatus(409);
    return;
  }

  res.json({ username: user });
});

app.get("/logout", (req: Request, res: Response): void => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(401);
    return;
  }

  const refreshtoken = cookies.jwt;
  const foundUser = users.find((person) => person.refreshtoken === refreshtoken);
  if (!foundUser) {
    res.sendStatus(403);
    return;
  }

  jwt.verify(refreshtoken, REFRESH_TOKEN_SECRET, (err: any, decoded: any) => {
    if (err || foundUser.username !== decoded.username) {
      res.sendStatus(403);
      return;
    }

    foundUser.refreshtoken = "";
    res.sendStatus(204);
  });
});

app.get("/refresh", (req: Request, res: Response): void => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(401);
    return;
  }

  const refreshtoken = cookies.jwt;
  const foundUser = users.find((person) => person.refreshtoken === refreshtoken);
  if (!foundUser) {
    res.sendStatus(403);
    return;
  }

  jwt.verify(refreshtoken, REFRESH_TOKEN_SECRET, (err: any, decoded: any) => {
    if (err || foundUser.username !== decoded.username) {
      res.sendStatus(403);
      return;
    }

    const accesstoken = jwt.sign({ username: foundUser.username }, ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
    res.json({ accesstoken });
  });
});

function verifyJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.sendStatus(403);
      return;
    }

    res.locals.username = decoded.username;
    next();
  });
}

app.all("*", (_req: Request, res: Response): void => {
  res.status(404).send("not found");
});

app.listen(port, (): void => {
  console.log("Server listening on port", port);
});
