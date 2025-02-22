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

type ChatProps = {
  items: RoomType[];
  fetchRooms: () => void;
};
export const ChatContainer = ({ items: rooms, fetchRooms }: ChatProps) => {
  const { getToken } = useAuth();

  const handleDelete = async (room_id: string) => {
    await apiClient.delete_room(undefined, {
      params: { room_id: room_id },
      headers: { Authorization: `Bearer ${await getToken()}` }
    });

    fetchRooms();
  };

  return (
    <div className={style.chat_container}>
      {rooms.map(room => (
        <Link href={`/room/${room.id}`} className={style.chat} key={room.name}>
          <ContextMenu>
            <ContextMenuTrigger>
              <p>{room.name}</p>
              <MiniChat room_id={room.id} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>編集</ContextMenuItem>
              <ContextMenuItem
                onClick={e => {
                  e.preventDefault();
                  handleDelete(room.id);
                }}
              >
                削除
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Link>
      ))}
    </div>
  );
};
