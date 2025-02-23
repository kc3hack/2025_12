"use client";

import style from "./footer.module.scss";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { userAtom } from "@/features/account/store";
import { wsAtom } from "@/features/websocket/store";
import { EventFromClient } from "@/types/EventFromClient";
import { useAtom } from "jotai";
import { SendHorizontal } from "lucide-react";
import type { KeyboardEvent } from "react";
import { type RefObject, memo, useEffect, useState } from "react";
import { ReplyMessage } from "./message-container";

type Props = {
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  translatedMessage: string;
  setTranslatedMessage: (state: string) => void;
  setInputMessage: (inputMessage: string | null) => void;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

const TRANSLATE_INTERVAL_MS = 1000;

export const BottomInput = memo((props: Props) => {
  const [isComposing, setIsComposing] = useState(false);
  const [user] = useAtom(userAtom);
  const [ws] = useAtom(wsAtom);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.shiftKey) {
      return;
    }

    if (event.key === "Enter" && !isComposing) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!props.bottomInputRef.current) {
      return;
    }
    if (props.translatedMessage === "") {
      return;
    }

    if (!user) {
      return;
    }

    const event: EventFromClient = {
      type: "UserMessage",
      content: props.translatedMessage,
      reply_to_id: props.replyingMessage?.id ?? null
    };

    ws?.send(JSON.stringify(event));

    props.setReplyingMessage(null);
    props.bottomInputRef.current.value = "";
    props.setInputMessage(null);
  };

  const changeInput = (inputMessage: string) => {
    props.setTranslatedMessage("");
    props.setInputMessage(inputMessage);
  };

  useEffect(() => {
    let buffer = "";

    const intervalId = setInterval(() => {
      const current_text = props.bottomInputRef.current?.value;

      if (props.bottomInputRef.current && current_text !== "" && current_text !== buffer) {
        const currentInput = props.bottomInputRef.current.value;
        const event: EventFromClient = {
          type: "RequestTranslateMessage",
          message: currentInput
        };
        ws?.send(JSON.stringify(event));

        buffer = current_text ?? "";
      }
    }, TRANSLATE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [ws, props.bottomInputRef]);

  return (
    <div className={style.input_area}>
      <Textarea
        className={style.text_area}
        data-replying-message={props.replyingMessage}
        placeholder="Type your message here."
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onChange={e => changeInput(e.target.value)}
        ref={props.bottomInputRef}
      />
      <Button onClick={handleSubmit} className={style.send_button}>
        <SendHorizontal />
      </Button>
    </div>
  );
});
