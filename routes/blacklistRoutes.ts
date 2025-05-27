import express, { Request, Response, NextFunction } from 'express';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";
import { requireLogin } from "../middlewares/secureMiddlewares.ts";


// Type voor TypeScript (pas eventueel aan)
type UsersCollection = Collection<UserData>;

export function getBlacklistRoutes(users: UsersCollection) {
  const router = express.Router();

  // GET /blacklist
  router.get('/blacklist', requireLogin, async (req: Request, res: Response) => {
    const zoek = req.query.zoek?.toString().toLowerCase() || '';
    const rarity = req.query.rarity?.toString().toLowerCase() || '';
    const editId = req.query.edit?.toString() || null;
    const user = await users.findOne({ username: req.session.user });
    let blacklist = (user?.blacklist || []);
    if (zoek) {
      blacklist = blacklist.filter(char => char.name.toLowerCase().includes(zoek));
    }
    // Rarity-filter kun je aanvullen als je die ooit gebruikt
    res.render('blacklist', {
      blacklist,
      username: req.session.user,
      avatarImage: user?.avatar?.image || '',
      editId
    });
  });

  // POST /blacklist/:id (toevoegen aan blacklist)
  router.post('/blacklist/:id', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    if (req.is('application/json')) {
      const { reason, name, image } = req.body;
      if (!reason || !name || !image) {
        res.status(400).json({ success: false, message: "Ongeldige data" });
        return;
      }
      await users.updateOne(
        { username: req.session.user },
        { $addToSet: { blacklist: { id, name, image, reason } } }
      );
      res.json({ success: true });
      return;
    } else {
      const { reason, name, image } = req.body;
      if (!reason || !name || !image) {
        res.redirect(`/personages/${id}`);
        return;
      }
      await users.updateOne(
        { username: req.session.user },
        { $addToSet: { blacklist: { id, name, image, reason } } }
      );
      res.redirect('/blacklist');
      return;
    }
  });

  // POST /blacklist/:id/reden (reden aanpassen)
  router.post('/blacklist/:id/reden', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.redirect(`/blacklist?edit=${id}`);
    }
    await users.updateOne(
      { username: req.session.user, "blacklist.id": id },
      { $set: { "blacklist.$.reason": reason.trim() } }
    );
    res.redirect('/blacklist');
  });

  // POST /blacklist/:id/verwijder (verwijderen uit blacklist)
  router.post('/blacklist/:id/verwijder', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    await users.updateOne(
      { username: req.session.user },
      { $pull: { blacklist: { id } } }
    );
    res.redirect('/blacklist');
  });

  return router;
}
