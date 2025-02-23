"use client";

import style from "@routes/chat/index.module.scss";

import { Footer } from "@/features/routes/chat/footer";
import { MessageContainer, ReplyMessage } from "@/features/routes/chat/message-container";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { wsAtom } from "@/features/websocket/store";
import { useAuth } from "@clerk/nextjs";
import { EventFromClient } from "@/types/EventFromClient";
import { MessagePageHeader } from "@/features/routes/chat/message-page-header";

const Room = () => {
  const { getToken } = useAuth();
  const latestMessagePositionRef = useRef<HTMLDivElement>(null);
  const replyingToRef = useRef<HTMLDivElement | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<ReplyMessage | null>(null);
  const bottomInputRef = useRef<HTMLTextAreaElement>(null);
  const [inputMessage, setInputMessage] = useState<string | null>(null);

  const [ws] = useAtom(wsAtom);

  useEffect(() => {
    ws?.addEventListener("open", async () => {
      const token = await getToken();
      if (!token) {
        return;
      }

      const join_event: EventFromClient = {
        type: "JoinRoom",
        token: token
      };
      ws.send(JSON.stringify(join_event));

      const request_sync_message_event: EventFromClient = {
        type: "RequestSyncMessage",
        limit: 30
      };
      ws.send(JSON.stringify(request_sync_message_event));
    });

    return () => {
      ws?.close();
    };
  }, [ws, getToken]);

  return (
    <div className={style.room_page}>
      <MessagePageHeader />
      <MessageContainer
        bottomInputRef={bottomInputRef}
        latestMessagePositionRef={latestMessagePositionRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
      <Footer
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
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
