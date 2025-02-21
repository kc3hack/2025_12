import style from "./index.module.scss";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roomsAtom } from "@/features/room/store";
import { apiClient } from "@/lib/apiClient";
import { useAtom } from "jotai";
import { useAuth } from "@clerk/nextjs";
import { useRef, useState } from "react";

export const CreateButton = () => {
  const { getToken } = useAuth();
  const [rooms, setRooms] = useAtom(roomsAtom);
  const roomNameInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = async () => {
    if (!roomNameInputRef.current) {
      return;
    }

    if (roomNameInputRef.current.value === "") {
      return;
    }

    const newRoom = await apiClient.create_room(
      { room_name: roomNameInputRef.current.value },
      {
        headers: { Authorization: `Bearer ${await getToken()}` }
      }
    );
    setRooms([...rooms, { id: newRoom.id, name: newRoom.room_name }]);

    setIsOpen(false);

    roomNameInputRef.current.value = "";
  };

  return (
    <div className={style.create_button}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>ルーム作成</Button>
        </DialogTrigger>
        <DialogContent className={style.dialog_content}>
          <DialogHeader>
            <DialogTitle>ルーム作成</DialogTitle>
          </DialogHeader>
          <div className={style.input_container}>
            <div className={style.input_content}>
              <Label htmlFor="name" className={style.input_title}>
                部屋名
              </Label>
              <Input id="name" className={style.input} ref={roomNameInputRef} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleClick}>
              ルーム作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
