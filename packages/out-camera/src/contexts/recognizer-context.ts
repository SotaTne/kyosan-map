"use client";

import { createContext } from "react";
import { Recognizer } from "../lib/recognizer.js";

export const ImageRecognizerContext = createContext<Recognizer | null>(null);
