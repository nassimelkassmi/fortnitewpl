import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";
import { requireLogin } from "../middlewares/secureMiddlewares.ts";

// Functie om rarity te normaliseren
function mapRarity(rarity: string): string {
  const allowed = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'other'];
  const lower = rarity?.toLowerCase() || 'other';
  return allowed.includes(lower) ? lower : 'other';
}

const PAGE_SIZE = 12; // 3 rijen van 4 per pagina

// PAGINATIENUMMERING LOGICA
function getPagination(current: number, total: number, maxLength = 7): number[] {
  const range = [];
  let start = Math.max(1, current - Math.floor(maxLength / 2));
  let end = Math.min(total, start + maxLength - 1);

  if (end - start < maxLength - 1) {
    start = Math.max(1, end - maxLength + 1);
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
}

export function getPersonagesRoutes(users: Collection<UserData>) {
  const router = express.Router();

  // Personages overzicht met paginatie
  router.get('/personages', requireLogin, async (req: Request, res: Response) => {
    const zoek = req.query.zoek?.toString().toLowerCase() || '';
    const rarity = req.query.rarity?.toString().toLowerCase() || '';
    const page = parseInt(req.query.page as string) || 1;

    // API-call outfits
    const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const json = await apiRes.json();
    let characters = json.data.filter((c: any) => c.type.value === 'outfit');

    // User-data ophalen
    const user = await users.findOne({ username: req.session.user });
    const avatarImage = user?.avatar?.image || '';
    const favorieteIds = user?.favorites.map((f) => f.id) || [];
    const blacklistIds = user?.blacklist.map((b) => b.id) || [];

    // Blacklist filter
    characters = characters.filter((c: any) => !blacklistIds.includes(c.id));

    // Zoek-filter
    if (zoek) {
      characters = characters.filter((c: any) => c.name.toLowerCase().includes(zoek));
    }

    // Rarity-filter
    if (rarity) {
      characters = characters.filter((c: any) => c.rarity.value.toLowerCase() === rarity);
    }

    // Map de nodige velden + normalize rarity
    characters = characters.map((c: any) => ({
      id: c.id,
      name: c.name,
      image: c.images.icon,
      rarity: mapRarity(c.rarity.value),
    }));

    // PAGINATIE
    const totalCharacters = characters.length;
    const totalPages = Math.max(1, Math.ceil(totalCharacters / PAGE_SIZE));
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pagedCharacters = characters.slice(startIndex, endIndex);

    // PAGINATIENUMMERS voor EJS
    const pagination = getPagination(page, totalPages, 7);

    res.render('personages', {
      characters: pagedCharacters,
      username: req.session.user,
      avatarImage,
      zoek,
      rarity,
      favorieteIds,
      popupMessage: '',
      page,
      totalPages,
      totalCharacters,
      from: totalCharacters === 0 ? 0 : startIndex + 1,
      to: Math.min(endIndex, totalCharacters),
      pagination
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
