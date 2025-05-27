// src/routes/personagesRoutes.ts

import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";
import { requireLogin } from "../middlewares/secureMiddlewares.ts";

// Toevoegen: mapRarity functie
function mapRarity(rarity: string): string {
  const allowed = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'other'];
  const lower = rarity?.toLowerCase() || 'other';
  return allowed.includes(lower) ? lower : 'other';
}

export function getPersonagesRoutes(users: Collection<UserData>) {
  const router = express.Router();

  // Personages overzicht
  router.get('/personages', requireLogin, async (req: Request, res: Response) => {
    const zoek = req.query.zoek?.toString().toLowerCase() || '';
    const rarity = req.query.rarity?.toString().toLowerCase() || '';
    const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const json = await apiRes.json();
    let characters = json.data.filter((c: any) => c.type.value === 'outfit');

    const user = await users.findOne({ username: req.session.user });
    const avatarImage = user?.avatar?.image || '';
    const favorieteIds = user?.favorites.map((f) => f.id) || [];
    const blacklistIds = user?.blacklist.map((b) => b.id) || [];

    characters = characters.filter((c: any) => !blacklistIds.includes(c.id));
    if (zoek) {
      characters = characters.filter((c: any) => c.name.toLowerCase().includes(zoek));
    }
    if (rarity) {
      characters = characters.filter((c: any) => c.rarity.value.toLowerCase() === rarity);
    }

    // Let op: mapRarity wordt nu gebruikt!
    characters = characters.map((c: any) => ({
      id: c.id,
      name: c.name,
      image: c.images.icon,
      rarity: mapRarity(c.rarity.value),
    }));

    res.render('personages', {
      characters,
      username: req.session.user,
      avatarImage,
      zoek,
      rarity,
      favorieteIds,
      popupMessage: '',
    });
  });

  // Detailpagina voor personage (favoriet of niet)
  router.get('/personages/:id', requireLogin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const apiRes = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`);
    const json = await apiRes.json();
    if (!json.data) {
      res.status(404).send('Karakter niet gevonden');
      return;
    }
    const user = await users.findOne({ username: req.session.user });
    const isFavoriet = user?.favorites.some((fav) => fav.id === id);
    const avatarImage = user?.avatar?.image || '';

    if (isFavoriet) {
      const favData = user!.favorites.find((f) => f.id === id);
      const apiResAll = await fetch('https://fortnite-api.com/v2/cosmetics/br');
      const jsonAll = await apiResAll.json();
      const allItems = jsonAll.data;

      const itemImages = (favData?.items || []).map(itemID => {
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
        avatarImage,
      });
      return;
    }

    res.render('karakter', {
      karakter: {
        id,
        name: json.data.name,
        image: json.data.images.icon,
        description: json.data.description || 'Geen beschrijving.',
        rarity: json.data.rarity?.value || 'unknown',
        set: json.data.set?.value || 'Geen set',
        releaseDate: json.data.introduction?.text || 'Onbekend',
      },
      username: req.session.user,
      avatarImage,
      isFavoriet: false,
      popupMessage: '',
    });
  });

  return router;
}
