"use client";
import { Footer } from "@/features/routes/chat/footer";
import style from "@routes/chat/index.module.scss";
import { MessageContainer } from "@routes/chat/message-container";
import { useRef, useState } from "react";

const Home = () => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyingToRef = useRef<HTMLDivElement | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingAuther, setReplyingAuther] = useState<string | null>(null);

  return (
    <div className={style.home_page}>
      <MessageContainer
        bottomRef={bottomRef}
        replyingToRef={replyingToRef}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        setReplyingAuther={setReplyingAuther}
      />
      <Footer
        bottomRef={bottomRef}
        replyingToRef={replyingToRef}
        replyingTo={replyingTo}
        replyingAuther={replyingAuther}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
};
export default Home;
