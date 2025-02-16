"use client";
import type { RefObject } from "react";
import { messagesAtom } from "../../message/store";
import { useAtom } from "jotai";
import style from "./messagecontainer.module.scss";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = { bottomRef: RefObject<HTMLDivElement | null> };

export const MessageContainer = (props: Props) => {
  const [messages] = useAtom(messagesAtom);
  return (
    <div className={style.message_container}>
      {messages.map(message => (
        <div
          key={message.id}
          className={`${style.message_wrapper} ${message.is_me && style.is_me}`}
        >
          {!message.is_me && (
            <Avatar className={style.avatar}>
              <AvatarImage src={message.icon} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          )}
          <div className={style.message}>
            <p>{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
};
