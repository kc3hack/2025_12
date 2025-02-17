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
  const [messages, setMessages] = useAtom(messagesAtom);

  const deleteMessage = (id: string) => {
    if (id === props.replyingMessage?.id) {
      props.setReplyingMessage(null);
    }
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (id: string, author: string, content: string) => {
    const message: ReplyMessage = {
      id: id,
      author_name: author,
      content: content
    };

    props.setReplyingMessage(message);
  };

  const scrollToMessage = (id: string | undefined) => {
    const element = document.getElementById(`message-${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  };

  return (
    <div className={style.message_container}>
      {messages.map(message => (
        <div
          key={message.id}
          id={`message-${message.id}`}
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
                {message.reply_to_id && (
                  <button
                    className={style.message_reply_area}
                    type="button"
                    onClick={() => scrollToMessage(message.reply_to_id)}
                  >
                    {
                      messages.find(replyMessage => replyMessage.id === message.reply_to_id)
                        ?.content
                    }
                  </button>
                )}
                <p>{message.content}</p>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => deleteMessage(message.id)}>削除</ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleReply(message.id, message.author, message.content)}
              >
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
