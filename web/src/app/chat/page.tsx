"use client";
import { Footer } from "@/features/routes/chat/footer";
import style from "@routes/chat/index.module.scss";
import { MessageContainer } from "@routes/chat/message-container";
import { useRef, useState } from "react";

const Home = () => {
	const bottomRef = useRef<HTMLDivElement>(null);
	const [replyingTo, setReplyingTo] = useState<string | null>(null);

	return (
		<div className={style.home_page}>
			<MessageContainer
				bottomRef={bottomRef}
				replyingTo={replyingTo}
				setReplyingTo={setReplyingTo}
			/>
			<Footer bottomRef={bottomRef} replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
		</div>
	);
};
export default Home;
