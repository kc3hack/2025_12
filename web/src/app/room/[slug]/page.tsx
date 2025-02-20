"use client";

import style from "@routes/chat/index.module.scss";

import { Footer } from "@/features/routes/chat/footer";
import { MessageContainer, ReplyMessage } from "@/features/routes/chat/message-container";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { wsAtom } from "@/features/websocket/store";
import { useAuth } from "@clerk/nextjs";
import { EventFromClient } from "@/types/EventFromClient";

const Room = () => {
  const { getToken } = useAuth();
  const latestMessagePositionRef = useRef<HTMLDivElement>(null);
  const replyingToRef = useRef<HTMLDivElement | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<ReplyMessage | null>(null);
  const bottomInputRef = useRef<HTMLTextAreaElement>(null);
  const [roomId] = useState("");

  const [ws] = useAtom(wsAtom);

  useEffect(() => {
    ws?.addEventListener("open", async () => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const event: EventFromClient = {
        type: "JoinRoom",
        token: token
      };

      ws.send(JSON.stringify(event));
    });

    return () => {
      ws?.close();
    };
  }, [ws, getToken]);

  return (
    <div className={style.home_page}>
      <p>{roomId ? roomId : "joining room..."}</p>
      <MessageContainer
        bottomInputRef={bottomInputRef}
        latestMessagePositionRef={latestMessagePositionRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
      <Footer
        bottomInputRef={bottomInputRef}
        latestMessagePositionRef={latestMessagePositionRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
    </div>
  );
};

export default Room;
