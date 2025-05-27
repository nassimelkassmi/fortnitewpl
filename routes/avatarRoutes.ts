// routes/avatarRoutes.ts
import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";
import { requireLogin } from "../middlewares/secureMiddlewares.ts";

// users is van type Collection<UserData>
export function getAvatarRoutes(users: Collection<UserData>) {
  const router = express.Router();

  // Avatar instellen of verwijderen
  router.post('/avatar/:id', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const apiRes = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`);
    const json = await apiRes.json();
    const image = json.data?.images?.icon || '';

    const user = await users.findOne({ username: req.session.user });
    if (user?.avatar?.id === id) {
      // Avatar verwijderen
      await users.updateOne(
        { username: req.session.user },
        { $set: { avatar: undefined } }
      );
      res.json({ success: true, avatarSet: false });
      return;
    } else {
      // Avatar instellen
      await users.updateOne(
        { username: req.session.user },
        { $set: { avatar: { id, image } } }
      );
      res.json({ success: true, avatarSet: true });
      return;
    }
  });

  return router;
}
