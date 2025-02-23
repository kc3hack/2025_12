import { useAtom } from "jotai";
import style from "./message-page-header.module.scss";
import { useEffect, useState } from "react";
import { wsAtom } from "@/features/websocket/store";
import { EventFromServer } from "@/types/EventFromServer";

export const MessagePageHeader = () => {
  const [ws] = useAtom(wsAtom);
  const [roomName, setRoomName] = useState<string | null>(null);

  useEffect(() => {
    const handleWebSocketMessage = (e: MessageEvent) => {
      const msg: EventFromServer = JSON.parse(e.data);

      if (msg.type === "JoinedRoom") {
        setRoomName(msg.name);
      }
    };
    ws?.addEventListener("message", handleWebSocketMessage);

    return () => {
      ws?.removeEventListener("message", handleWebSocketMessage);
    };
  }, [ws]);

  return (
    <div className={style.header_inner}>
      <div className={style.logo}>
        <p>{roomName}</p>
      </div>
    </div>
  );
};
