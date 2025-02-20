"use client";
import style from "./messagecontainer.module.scss";
import { Message, Reaction } from "@/features/message/type";
import { Button } from "@/components/ui/button";
import { messagesAtom } from "@/features/message/store";
import { useAtom } from "jotai";

type Props = {
  message: Message;
};

export const MessageReaction = (props: Props) => {
  if (!props.message || !props.message.reactions || props.message.reactions.length === 0) {
    return null;
  }

  const [, setMessages] = useAtom(messagesAtom);

  const addReaction = (reactionData: Reaction) => {
    setMessages(prevMessages => {
      return prevMessages.map(msg => {
        if (msg.id === props.message.id) {
          if (!msg.reactions) {
            return msg;
          }
          const updatedReactions = msg.reactions.map(reaction => {
            if (reaction === reactionData) {
              return { ...reaction, count: reaction.count + 1 };
            }
            return reaction;
          });
          return { ...msg, reactions: updatedReactions };
        }
        return msg;
      });
    });
  };

  return (
    <div className={style.message_reactions}>
      {props.message.reactions.map(reactionData => (
        <Button
          key={reactionData.reaction_name}
          onClick={() => addReaction(reactionData)}
          variant="outline"
          className={style.reaction}
        >
          {reactionData.reaction_name} {reactionData.count}
        </Button>
      ))}
    </div>
  );
};
