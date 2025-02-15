"use client";
import { Footer } from "@/features/routes/root/footer";
import style from "@routes/root/index.module.scss";
import { MessageContainer } from "@routes/root/message-container";
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
