import { Button } from "@/components/ui/button";
import style from "./message-page-header.module.scss";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RoomType } from "@/features/room/type";
import { wsAtom } from "@/features/websocket/store";
import { EventFromServer } from "@/types/EventFromServer";
import { useAtom } from "jotai";
import { Copy, Settings, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const MessagePageHeader = () => {
  const [ws] = useAtom(wsAtom);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    const handleWebSocketMessage = (e: MessageEvent) => {
      const msg: EventFromServer = JSON.parse(e.data);

      if (msg.type === "JoinedRoom") {
        setRoom({ id: msg.id, name: msg.name });
        setInviteUrl(`http://${process.env.NEXT_PUBLIC_FRONTEND_URL}/room/${msg.id}/invite`);
      }
    };
    ws?.addEventListener("message", handleWebSocketMessage);

    return () => {
      ws?.removeEventListener("message", handleWebSocketMessage);
    };
  }, [ws]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    toast("招待コードをコピーしました");
  };

  return (
    <div className={style.header_inner}>
      <p>{room?.name}</p>

      <div className={style.option_container}>
        <Popover>
          <PopoverTrigger>
            <Share size={17} />
          </PopoverTrigger>
          <PopoverContent className={style.popover_container}>
            <div className={style.popover_content}>
              <p>招待URL</p>
              <div className={style.link}>
                <Input readOnly defaultValue={inviteUrl} />
                <Button variant="ghost" onClick={handleCopy}>
                  <Copy size={20} />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger>
            <Settings size={17} />
          </PopoverTrigger>
          <PopoverContent>設定は未実装です</PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
