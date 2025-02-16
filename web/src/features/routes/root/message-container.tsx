"use client";
import type { RefObject } from "react";
import { messagesAtom } from "../../message/store";
import { useAtom } from "jotai";
import style from "./messagecontainer.module.scss";

type Props = { bottomRef: RefObject<HTMLDivElement | null> };

export const MessageContainer = (props: Props) => {
  const [messages] = useAtom(messagesAtom);
  return (
    <div className={style.message_container}>
      {messages.map(message => (
        <div key={message.id} className={`${style.message} ${message.is_me && style.is_me}`}>
          <p>{message.content}</p>
        </div>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
};
