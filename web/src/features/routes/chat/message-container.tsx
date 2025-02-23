"use client";
import style from "./messagecontainer.module.scss";
import { useEffect, useRef, type RefObject } from "react";
import { MessageCell } from "./message";
import { messagesAtom } from "@/features/message/store";
import { useAtom } from "jotai";
import { wsAtom } from "@/features/websocket/store";
import { EventFromServer } from "@/types/EventFromServer";
import { Message } from "@/features/message/type";
import { userAtom } from "@/features/account/store";
import { redirect } from "next/navigation";

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
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWebSocketMessage = (e: MessageEvent) => {
      if (!messageContainerRef.current) {
        return;
      }

      const msg: EventFromServer = JSON.parse(e.data);

      const calcBottom =
        messageContainerRef.current.scrollHeight -
        messageContainerRef.current.scrollTop -
        messageContainerRef.current.clientHeight;
      const isBottom = Math.abs(calcBottom) < 200; // TODO: 数値はいい感じに変えといて

      if (msg.type === "FailedToJoinRoom") {
        if (msg.reason.type === "NotParticipated") {
          redirect(`/room/${msg.reason.room_id}/invite`);
          // TODO: Redirect Invite page
        }
      }

      if (msg.type === "Message") {
        const newMessage: Message = {
          id: msg.id,
          author_id: msg.author_id,
          author_name: msg.author_name,
          content: msg.content,
          is_me: msg.author_id === user?.id,
          author_image_url: msg.author_image_url,
          reply_to_id: msg.reply_to_id,
          reactions: null
        };
        setTimeout(() => {
          if (msg.author_id === user?.id || isBottom) {
            props.latestMessagePositionRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }, 10);

        setMessages([...messages, newMessage]);
      } else if (msg.type === "SyncMessage") {
        const newMessages = msg.messages
          .map(m => {
            return {
              id: m.id,
              author_id: m.author_id,
              author_name: m.author_name,
              author_image_url: m.author_image_url,
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
    };
    ws?.addEventListener("message", handleWebSocketMessage);

    ws?.addEventListener("close", () => {
      setMessages([]);
    });

    return () => {
      ws?.removeEventListener("message", handleWebSocketMessage);
    };
  }, [ws, setMessages, messages, props.latestMessagePositionRef.current?.scrollIntoView, user?.id]);

  return (
    <div className={style.message_container} ref={messageContainerRef}>
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
