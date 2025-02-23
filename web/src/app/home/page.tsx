"use client";

import style from "@routes/home/index.module.scss";

import { roomsAtom } from "@/features/room/store";
import { RoomType } from "@/features/room/type";
import { RoomContainer } from "@/features/routes/home/rooms";
import { CreateButton } from "@/features/routes/home/create-button";
import { IconContainer } from "@/features/routes/home/icon";
import { Header } from "@/features/routes/home/header";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@clerk/nextjs";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

const home = () => {
  const { getToken } = useAuth();
  const [rooms, setRooms] = useAtom(roomsAtom);
  const [filterdRooms, setfilterdRooms] = useState<RoomType[]>([]);
  const [order, setOrder] = useState<string>("creation");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    fetchRooms().then(rooms => {
      updateDisplay(rooms);
      setRooms(rooms);
      setfilterdRooms(rooms);
    });
  }, [setRooms]);

  const fetchRooms = async () => {
    const feched_rooms = await apiClient.get_user_rooms({
      headers: { Authorization: `Bearer ${await getToken()}` }
    });
    const rooms = feched_rooms.map(room => {
      return {
        id: room.id,
        name: room.room_name
      } as RoomType;
    });
    updateDisplay(rooms);
    return rooms;
  };

  const updateDisplay = (rooms: RoomType[]) => {
    setRooms(rooms);
    setfilterdRooms(rooms);
  };

  const adaptFilter = (_order: string = order, _search: string = search) => {
    const displayOrdered = rooms.filter(item =>
      item.name.toLowerCase().includes(_search.toLowerCase())
    );
    let newDisplay = displayOrdered;
    if (_order === "name_up") {
      newDisplay = [...displayOrdered].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (_order === "name_down") {
      newDisplay = [...displayOrdered].sort((a, b) => b.name.localeCompare(a.name));
    }
    if (_order === "creation") {
      newDisplay = [...displayOrdered];
    }
    setfilterdRooms(newDisplay);
  };

  const handleOrderChange = (newOrder: string) => {
    setOrder(newOrder);
    adaptFilter(newOrder, search);
  };

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    adaptFilter(order, newSearch);
  };

  return (
    <main>
      <div className={style.home_page}>
        {/* <IconContainer /> */}
        <Header handleOrderChange={handleOrderChange} handleSearch={handleSearch} />
        <CreateButton updateDisplay={updateDisplay} />
        <RoomContainer items={filterdRooms} fetchRooms={fetchRooms} />
      </div>
    </main>
  );
};
export default home;
