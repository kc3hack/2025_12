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
import { memo, type RefObject, useEffect, useState } from "react";
import { ReplyMessage } from "./message-container";
import { wsAtom } from "@/features/websocket/store";

type Props = {
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const BottomInput = memo((props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);
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

  useEffect(() => {
    ws?.addEventListener("message", e => {
      const msg = JSON.parse(e.data).Message;
      if (!msg) {
        return;
      }

      const newMessage: Message = {
        id: uuidv4(),
        author: msg.author_name,
        content: msg.content,
        is_me: true,
        icon: null,
        reply_to_id: null,
        reactions: null
      };
      setMessages([...messages, newMessage]);
    });
  }, [ws, messages, setMessages]);

  const handleSubmit = () => {
    if (!props.bottomInputRef.current) {
      return;
    }

    if (props.bottomInputRef.current.value === "") {
      return;
    }

    const message = {
      type: "Message",
      author_id: "user_2tFy1XzEZZPKKDK3QTAA224wAO9",
      author_name: "asdfasdf",
      content: props.bottomInputRef.current.value
    };

    ws?.send(JSON.stringify(message));

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
