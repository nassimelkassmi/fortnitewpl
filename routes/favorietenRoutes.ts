// routes/favorietenRoutes.ts
import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";
import { requireLogin } from "../middlewares/secureMiddlewares.ts";

// Je krijgt users (Collection<UserData>) mee als parameter:
export function getFavorietenRoutes(users: Collection<UserData>) {
  const router = express.Router();

  // Favoriet toevoegen/verwijderen
  router.post('/favorieten/:id', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await users.findOne({ username: req.session.user });
    if (!user) return res.redirect(`/personages/${id}`);

    const bestaat = user.favorites.find((f) => f.id === id);
    let favoriet: boolean;
    if (bestaat) {
      await users.updateOne(
        { username: user.username },
        { $pull: { favorites: { id } } }
      );
      favoriet = false;
    } else {
      await users.updateOne(
        { username: user.username },
        { $push: { favorites: { id, wins: 0, losses: 0, items: [], notes: [] } } }
      );
      favoriet = true;
    }

    if (req.headers.accept?.includes('application/json')) {
      res.json({ favoriet });
      return;
    }
    res.redirect(`/personages/${id}`);
  });

  // Favorietenpagina tonen
  router.get('/favorieten', requireLogin, async (req: Request, res: Response) => {
    const zoek = req.query.zoek?.toString().toLowerCase() || '';
    const rarity = req.query.rarity?.toString().toLowerCase() || '';
    const user = await users.findOne({ username: req.session.user });
    if (!user) return res.redirect('/personages');

    const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const json = await apiRes.json();
    const allCharacters = json.data;

    const blacklistIds = user.blacklist.map((b) => b.id) || [];

    let favorites = user.favorites
      .filter((fav) => !blacklistIds.includes(fav.id))
      .map((fav) => {
        const match = allCharacters.find((char: any) => char.id === fav.id);
        return {
          id: fav.id,
          name: match?.name || 'Onbekend',
          image: match?.images?.icon || '/assets/question-mark.svg',
          rarity: (match?.rarity?.value || 'unknown').toLowerCase(),
        };
      });

    if (zoek) {
      favorites = favorites.filter((fav) => fav.name.toLowerCase().includes(zoek));
    }
    if (rarity) {
      favorites = favorites.filter((fav) => fav.rarity === rarity);
    }

    res.render('favoriet', {
      favorites,
      username: req.session.user,
      avatarImage: user.avatar?.image || '',
      zoek,
      rarity,
      popupMessage: '',
    });
  });

  // Favoriet verwijderen (vanuit overzicht)
  router.post('/favorieten/:id/verwijder', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    await users.updateOne(
      { username: req.session.user },
      { $pull: { favorites: { id } } }
    );
    res.redirect('/favorieten');
  });

  // Detailpagina favoriet (favokarak)
  router.get('/personages/:id/favorietdetail', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await users.findOne({ username: req.session.user });
    const favData = user?.favorites.find(f => f.id === id);
    if (!favData) return res.redirect(`/personages/${id}`);

    const apiRes = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`);
    const json = await apiRes.json();
    if (!json.data) return res.redirect(`/personages/${id}`);

    const apiResAll = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const jsonAll = await apiResAll.json();
    const allItems = jsonAll.data;

    const itemImages = (favData.items || []).map(itemID => {
      const item = allItems.find((itm: any) => itm.id === itemID);
      return item?.images?.icon || '/assets/placeholder.png';
    });
    while (itemImages.length < 2) itemImages.push('/assets/placeholder.png');

    res.render('favokarak', {
      karakter: {
        id,
        name: json.data.name,
        image: json.data.images.icon,
        description: json.data.description || 'Geen beschrijving.',
        wins: favData?.wins || 0,
        losses: favData?.losses || 0,
        items: itemImages,
        notes: favData?.notes || [],
      },
      username: req.session.user,
      avatarImage: user?.avatar?.image || '',
    });
  });

  // Notities toevoegen/verwijderen
  router.post('/notities/:id', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { note } = req.body;
    if (!note?.trim()) return res.redirect(`/personages/${id}`);
    await users.updateOne(
      { username: req.session.user, "favorites.id": id },
      { $push: { "favorites.$.notes": note } }
    );
    res.redirect(`/personages/${id}`);
  });

  router.post('/notities/:id/verwijder/:noteIdx', requireLogin, async (req: Request, res: Response) => {
    const { id, noteIdx } = req.params;
    const user = await users.findOne({ username: req.session.user });
    const fav = user?.favorites.find(f => f.id === id);
    if (!fav || !fav.notes || fav.notes.length <= Number(noteIdx)) return res.redirect(`/personages/${id}`);

    fav.notes.splice(Number(noteIdx), 1);
    await users.updateOne(
      { username: req.session.user, "favorites.id": id },
      { $set: { "favorites.$.notes": fav.notes } }
    );
    res.redirect(`/personages/${id}`);
  });

  // Score bijwerken (wins/losses)
  router.post('/score/:id', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { wins, losses, name, image } = req.body;
    const winsNum = parseInt(wins);
    const lossesNum = parseInt(losses);
    const user = await users.findOne({ username: req.session.user });

    if (
      (winsNum === 0 && lossesNum >= 3) ||
      (winsNum > 0 && lossesNum >= winsNum * 3)
    ) {
      await users.updateOne(
        { username: req.session.user },
        {
          $pull: { favorites: { id } },
          $addToSet: { blacklist: { id, name, image, reason: "Personage trekt op niets" } }
        }
      );
      return res.redirect('/blacklist');
    }

    await users.updateOne(
      { username: req.session.user, "favorites.id": id },
      { $set: { "favorites.$.wins": winsNum, "favorites.$.losses": lossesNum } }
    );
    res.redirect(`/personages/${id}`);
  });

  // Favorieten-item aanpassen (items/gear kiezen)
  router.post('/items/:id', requireLogin, async (req: Request, res: Response) => {
    const karakterID = req.params.id;
    const itemID = req.body.items;
    const slot = parseInt(req.body.slot) || 1;

    const user = await users.findOne({ username: req.session.user });
    const fav = user?.favorites.find(f => f.id === karakterID);
    if (!fav) return res.redirect('/personages/' + karakterID);

    let newItems = fav.items || [];
    newItems[slot - 1] = itemID;
    await users.updateOne(
      { username: req.session.user, "favorites.id": karakterID },
      { $set: { "favorites.$.items": newItems } }
    );
    res.redirect(`/personages/${karakterID}`);
  });

  return router;
}
