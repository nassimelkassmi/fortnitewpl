// src/index.ts
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
    note?: string;
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

  // LOGIN
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

  // LANDING
  app.get('/', requireLogin, (req, res) => {
    res.redirect('/personages');
  });

  // PERSONAGES OVERZICHT
  app.get('/personages', requireLogin, async (req, res) => {
    const zoek = req.query.zoek?.toString().toLowerCase() || '';
    const rarity = req.query.rarity?.toString().toLowerCase() || '';
    const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const json = await apiRes.json();
    let characters = json.data.filter((c: any) => c.type.value === 'outfit');
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
    const user = await users.findOne({ username: req.session.user });
    const avatarImage = user?.avatar?.image || '';
    const favorieteIds = user?.favorites.map((f) => f.id) || [];
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
      res.render('favokarak', {
        karakter: {
          id,
          name: json.data.name,
          image: json.data.images.icon,
          description: json.data.description || 'Geen beschrijving.',
          wins: favData?.wins || 0,
          losses: favData?.losses || 0,
          items: favData?.items || [],
          notes: favData?.note ? [favData.note] : [],
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

  // FAVORIET TOEVOEGEN
// FAVORIET TOEVOEGEN/VERWIJDEREN via AJAX
app.post('/favorieten/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const user = await users.findOne({ username: req.session.user });
  if (!user) {
    res.status(401).json({ success: false, message: "Not logged in" });
    return;
  }

  const bestaat = user.favorites.find((f) => f.id === id);

  if (bestaat) {
    // Verwijder uit favorieten
    await users.updateOne(
      { username: user.username },
      { $pull: { favorites: { id } } }
    );
    res.json({ success: true, favoriet: false });
    return;
  } else {
    // Voeg toe aan favorieten
    await users.updateOne(
      { username: user.username },
      { $push: { favorites: { id, wins: 0, losses: 0, items: [], note: '' } } }
    );
    res.json({ success: true, favoriet: true });
    return;
  }
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
    const user = await users.findOne({ username: req.session.user });
    res.render('blacklist', {
      blacklist: user?.blacklist || [],
      username: req.session.user,
      avatarImage: user?.avatar?.image || '',
    });
  });

  // 🔥 NIEUWE ROUTES VOOR ITEMS

  // ITEMWINKEL ZIEN VOOR 1 KARAKTER
 app.get('/items/:id', requireLogin, async (req, res) => {
    const karakterID = req.params.id;
    const user = await users.findOne({ username: req.session.user });
    const avatarImage = user?.avatar?.image || '';

    const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
    const json = await apiRes.json();
    const allItems = json.data || [];

    const weapons = allItems.filter((i: any) => i.type.value === 'weapon');
    const emotes = allItems.filter((i: any) => i.type.value === 'emote');
    const backblings = allItems.filter((i: any) => i.type.value === 'backpack');

    res.render('items', {
      username: req.session.user,
      avatarImage,
      karakterID,
      weapons,
      emotes,
      backblings
    });
  });
app.get('/favorieten', requireLogin, async (req, res) => {
  const user = await users.findOne({ username: req.session.user });
  if (!user) return res.redirect('/personages');

  const apiRes = await fetch('https://fortnite-api.com/v2/cosmetics/br');
  const json = await apiRes.json();
  const allCharacters = json.data;

  // Koppel de favorieten met de juiste naam + image
  const favorites = user.favorites.map((fav) => {
    const match = allCharacters.find((char: any) => char.id === fav.id);
    return {
      id: fav.id,
      name: match?.name || 'Onbekend',
      image: match?.images?.icon || '/assets/question-mark.svg',
      rarity: match?.rarity?.value?.toLowerCase() || 'unknown',
    };
  });

  res.render('favoriet', {
    favorites,
    username: req.session.user,
    avatarImage: user.avatar?.image || '',
  });
});

// NOTITIE TOEVOEGEN
app.post('/notities/:id', requireLogin, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  await users.updateOne(
    { username: req.session.user, "favorites.id": id },
    { $set: { "favorites.$.note": note } }
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
  if (lossesNum >= winsNum * 3) {
    await users.updateOne(
      { username: req.session.user },
      {
        $pull: { favorites: { id } },
        $addToSet: { blacklist: { id, name, image, reason: "Personage trekt op niets" } }
      }
    );
    return res.redirect('/blacklist');
  }

  // Anders gewoon scores updaten
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

  // ITEMS OPSLAAN IN FAVORITES.VAN DIT KARAKTER
  app.post('/items/:id', requireLogin, async (req, res) => {
    const karakterID = req.params.id;
    const selectedItems = req.body.items;

    const itemsArray = Array.isArray(selectedItems) ? selectedItems : [selectedItems];

    await users.updateOne(
      { username: req.session.user, "favorites.id": karakterID },
      { $set: { "favorites.$.items": itemsArray } }
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
