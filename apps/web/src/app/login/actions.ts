"use server";

import { signIn, signOut } from "../../auth";

export async function googleLoginAction() {
  await signIn("google");
}

export async function logoutAction() {
  await signOut();
}
