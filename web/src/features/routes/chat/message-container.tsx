"use client";
import type { RefObject } from "react";
import { messagesAtom } from "../../message/store";
import { useAtom } from "jotai";
import style from "./messagecontainer.module.scss";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";

type Props = { bottomRef: RefObject<HTMLDivElement | null> };

export const MessageContainer = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom); // setMessagesを追加

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(message => message.id !== id));
  };

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

          <ContextMenu>
            <ContextMenuTrigger>
              <div className={style.message}>
                <p>{message.content}</p>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => deleteMessage(message.id)}>削除</ContextMenuItem>
              <ContextMenuItem>返信</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
};
