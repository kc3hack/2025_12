"use client";

import style from "./footer.module.scss";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useAtom } from "jotai";
import { memo, type RefObject, useState } from "react";
import { ReplyMessage } from "./message-container";
import { wsAtom } from "@/features/websocket/store";
import { EventFromClient } from "@/types/EventFromClient";

type Props = {
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const BottomInput = memo((props: Props) => {
  const [isComposing, setIsComposing] = useState(false);

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

    if (props.bottomInputRef.current.value === "") {
      return;
    }

    const event: EventFromClient = {
      type: "UserMessage",
      author_name: "sample user",
      author_avatar_url: "",
      content: props.bottomInputRef.current.value,
      reply_to_id: null
    };

    ws?.send(JSON.stringify(event));

    props.bottomInputRef.current.value = "";
  };

  return (
    <div className={style.input_area}>
      <Textarea
        className={style.text_area}
        data-replying-message={props.replyingMessage}
        placeholder="Type your message here."
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        ref={props.bottomInputRef}
      />
      <Button onClick={handleSubmit} className={style.send_button}>
        <SendHorizontal />
      </Button>
    </div>
  );
});
