"use client";
import { Chat } from "@/features/routes/home/chat";
import { Icon } from "@/features/routes/home/icon";
import { Searchinput } from "@/features/routes/home/search";

const home = () => {
  return (
    <div>
      <Icon />
      <Searchinput />
      <Chat />
    </div>
  );
};
export default home;
