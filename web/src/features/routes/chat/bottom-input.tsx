"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import style from "./footer.module.scss";
import type { KeyboardEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/features/message/type";
import { messagesAtom } from "@/features/message/store";
import { useAtom } from "jotai";
import { memo, type RefObject, useState } from "react";
import { ReplyMessage } from "./message-container";

type Props = {
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const BottomInput = memo((props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isComposing, setIsComposing] = useState(false);

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

    const newMessage: Message = {
      id: uuidv4(),
      author: "小生",
      content: props.bottomInputRef.current.value,
      is_me: true,
      icon: null, //自分のアイコンに変更して
      reply_to_id: props.replyingMessage ? props.replyingMessage.id : null
    };

    props.bottomInputRef.current.value = "";
    setTimeout(() => {
      props.latestMessagePositionRef.current?.scrollIntoView({ behavior: "smooth" });
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
