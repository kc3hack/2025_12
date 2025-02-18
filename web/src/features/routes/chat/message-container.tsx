"use client";
import style from "./messagecontainer.module.scss";
import { type RefObject } from "react";
import { MessageCell } from "./message";
import { messagesAtom } from "@/features/message/store";
import { useAtom } from "jotai";

export type ReplyMessage = {
  id: string;
  author_name: string;
  content: string;
};

type Props = {
  bottomRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const MessageContainer = (props: Props) => {
  const [messages] = useAtom(messagesAtom);

  return (
    <div className={style.message_container}>
      {messages.map(message => (
        <MessageCell
          key={message.id}
          message={message}
          bottomRef={props.bottomRef}
          replyingToRef={props.replyingToRef}
          replyingMessage={props.replyingMessage}
          setReplyingMessage={props.setReplyingMessage}
        />
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
};
