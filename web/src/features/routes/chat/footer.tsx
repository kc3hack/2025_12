"use client";
import { useState, type RefObject } from "react";
import { BottomInput } from "./bottom-input";
import { BottomKansaiTranslateArea } from "./bottom-kansai-translate-area";
import { BottomReplyButton } from "./bottom-reply-button";
import style from "./footer.module.scss";
import { ReplyMessage } from "./message-container";

type Props = {
  inputMessage: string | null;
  setInputMessage: (inputMessage: string | null) => void;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const Footer = (props: Props) => {
  const [translatedMessage, setTranslatedMesasge] = useState("");

  return (
    <div className={style.footer}>
      {props.replyingMessage && (
        <BottomReplyButton
          replyingToRef={props.replyingToRef}
          replyingMessage={props.replyingMessage}
          setReplyingMessage={props.setReplyingMessage}
        />
      )}
      {props.inputMessage && (
        <BottomKansaiTranslateArea
          translatedMessage={translatedMessage}
          setTranslatedMessage={setTranslatedMesasge}
          isReplyingNow={!!props.replyingMessage}
        />
      )}
      <BottomInput
        setInputMessage={props.setInputMessage}
        bottomInputRef={props.bottomInputRef}
        replyingMessage={props.replyingMessage}
        setReplyingMessage={props.setReplyingMessage}
        setTranslatedMessage={setTranslatedMesasge}
        translatedMessage={translatedMessage}
      />
    </div>
  );
};
