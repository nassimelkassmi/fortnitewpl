// src/routes/registerRoutes.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";

export function getRegisterRoutes(users: Collection<UserData>) {
  const router = express.Router();

  router.get('/registreren', (req: Request, res: Response) => {
    res.render('register', { melding: null });
  });

  router.post('/registreren', async (req: Request, res: Response) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.render('register', { melding: 'Alle velden zijn verplicht.' });
    }
    if (await users.findOne({ username })) {
      return res.render('register', { melding: 'Gebruikersnaam bestaat al.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await users.insertOne({
      username,
      password: hash,
      email,
      refreshtoken: '',
      avatar: undefined,
      favorites: [],
      blacklist: [],
    });
    res.redirect('/login');
  });

  return router;
}

