"use client";
import { Footer } from "@/features/routes/chat/footer";
import style from "@routes/chat/index.module.scss";
import { MessageContainer } from "@routes/chat/message-container";
import { useRef } from "react";

const Home = () => {
	const bottomRef = useRef<HTMLDivElement>(null);
	return (
		<div className={style.home_page}>
			<MessageContainer bottomRef={bottomRef} />
			<Footer bottomRef={bottomRef} />
		</div>
	);
};
export default Home;
