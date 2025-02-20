import { useEffect, useLayoutEffect, useRef } from "react";
import style from "./index.module.scss";

export type MiniChatType = {
  id: string;
  is_me: boolean;
  author_name: string;
  author_avatar_url: string;
  message: string;
};

const samples: MiniChatType[] = [
  {
    id: "1",
    is_me: false,
    author_name: "John Doe",
    author_avatar_url: "https://example.com/avatar1.jpg",
    message: "Hello, this is a sample message."
  },
  {
    id: "2",
    is_me: false,
    author_name: "Jane Smith",
    author_avatar_url: "https://example.com/avatar2.jpg",
    message: "Hi there! This is another sample message."
  },
  {
    id: "3",
    is_me: true,
    author_name: "Alice Johnson",
    author_avatar_url: "https://example.com/avatar3.jpg",
    message: "Hey! How are you?"
  },
  {
    id: "4",
    is_me: false,
    author_name: "Bob Brown",
    author_avatar_url: "https://example.com/avatar4.jpg",
    message: "I'm good, thanks! How about you?"
  },
  {
    id: "5",
    is_me: true,
    author_name: "Alice Johnson",
    author_avatar_url: "https://example.com/avatar3.jpg",
    message: "I'm doing well, thank you!"
  },
  {
    id: "6",
    is_me: false,
    author_name: "Jane Smith",
    author_avatar_url: "https://example.com/avatar2.jpg",
    message: "That's great to hear!"
  }
];

const Chat = (miniChat: MiniChatType) => {
  return (
    <div className={style.mini_chat} data-is-me={miniChat.is_me}>
      <p className={style.name}>{miniChat.author_name}</p>
      <p className={style.message}>{miniChat.message}</p>
    </div>
  );
};

export const MiniChat = () => {
  const bottomPositionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    bottomPositionRef.current?.scrollIntoView();
  });

  return (
    <div className={style.mini_chat_container}>
      {samples.map(item => (
        <Chat key={item.id} {...item} />
      ))}
      <div ref={bottomPositionRef} />
    </div>
  );
};
