"use client";

import { useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { userAtom } from "@/features/account/store";
import { useAtom } from "jotai";
import { useAuth } from "@clerk/nextjs";

export const UserInitialyzer = () => {
  const { getToken } = useAuth();
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    getToken().then(async token => {
      if (!token) {
        return;
      }

      const me = await apiClient.get_user_me({
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser({ id: me.id });
    });
  }, [getToken, setUser]);
  return null;
};
