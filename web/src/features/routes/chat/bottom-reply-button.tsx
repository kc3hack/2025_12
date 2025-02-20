import style from "./footer.module.scss";
import { type RefObject } from "react";
import { ReplyMessage } from "./message-container";
import { memo } from "react";

type Props = {
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

export const BottomReplyButton = memo((props: Props) => {
  const scrollReply = () => {
    props.replyingToRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div>
      <button type="button" className={style.reply_bar} onClick={() => scrollReply()}>
        <p>{props.replyingMessage?.author_name}に返信</p>
      </button>
      <button type="button" className={style.cancel} onClick={() => props.setReplyingMessage(null)}>
        ×
      </button>
    </div>
  );
});
