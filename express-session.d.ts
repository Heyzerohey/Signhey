import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

declare module 'express' {
  interface Request {
    session: import('express-session').Session & Partial<import('express-session').SessionData>;
  }
}