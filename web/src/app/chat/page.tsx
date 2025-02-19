"use client";
import { Footer } from "@/features/routes/chat/footer";
import style from "@routes/chat/index.module.scss";
import { MessageContainer, ReplyMessage } from "@routes/chat/message-container";
import { useRef, useState } from "react";

const Home = () => {
  const latestMessagePositionRef = useRef<HTMLDivElement>(null);
  const replyingToRef = useRef<HTMLDivElement | null>(null);
  const [replyingMessage, setReplyingMessage] = useState<ReplyMessage | null>(null);
  const bottomInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={style.home_page}>
      <MessageContainer
        bottomInputRef={bottomInputRef}
        latestMessagePositionRef={latestMessagePositionRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
      <Footer
        bottomInputRef={bottomInputRef}
        latestMessagePositionRef={latestMessagePositionRef}
        replyingToRef={replyingToRef}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />
    </div>
  );
};
export default Home;
