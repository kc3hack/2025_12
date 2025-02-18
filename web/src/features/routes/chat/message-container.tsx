"use client";
import { type RefObject } from "react";
import { Message } from "./message";

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
  return (
    <Message
      bottomRef={props.bottomRef}
      replyingToRef={props.replyingToRef}
      replyingMessage={props.replyingMessage}
      setReplyingMessage={props.setReplyingMessage}
    />
  );
};
