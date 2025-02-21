"use client";
import { Chat } from "@/features/routes/home/chat";
import { Icon } from "@/features/routes/home/icon";
import { Searchinput } from "@/features/routes/home/search";
import { useState } from "react";

type ChatType = { name: string };
const groupData = [
  { name: "a" },
  { name: "b" },
  { name: "p" },
  { name: "g" },
  { name: "n" },
  { name: "t" },
  { name: "d" },
  { name: "m" },
  { name: "21" },
  { name: "1" },
  { name: "2" },
  { name: "12" }
];

const home = () => {
  const [display, setDisplay] = useState<ChatType[]>(groupData);
  const [order, setOrder] = useState<string>("creation");
  const [search, setSearch] = useState<string>("");

  const updateDisplay = (order: string, search: string) => {
    const displayOrdered = groupData.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    let newDisplay = displayOrdered;
    if (order === "name_up") {
      newDisplay = [...displayOrdered].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (order === "name_down") {
      newDisplay = [...displayOrdered].sort((a, b) => b.name.localeCompare(a.name));
    }
    if (order === "creation") {
      newDisplay = [...displayOrdered];
    }
    setDisplay(newDisplay);
  };

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder);
    updateDisplay(newOrder, search);
  };
  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    updateDisplay(order, newSearch);
  };
  return (
    <div>
      <Icon />
      <Searchinput handleOrderChange={handleOrderChange} handleSearch={handleSearch} />
      <Chat items={display} />
    </div>
  );
};
export default home;
