"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import style from "@routes/root/footer.module.scss";
import { useAtom } from "jotai";
import { SendHorizontal } from "lucide-react";
import { type RefObject, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { messagesAtom } from "../../message/store";
import type { Message } from "../../message/type";

type Props = { bottomRef: RefObject<HTMLDivElement | null> };

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
      author: "me",
      content: inputRef.current.value,
      is_me: true,
      icon: "https://github.com/shadcn.png"
    };
    inputRef.current.value = "";
    setTimeout(() => {
      props.bottomRef.current?.scrollIntoView();
    }, 0);
    const yesMessage: Message = {
      id: uuidv4(),
      author: "bot",
      content: Math.random() < 0.5 ? "はい" : "いいえ",
      is_me: false,
      icon: "https://github.com/shadcn.png"
    };
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
  return (
    <div className={style.footer}>
      <Textarea
        className={style.text_area}
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
  );
};
