"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import style from "./footer.module.scss";
import { useAtom } from "jotai";
import { SendHorizontal } from "lucide-react";
import { type RefObject, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { messagesAtom } from "@/features/message/store";
import type { Message } from "@/features/message/type";
import { ReplyMessage } from "./message-container";

type Props = {
  bottomRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const Footer = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = () => {
    if (!inputRef.current) {
      return;
    }

    if (inputRef.current.value === "") {
      return;
    }

    const newMessage: Message = {
      id: uuidv4(),
      author: "小生",
      content: inputRef.current.value,
      is_me: true,
      icon: null, //自分のアイコンに変更して
      reply_to_id: props.replyingMessage ? props.replyingMessage.id : null
    };

    inputRef.current.value = "";
    setTimeout(() => {
      props.bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    const yesMessage: Message = {
      id: uuidv4(),
      author: "50%yesman",
      content: Math.random() < 0.5 ? "はい" : "いいえ",
      is_me: false,
      icon: "https://github.com/shadcn.png",
      reply_to_id: null
    };

    props.setReplyingMessage(null);

    setMessages([...messages, newMessage, yesMessage]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.shiftKey) {
      return;
    }

    if (event.key === "Enter" && !isComposing) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const scrollReply = () => {
    props.replyingToRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className={style.footer}>
      {props.replyingMessage && (
        <div>
          <button type="button" className={style.reply_bar} onClick={() => scrollReply()}>
            <p>{props.replyingMessage.author_name}に返信</p>
          </button>
          <button
            type="button"
            className={style.cancel}
            onClick={() => props.setReplyingMessage(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className={style.input_area}>
        <Textarea
          className={style.text_area}
          data-replyingMessage={props.replyingMessage}
          placeholder="Type your message here."
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          ref={inputRef}
        />
        <Button onClick={handleSubmit} className={style.send_button}>
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );
};
