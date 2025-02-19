import { Button } from "@/components/ui/button";
import { messagesAtom } from "@/features/message/store";
import { Message } from "@/features/message/type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAtom } from "jotai";
import style from "./messagecontainer.module.scss";

type Props = {
  message: Message;
};

const scrollToMessage = (id: string | null) => {
  const element = document.getElementById(`message-${id}`);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
};

export const ReplyMessagePosition = (props: Props) => {
  const [messages] = useAtom(messagesAtom);

  const replyMesage = messages.find(replyMessage => replyMessage.id === props.message.reply_to_id);

  return (
    <div className={style.message}>
      {props.message.reply_to_id && (
        <Button
          variant="outline"
          className={style.message_reply_area}
          onClick={() => scrollToMessage(props.message.reply_to_id)}
        >
          {replyMesage ? (
            <div>
              {replyMesage?.icon && (
                <Avatar className={style.avatar}>
                  <AvatarImage src={replyMesage.icon} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              )}
              <p>{replyMesage?.author}</p>
              <p>{replyMesage?.content}</p>
            </div>
          ) : (
            <div>
              <p>元のメッセージが削除されました</p>
            </div>
          )}
        </Button>
      )}
      <p>{props.message.content}</p>
    </div>
  );
};
