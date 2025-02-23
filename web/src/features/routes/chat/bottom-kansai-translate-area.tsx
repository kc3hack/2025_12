"use client";
import style from "./footer.module.scss";

import { Loader2 } from "lucide-react";
import { wsAtom } from "@/features/websocket/store";
import { EventFromServer } from "@/types/EventFromServer";
import { useAtom } from "jotai";
import { useEffect } from "react";

type Props = {
  isReplyingNow: boolean;
  translatedMessage: string;
  setTranslatedMessage: (message: string) => void;
};

export const BottomKansaiTranslateArea = (props: Props) => {
  const [ws] = useAtom(wsAtom);

  useEffect(() => {
    const handleEvent = (e: MessageEvent) => {
      const event: EventFromServer = JSON.parse(e.data);

      if (event.type === "TranslatedMessage") {
        props.setTranslatedMessage(event.message);
      }
    };

    ws?.addEventListener("message", handleEvent);

    return () => {
      ws?.removeEventListener("message", handleEvent);
    };
  });

  return (
    <div className={style.kansai_bar} data-is-replying-now={props.isReplyingNow}>
      {props.translatedMessage === "" ? (
        <Loader2 className="animate-spin" />
      ) : (
        <p>{props.translatedMessage}</p>
      )}
    </div>
  );
};
