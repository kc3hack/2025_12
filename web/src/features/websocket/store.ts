import { atom } from "jotai";

export const wsAtom = atom<WebSocket | null>(null);

const get_id_from_url = () => {
  const path = window.location.pathname;
  const pathParts = path.split("/");
  const idWithBracket = pathParts[pathParts.length - 1];
  const id = idWithBracket.replace("[", "").replace("]", "");
  return id;
};

wsAtom.onMount = setState => {
  const ws = new WebSocket(
    `ws://${process.env.NEXT_PUBLIC_BACKEND_URL}/websocket/${get_id_from_url()}`
  );

  ws.onopen = async () => {
    console.debug("WebSocket connection opened");
  };

  ws.onclose = () => {
    console.debug("WebSocket connection closed");
  };

  ws.onerror = error => {
    console.debug("WebSocket error:", error);
  };

  setState(ws);

  return () => {
    ws.close();
  };
};
