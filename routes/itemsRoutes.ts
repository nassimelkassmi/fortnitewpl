import express, { Request, Response } from 'express';
import { Collection } from 'mongodb';
import { UserData } from "../interfaces.ts";
import { requireLogin } from "../middlewares/secureMiddlewares.ts";

export function getItemsRoutes(users: Collection<UserData>) {
  const router = express.Router();

  router.get('/items/:id', requireLogin, async (req: Request, res: Response) => {
    const karakterID = req.params.id;
    const user = await users.findOne({ username: (req.session as any).user });
    const avatarImage = user?.avatar?.image || '';

    const weaponsRarity = req.query.weaponsRarity?.toString().toLowerCase() || '';
    const emotesRarity = req.query.emotesRarity?.toString().toLowerCase() || '';
    const backblingsRarity = req.query.backblingsRarity?.toString().toLowerCase() || '';
    const slot = parseInt(req.query.slot as string) || 1;

    const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const json = await apiRes.json();
    const allItems = json.data || [];

    function getRarity(r: string) {
      switch (r?.toLowerCase()) {
        case "common": return { bgColor: "#B9B9B9", rarityLabel: "COMMON" };
        case "uncommon": return { bgColor: "#4AAE4F", rarityLabel: "UNCOMMON" };
        case "rare": return { bgColor: "#3399FF", rarityLabel: "RARE" };
        case "epic": return { bgColor: "#A24EC2", rarityLabel: "EPIC" };
        case "legendary": return { bgColor: "#D98A29", rarityLabel: "LEGENDARY" };
        default: return { bgColor: "#6D6D6D", rarityLabel: "OTHER" };
      }
    }

    let weapons = allItems
      .filter((i: any) => 
        i.type?.value === 'pickaxe' &&
        i.images && 
        typeof i.images.icon === 'string' && 
        i.images.icon.endsWith('.png')
      )
      .map((w: any) => Object.assign(w, getRarity(w.rarity?.value)));

    let emotes = allItems
      .filter((i: any) => 
        i.type?.value === 'emote' &&
        i.images && 
        typeof i.images.icon === 'string' && 
        i.images.icon.endsWith('.png')
      )
      .map((e: any) => Object.assign(e, getRarity(e.rarity?.value)));

    let backblings = allItems
      .filter((i: any) => 
        i.type?.value === 'backpack' &&
        i.images && 
        typeof i.images.icon === 'string' && 
        i.images.icon.endsWith('.png')
      )
      .map((b: any) => Object.assign(b, getRarity(b.rarity?.value)));

    weapons = weapons.filter((w: any) => w.images && w.images.icon && w.images.icon.endsWith('.png'));
    emotes = emotes.filter((e: any) => e.images && e.images.icon && e.images.icon.endsWith('.png'));
    backblings = backblings.filter((b: any) => b.images && b.images.icon && b.images.icon.endsWith('.png'));

    if (weaponsRarity) weapons = weapons.filter((w: any) => w.rarityLabel.toLowerCase() === weaponsRarity);
    if (emotesRarity) emotes = emotes.filter((e: any) => e.rarityLabel.toLowerCase() === emotesRarity);
    if (backblingsRarity) backblings = backblings.filter((b: any) => b.rarityLabel.toLowerCase() === backblingsRarity);

    res.render('items', {
      username: (req.session as any).user,
      avatarImage,
      karakterID,
      slot,
      weapons,
      emotes,
      backblings,
      weaponsRarity,
      emotesRarity,
      backblingsRarity,
    });
  });

  return router;
}
