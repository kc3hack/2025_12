"use client"
import { Chat } from "@/features/routes/home/groups";
import { Friends } from "@/features/routes/home/header";
import {  Searchinput } from "@/features/routes/home/search";

const home = () => {
  return (
    <div>
      <Friends />
      <Searchinput/>
      <Chat />
    </div>
  );
};
export default home;
