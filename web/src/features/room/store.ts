import { atom } from "jotai";
import type { RoomType } from "./type";

export const roomsAtom = atom<RoomType[]>([]);
