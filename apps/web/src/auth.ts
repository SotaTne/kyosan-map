import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@kyosan-map/db";
import NextAuth, { NextAuthResult } from "next-auth";
import Google from "next-auth/providers/google";

const result = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
});

export const handlers: NextAuthResult["handlers"] = result.handlers;
export const auth: NextAuthResult["auth"] = result.auth;
export const signIn: NextAuthResult["signIn"] = result.signIn;
export const signOut: NextAuthResult["signOut"] = result.signOut;

// export const handlers = nextAuth.handlers;
// export const signIn: typeof nextAuth.signIn = nextAuth.signIn;
// export const signOut: typeof nextAuth.signOut = nextAuth.signOut;
// export const auth: () => Promise<Session | null> = nextAuth.auth;
