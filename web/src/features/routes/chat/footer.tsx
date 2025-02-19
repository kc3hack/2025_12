"use client";
import { type RefObject } from "react";
import style from "./footer.module.scss";
import { ReplyMessage } from "./message-container";
import { BottomInput } from "./bottom-input";
import { BottomReplyButton } from "./bottom-reply-button";

type Props = {
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const Footer = (props: Props) => {
  return (
    <div className={style.footer}>
      {props.replyingMessage && (
        <BottomReplyButton
          replyingToRef={props.replyingToRef}
          replyingMessage={props.replyingMessage}
          setReplyingMessage={props.setReplyingMessage}
        />
      )}
      <BottomInput
        bottomInputRef={props.bottomInputRef}
        latestMessagePositionRef={props.latestMessagePositionRef}
        replyingMessage={props.replyingMessage}
        setReplyingMessage={props.setReplyingMessage}
      />
    </div>
  );
};
