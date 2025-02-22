"use client";

import style from "./footer.module.scss";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Message } from "@/features/message/type";
import { messagesAtom } from "@/features/message/store";
import { useAtom } from "jotai";
import { memo, type RefObject, useEffect, useState } from "react";
import { ReplyMessage } from "./message-container";
import { wsAtom } from "@/features/websocket/store";
import { EventFromServer } from "@/types/EventFromServer";
import { EventFromClient } from "@/types/EventFromClient";
import { userAtom } from "@/features/account/store";

type Props = {
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  setInputMessage: (inputMessage: string | null) => void;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const BottomInput = memo((props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);
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

  useEffect(() => {
    ws?.addEventListener("message", e => {
      const msg: EventFromServer = JSON.parse(e.data);

      if (msg.type !== "Message") {
        return;
      }

      const newMessage: Message = {
        id: uuidv4(),
        author: msg.author_name,
        content: msg.content,
        is_me: msg.author_id === user?.id,
        icon: null,
        reply_to_id: null,
        reactions: null
      };
      setMessages([...messages, newMessage]);
    });
  }, [ws, messages, setMessages, user]);

  const handleSubmit = () => {
    if (!props.bottomInputRef.current) {
      return;
    }

    if (props.bottomInputRef.current.value === "") {
      return;
    }

    if (!user) {
      return;
    }

    const event: EventFromClient = {
      type: "UserMessage",
      author_id: user.id,
      author_name: "sample user",
      author_avatar_url: "",
      content: props.bottomInputRef.current.value,
      reply_to_id: null
    };

    ws?.send(JSON.stringify(event));

    props.bottomInputRef.current.value = "";
  };

  const changeInput = (inputMessage: string) => props.setInputMessage(inputMessage);

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
