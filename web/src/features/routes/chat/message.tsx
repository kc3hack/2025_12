"use client";
import { type RefObject } from "react";
import { messagesAtom } from "../../message/store";
import { useAtom } from "jotai";
import style from "./messagecontainer.module.scss";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/features/message/type";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { ReplyMessage } from "./message-container";
import { Reply } from "./reply";

type Props = {
  message: Message;
  bottomRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const MessageCell = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);

  const deleteMessage = (id: string) => {
    if (id === props.replyingMessage?.id) {
      props.setReplyingMessage(null);
    }
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (id: string, author: string, content: string) => {
    const replyMessage: ReplyMessage = {
      id: id,
      author_name: author,
      content: content
    };

    props.setReplyingMessage(replyMessage);
  };

  return (
    <div
      id={`message-${props.message.id}`}
      ref={props.replyingMessage?.id === props.message.id ? props.replyingToRef : null}
      className={style.message_wrapper}
      data-is-me={props.message.is_me}
      data-is-replying={props.replyingMessage?.id === props.message.id}
    >
      {!props.message.is_me && props.message.icon && (
        <Avatar className={style.avatar}>
          <AvatarImage src={props.message.icon} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}

      <ContextMenu>
        <ContextMenuTrigger>
          <Reply message={props.message} />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => deleteMessage(props.message.id)}>削除</ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              handleReply(props.message.id, props.message.author, props.message.content)
            }
          >
            返信
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};
