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

type ChatProps = {
  items: RoomType[];
  fetchRooms: () => void;
};
export const ChatContainer = ({ items, fetchRooms }: ChatProps) => {
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
      {items.map(item => (
        <div className={style.chat} key={item.name}>
          <ContextMenu>
            <ContextMenuTrigger>
              <p>{item.name}</p>
              <div className={style.icon} key={item.name} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>編集</ContextMenuItem>
              <ContextMenuItem onClick={() => handleDelete(item.id)}>削除</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ))}
    </div>
  );
};
