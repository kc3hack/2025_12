"use client";
import { type RefObject } from "react";
import style from "./footer.module.scss";
import { ReplyMessage } from "./message-container";
import { BottomInput } from "./bottom-input";
import { BottomReplyButton } from "./bottom-reply-button";
import { BottomKansaiTranslateArea } from "./bottom-kansai-translate-area";

type Props = {
  inputMessage: string | null;
  setInputMessage: (inputMessage: string | null) => void;
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
      {props.inputMessage && <BottomKansaiTranslateArea inputMessage={props.inputMessage} />}
      <BottomInput
        setInputMessage={props.setInputMessage}
        bottomInputRef={props.bottomInputRef}
        latestMessagePositionRef={props.latestMessagePositionRef}
        replyingMessage={props.replyingMessage}
        setReplyingMessage={props.setReplyingMessage}
      />
    </div>
  );
};
