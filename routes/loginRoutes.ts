import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";

export function getLoginRoutes(users: Collection<UserData>) {
  const router = express.Router();

  router.get('/login', (req: Request, res: Response) => {
    if ((req.session as any).user) {
      return res.redirect('/');
    }
    res.render('login', { melding: null });
  });

  router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await users.findOne({ username });
    if (!user) {
      return res.render('login', { melding: 'Gebruiker niet gevonden.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render('login', { melding: 'Wachtwoord fout.' });
    }
    req.session.user = user.username;
    res.redirect('/');
  });

  router.get('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => res.redirect('/login'));
  });

  router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => res.redirect('/login'));
  });

  return router;
}
