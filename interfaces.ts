// interfaces.ts

export interface UserData {
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

// Nodig voor session.user typing in TypeScript
import 'express-session';
declare module 'express-session' {
  interface SessionData {
    user?: string;
  }
}
