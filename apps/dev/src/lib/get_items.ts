"use server";

import { db } from "@kyosan-map/db";

export async function getItems() {
  return db.query.items.findMany();
}