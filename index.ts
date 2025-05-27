import express, { Request, Response, NextFunction } from 'express';
import { MongoClient, Db } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connect } from "./database.ts";
import { UserData } from "./interfaces.ts";
import sessionMiddleware from "./session.ts";
import { getLoginRoutes } from "./routes/loginRoutes.ts";
import { getRegisterRoutes } from "./routes/registerRoutes.ts";
import { getAvatarRoutes } from "./routes/avatarRoutes.ts";
import { getFavorietenRoutes } from "./routes/favorietenRoutes.ts";
import { getBlacklistRoutes } from "./routes/blacklistRoutes.ts";
import { getPersonagesRoutes } from "./routes/personagesRoutes.ts";
import { getItemsRoutes } from "./routes/itemsRoutes.ts";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module 'express-session' {
  interface SessionData {
    user?: string;
  }
}
function getRarityColor(rarity: string): string {
  const rarityColors: Record<string, string> = {
    "common": "#B9B9B9",
    "uncommon": "#4AAE4F",
    "rare": "#3399FF",
    "epic": "#A24EC2",
    "legendary": "#D98A29",
    "other": "#6D6D6D"
  };
  return rarityColors[rarity] || "#6D6D6D";
}

import { requireLogin } from './middlewares/secureMiddlewares.ts';


async function main() {
 const db = await connect();

  const users = db.collection<UserData>('users');
 

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(sessionMiddleware);
 app.use(getLoginRoutes(users));
app.use(getRegisterRoutes(users));
app.use(getAvatarRoutes(users));
app.use(getFavorietenRoutes(users));
app.use(getBlacklistRoutes(users));
app.use(getPersonagesRoutes(users));
app.use(getItemsRoutes(users));


// src/index.ts
app.get('/', (req, res) => {
  res.render('landingpage', {
    username: req.session.user || null,
    avatarImage: null 
  });
});
app.get('/lproject', requireLogin, async (req, res) => {
  const user = await users.findOne({ username: req.session.user });
  res.render('lproject', {
    username: req.session.user,
    avatarImage: user?.avatar?.image || '',
  });
});


app.get('/landing', (req, res) => {
  res.render("landingpage", {
    username: req.session.user || null
  });
});


  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server draait op http://localhost:${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
