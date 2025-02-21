import { atom } from "jotai";
import type { UserType } from "./type";
import { apiClient } from "@/lib/apiClient";

export const userAtom = atom<UserType>();

userAtom.onMount = setState => async () => {
  const me = await apiClient.get_user_me();
  setState({ id: me.id });
};
