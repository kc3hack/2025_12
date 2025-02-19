"use client";
import { Footer } from "@/features/routes/chat/footer";
import style from "@routes/chat/index.module.scss";
import { MessageContainer, ReplyMessage } from "@routes/chat/message-container";
import { useRef, useState } from "react";

const Home = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyingToRef = useRef<HTMLDivElement | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<ReplyMessage | null>(null);

  return (
    <div className={style.home_page}>
      <MessageContainer
        bottomRef={bottomRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
      <Footer
        bottomRef={bottomRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
    </div>
  );
};
export default Home;
