"use client";
import style from "./messagecontainer.module.scss";
import { useEffect, type RefObject } from "react";
import { MessageCell } from "./message";
import { messagesAtom } from "@/features/message/store";
import { useAtom } from "jotai";
import { wsAtom } from "@/features/websocket/store";
import { EventFromServer } from "@/types/EventFromServer";
import { Message } from "@/features/message/type";
import { userAtom } from "@/features/account/store";

export type ReplyMessage = {
  id: string;
  author_name: string | null;
  content: string;
};

type Props = {
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const MessageContainer = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [ws] = useAtom(wsAtom);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    ws?.addEventListener("message", e => {
      const msg: EventFromServer = JSON.parse(e.data);

      if (msg.type === "Message") {
        const newMessage: Message = {
          id: msg.id,
          author_id: msg.author_id,
          author_name: msg.author_name,
          content: msg.content,
          is_me: true,
          icon: null,
          reply_to_id: msg.reply_to_id,
          reactions: null
        };
        setMessages([...messages, newMessage]);
      } else if (msg.type === "SyncMessage") {
        const newMessages = msg.messages
          .map(m => {
            return {
              id: m.id,
              author_id: m.author_id,
              author_name: m.author_name,
              content: m.content,
              is_me: m.author_id === user?.id,
              icon: null,
              reply_to_id: m.reply_to_id,
              reactions: null
            } as Message;
          })
          .reverse();
        setMessages(newMessages);
      }
    });

    ws?.addEventListener("close", () => {
      setMessages([]);
    });
  }, [ws, messages, setMessages, user]);

  return (
    <div className={style.message_container}>
      {messages.map(message => (
        <MessageCell
          key={message.id}
          message={message}
          latestMessagePositionRef={props.latestMessagePositionRef}
          replyingToRef={props.replyingToRef}
          replyingMessage={props.replyingMessage}
          bottomInputRef={props.bottomInputRef}
          setReplyingMessage={props.setReplyingMessage}
        />
      ))}
      <div ref={props.latestMessagePositionRef} />
    </div>
  );
};
