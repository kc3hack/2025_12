import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { RoomType } from "@/features/room/type";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@clerk/nextjs";
import style from "./index.module.scss";
import Link from "next/link";
import { MiniChat } from "@/features/mini-chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RoomContainerProps = {
  items: RoomType[];
  fetchRooms: () => void;
};

export const RoomContainer = ({ items: rooms, fetchRooms }: RoomContainerProps) => {
  const { getToken } = useAuth();

  const handleDelete = async (room_id: string) => {
    await apiClient.delete_user_from_room(undefined, {
      params: { room_id: room_id },
      headers: { Authorization: `Bearer ${await getToken()}` }
    });

    fetchRooms();
  };

  return (
    <div className={style.room_container}>
      {rooms.map(room => (
        <Dialog key={room.id}>
          <ContextMenu>
            <ContextMenuTrigger>
              <Link href={`/room/${room.id}`} className={style.room}>
                <div className={style.room_content}>
                  <MiniChat room_id={room.id} className={style.chat} />
                  <p className={style.room_name}>{room.name}</p>
                </div>
              </Link>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>
                <DialogTrigger style={{ width: "100%", textAlign: "left" }}>退出</DialogTrigger>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle style={{ marginBottom: "1em" }}>ホンマに退出するんか</DialogTitle>
              <DialogDescription>
                <Button variant="destructive" onClick={() => handleDelete(room.id)}>
                  退出
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};
