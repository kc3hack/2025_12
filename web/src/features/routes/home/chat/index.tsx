import style from "./index.module.scss";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from "@/components/ui/context-menu";

type ChatType = { name: string };
type ChatProps = {
  items: ChatType[];
};
export const ChatContainer = ({ items }: ChatProps) => {
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
              <ContextMenuItem>削除</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      ))}
    </div>
  );
};
