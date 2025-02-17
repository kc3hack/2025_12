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

type Props = {
  bottomRef: RefObject<HTMLDivElement | null>;
  replyingTo: string | null;
  replyingToRef: RefObject<HTMLDivElement | null>;
  setReplyingTo: (id: string | null) => void;
  setReplyingAuther: (id: string | null) => void;
};

const isReplyingTo = (replyingTo: string | null, messageId: string): boolean => {
  return replyingTo === messageId;
};

export const MessageContainer = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);

  const deleteMessage = (id: string) => {
    if (id === props.replyingTo) {
      props.setReplyingTo(null);
    }
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (id: string, auther: string) => {
    props.setReplyingTo(id);
    props.setReplyingAuther(auther);
  };

  return (
    <div className={style.message_container}>
      {messages.map(message => {
        const shouldApplyRef = isReplyingTo(props.replyingTo, message.id);
        return (
          <div
            key={message.id}
            ref={shouldApplyRef ? props.replyingToRef : null}
            className={`${style.message_wrapper} ${message.is_me && style.is_me} ${
              shouldApplyRef ? style.replying : ""
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
        );
      })}
      <div ref={props.bottomRef} />
    </div>
  );
};
