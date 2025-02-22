import { useEffect, useLayoutEffect, useRef, useState } from "react";
import style from "./index.module.scss";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/apiClient";

export type MiniChatMessageType = {
  id: string;
  is_me: boolean;
  author_name: string;
  author_avatar_url: string;
  message: string;
};

const Chat = (miniChat: MiniChatMessageType) => {
  return (
    <div className={style.mini_chat} data-is-me={miniChat.is_me}>
      <p className={style.name}>{miniChat.author_name}</p>
      <p className={style.message}>{miniChat.message}</p>
    </div>
  );
};

export const MiniChat = ({ room_id }: { room_id: string }) => {
  const { getToken } = useAuth();
  const [mesasges, setMessages] = useState<MiniChatMessageType[]>([]);

  useEffect(() => {
    getToken().then(async token => {
      const fetched_messages = await apiClient.get_room_messages({
        params: { room_id: room_id },
        queries: { limit: 10 },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const minichat_messages: MiniChatMessageType[] = fetched_messages
        .map(message => {
          return {
            id: message.id,
            is_me: false,
            author_name: "",
            author_avatar_url: "",
            message: message.content
          };
        })
        .reverse();

      setMessages(minichat_messages);
    });
  }, [room_id, getToken]);

  const bottomPositionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    bottomPositionRef.current?.scrollIntoView();
  });

  return (
    <div className={style.mini_chat_container}>
      {mesasges.map(message => (
        <Chat key={message.id} {...message} />
      ))}
      <div ref={bottomPositionRef} />
    </div>
  );
};
