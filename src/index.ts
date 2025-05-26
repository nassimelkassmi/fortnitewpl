import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { MongoClient, Db } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UserData {
  username: string;
  password: string;
  email: string;
  refreshtoken: string;
  avatar?: { id: string; image: string };
  favorites: {
    id: string;
    notes?: string[]; 
    wins?: number;
    losses?: number;
    items?: string[];
  }[];
  blacklist: { id: string; name: string; image: string; reason: string }[];
}

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

function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

async function main() {
  const client = new MongoClient(process.env.MONGO_URI!);
  await client.connect();
  const db: Db = client.db(process.env.MONGO_DBNAME!);
  const users = db.collection<UserData>('users');

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI!,
        dbName: process.env.MONGO_DBNAME,
        collectionName: 'sessions',
      }),
      cookie: { maxAge: 1000 * 60 * 60 * 24 },
    })
  );
app.get('/personages/:id/favorietdetail', requireLogin, async (req, res) => {
  const { id } = req.params;
  const user = await users.findOne({ username: req.session.user });
  const favData = user?.favorites.find(f => f.id === id);
  if (!favData) return res.redirect(`/personages/${id}`);

  const apiRes = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`);
  const json = await apiRes.json();
  if (!json.data) return res.redirect(`/personages/${id}`); // bestaat niet

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


  app.get('/login', (req, res) => {
    if (req.session.user) {
      res.redirect('/');
      return;
    }
    res.render('login', { melding: null });
  });

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await users.findOne({ username });
    if (!user) {
      res.render('login', { melding: 'Gebruiker niet gevonden.' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.render('login', { melding: 'Wachtwoord fout.' });
      return;
    }
    req.session.user = user.username;
    res.redirect('/');
  });

  app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
  });

  // REGISTER
  app.get('/registreren', (req, res) => {
    res.render('register', { melding: null });
  });

  app.post('/registreren', async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      res.render('register', { melding: 'Alle velden zijn verplicht.' });
      return;
    }
    if (await users.findOne({ username })) {
      res.render('register', { melding: 'Gebruikersnaam bestaat al.' });
      return;
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


  // PERSONAGES OVERZICHT
  app.get('/personages', requireLogin, async (req, res) => {
  const zoek = req.query.zoek?.toString().toLowerCase() || '';
  const rarity = req.query.rarity?.toString().toLowerCase() || '';
  const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
  const json = await apiRes.json();
  let characters = json.data.filter((c: any) => c.type.value === 'outfit');

  const user = await users.findOne({ username: req.session.user });
  const avatarImage = user?.avatar?.image || '';
  const favorieteIds = user?.favorites.map((f) => f.id) || [];
  const blacklistIds = user?.blacklist.map((b) => b.id) || [];

  // 🔥 Verwijder karakters uit de blacklist
  characters = characters.filter((c: any) => !blacklistIds.includes(c.id));

  if (zoek) {
    characters = characters.filter((c: any) => c.name.toLowerCase().includes(zoek));
  }
  if (rarity) {
    characters = characters.filter((c: any) => c.rarity.value.toLowerCase() === rarity);
  }
  characters = characters.map((c: any) => ({
    id: c.id,
    name: c.name,
    image: c.images.icon,
    rarity: c.rarity.value,
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

  // DETAILPAGINA
  app.get('/personages/:id', requireLogin, async (req, res) => {
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

  // Haal alle item-data op uit de Fortnite API
  const apiResAll = await fetch('https://fortnite-api.com/v2/cosmetics/br');
  const jsonAll = await apiResAll.json();
  const allItems = jsonAll.data;

  // Zoek voor elke opgeslagen item-ID de juiste image-URL (max 2 slots)
  const itemImages = (favData?.items || []).map(itemID => {
    const item = allItems.find((itm: any) => itm.id === itemID);
    return item?.images?.icon || '/assets/placeholder.png';
  });

  // Vul aan tot je er 2 hebt (voor lege slots)
  while (itemImages.length < 2) itemImages.push('/assets/placeholder.png');

  res.render('favokarak', {
    karakter: {
      id,
      name: json.data.name,
      image: json.data.images.icon,
      description: json.data.description || 'Geen beschrijving.',
      wins: favData?.wins || 0,
      losses: favData?.losses || 0,
      items: itemImages, // <-- nu lijst van plaatje-urls
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
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});
// src/index.ts
app.get('/', (req, res) => {
  // Toon altijd de landingpage, ongeacht loginstatus
  res.render('landingpage', {
    username: req.session.user || null,
    avatarImage: null // kan je aanvullen als je wilt
  });
});
app.get('/lproject', requireLogin, async (req, res) => {
  // Toon de hoofdpagina van het project na login én keuze
  const user = await users.findOne({ username: req.session.user });
  res.render('lproject', {
    username: req.session.user,
    avatarImage: user?.avatar?.image || '',
  });
});
app.post('/login', async (req, res) => {
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
  // <--- BELANGRIJK
  res.redirect('/');  // <-- ALTIJD NAAR LANDINGPAGE!
});

  // FAVORIET TOEVOEGEN
app.post('/favorieten/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const user = await users.findOne({ username: req.session.user });
  if (!user) {
    res.redirect(`/personages/${id}`);
    return;
  }

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



// AVATAR INSTELLEN via AJAX
app.post('/avatar/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const apiRes = await fetch(`https://fortnite-api.com/v2/cosmetics/br/${id}`);
  const json = await apiRes.json();
  const image = json.data?.images?.icon || '';

  const user = await users.findOne({ username: req.session.user });
  // Toggle: als het dezelfde is, verwijder avatar; anders stel nieuw in
  if (user?.avatar?.id === id) {
    await users.updateOne(
      { username: req.session.user },
      { $set: { avatar: undefined } }
    );
    res.json({ success: true, avatarSet: false });
    return;
  } else {
    await users.updateOne(
      { username: req.session.user },
      { $set: { avatar: { id, image } } }
    );
    res.json({ success: true, avatarSet: true });
    return;
  }
});

// BLACKLIST TOEVOEGEN via AJAX
app.post('/blacklist/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  // Check of het een AJAX JSON request is
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
    // Fallback voor form-submit (optioneel)
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




  app.get('/lproject', requireLogin, async (req, res) => {
  const user = await users.findOne({ username: req.session.user });
  const avatarImage = user?.avatar?.image || '';
  res.render('lproject', {
    username: req.session.user,
    avatarImage,
  });
});

app.get('/landing', (req, res) => {
  res.render("landingpage", {
    username: req.session.user || null
  });
});

   // BLACKLIST OVERZICHT
app.get('/blacklist', requireLogin, async (req, res) => {
  const zoek = req.query.zoek?.toString().toLowerCase() || '';
  const rarity = req.query.rarity?.toString().toLowerCase() || '';
  const editId = req.query.edit?.toString() || null;

  const user = await users.findOne({ username: req.session.user });

  // Rarity filter
  let blacklist = (user?.blacklist || []);
  if (zoek) {
    blacklist = blacklist.filter(char => char.name.toLowerCase().includes(zoek));
  }

  // Als je ooit de rarity wilt filteren: sla rarity van de character op in blacklist.
  if (rarity) {
    // Je hebt geen rarity in je blacklist, maar als je het toevoegt:
    // blacklist = blacklist.filter(char => (char.rarity || '').toLowerCase() === rarity);
  }

  res.render('blacklist', {
    blacklist,
    username: req.session.user,
    avatarImage: user?.avatar?.image || '',
    editId
  });
});

app.post('/blacklist/:id/reden', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason || reason.trim() === '') {
    return res.redirect(`/blacklist?edit=${id}`);
  }
  // Update alleen de reden van deze entry:
  await users.updateOne(
    { username: req.session.user, "blacklist.id": id },
    { $set: { "blacklist.$.reason": reason.trim() } }
  );
  res.redirect('/blacklist');
});


  // 🔥 NIEUWE ROUTES VOOR ITEMS

  // ITEMWINKEL ZIEN VOOR 1 KARAKTER
app.get('/items/:id', requireLogin, async (req, res) => {
  const karakterID = req.params.id;
  const user = await users.findOne({ username: req.session.user });
  const avatarImage = user?.avatar?.image || '';

  // Query params voor elk filter
  const weaponsRarity = req.query.weaponsRarity?.toString().toLowerCase() || '';
  const emotesRarity = req.query.emotesRarity?.toString().toLowerCase() || '';
  const backblingsRarity = req.query.backblingsRarity?.toString().toLowerCase() || '';
const slot = parseInt(req.query.slot as string) || 1;


  const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
  const json = await apiRes.json();
  const allItems = json.data || [];

  // Helper om kleur en label te bepalen (net als je oude js)
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
    username: req.session.user,
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


  // FAVORIET VERWIJDEREN (buiten andere routes!)
app.post('/favorieten/:id/verwijder', requireLogin, async (req, res) => {
  const { id } = req.params;
  await users.updateOne(
    { username: req.session.user },
    { $pull: { favorites: { id } } }
  );
  res.redirect('/favorieten');
});

app.get('/favorieten', requireLogin, async (req: Request, res: Response) => {
  const zoek = req.query.zoek?.toString().toLowerCase() || '';
  const rarity = req.query.rarity?.toString().toLowerCase() || '';
  const user = await users.findOne({ username: req.session.user });
  if (!user) return res.redirect('/personages');

  const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
  const json = await apiRes.json();
  const allCharacters = json.data;

  // Blacklist ID's ophalen
  const blacklistIds = user.blacklist.map((b) => b.id) || [];

  // Filter je favorieten rechtstreeks in de map/filter!
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

  // Zoekfilter en rarity-filter toepassen
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



// NOTITIE TOEVOEGEN
// NOTITIE TOEVOEGEN (voegt een nieuwe notitie toe aan de array)
app.post('/notities/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  if (!note?.trim()) {
    return res.redirect(`/personages/${id}`);
  }

  await users.updateOne(
    { username: req.session.user, "favorites.id": id },
    { $push: { "favorites.$.notes": note } }
  );
  res.redirect(`/personages/${id}`);
});
// NOTITIE VERWIJDEREN op index
app.post('/notities/:id/verwijder/:noteIdx', requireLogin, async (req, res) => {
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

// SCORE BIJWERKEN
app.post('/score/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { wins, losses, name, image } = req.body;
  const winsNum = parseInt(wins);
  const lossesNum = parseInt(losses);

  const user = await users.findOne({ username: req.session.user });

  // Verplaats naar blacklist indien losses ≥ 3 × wins
// Alleen naar blacklist als:
// - 0 wins én minstens 3 losses, of
// - 1+ wins én losses ≥ 3 × wins
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

// BLACKLIST VERWIJDEREN
app.post('/blacklist/:id/verwijder', requireLogin, async (req, res) => {
  const { id } = req.params;
  await users.updateOne(
    { username: req.session.user },
    { $pull: { blacklist: { id } } }
  );
  res.redirect('/blacklist');
});

app.post('/items/:id', requireLogin, async (req, res) => {
  const karakterID = req.params.id;
  const itemID = req.body.items;
  const slot = parseInt(req.body.slot) || 1;


  const user = await users.findOne({ username: req.session.user });
  const fav = user?.favorites.find(f => f.id === karakterID);
  if (!fav) return res.redirect('/personages/' + karakterID);

  let newItems = fav.items || [];
  newItems[slot - 1] = itemID; // Zorg dat er altijd max. 2 slots zijn

  await users.updateOne(
    { username: req.session.user, "favorites.id": karakterID },
    { $set: { "favorites.$.items": newItems } }
  );
  res.redirect(`/personages/${karakterID}`);
});


  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`✅ Server draait op http://localhost:${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
