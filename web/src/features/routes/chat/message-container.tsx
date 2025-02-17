"use client";
import { type RefObject } from "react";
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

type ReplyMessage = {
  id: string;
  author_name: string;
};

type Props = {
  bottomRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const MessageContainer = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);

  const deleteMessage = (id: string) => {
    if (id === props.replyingMessage?.id) {
      props.setReplyingMessage(null);
    }
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (id: string, author: string) => {
    const message: ReplyMessage = {
      id: id,
      author_name: author
    };

    props.setReplyingMessage(message);
  };

  return (
    <div className={style.message_container}>
      {messages.map(message => (
        <div
          key={message.id}
          ref={props.replyingMessage?.id === message.id ? props.replyingToRef : null}
          className={`${style.message_wrapper} ${message.is_me && style.is_me} ${
            props.replyingMessage?.id === message.id && style.replying
          }`}
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
              <ContextMenuItem onClick={() => handleReply(message.id, message.author)}>
                返信
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ))}
      <div ref={props.bottomRef} />
    </div>
  );
};
