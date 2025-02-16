import { atom } from "jotai";
import type { Message } from "./type";

export const messagesAtom = atom<Message[]>([]);
