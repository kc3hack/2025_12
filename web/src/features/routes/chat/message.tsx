"use client";
import { type RefObject } from "react";
import { messagesAtom } from "../../message/store";
import { useAtom } from "jotai";
import style from "./messagecontainer.module.scss";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, Reaction } from "@/features/message/type";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { ReplyMessage } from "./message-container";
import { MessageContent } from "./message-content";
import { MessageReaction } from "./message-reaction";
import { MessageAuther } from "./message-author";

type Props = {
  message: Message;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

const reactionList = [":App1e:", ":Smile:", ":Money:"];

export const MessageCell = (props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);

  const deleteMessage = (id: string) => {
    if (id === props.replyingMessage?.id) {
      props.setReplyingMessage(null);
    }
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (id: string, author_name: string | null, content: string) => {
    const replyMessage: ReplyMessage = {
      id: id,
      author_name: author_name,
      content: content
    };

    props.setReplyingMessage(replyMessage);

    if (props.bottomInputRef.current) {
      props.bottomInputRef.current.focus();
    }
  };

  const addReaction = (reactionName: string) => {
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === props.message.id) {
          const existingReactionIndex = (msg.reactions || []).findIndex(
            r => r.reaction_name === reactionName
          );
          let newReactions: Reaction[] = [];

          if (existingReactionIndex >= 0) {
            newReactions = (msg.reactions || []).map((r, index) =>
              index === existingReactionIndex ? { ...r, count: r.count + 1 } : r
            );
          } else {
            newReactions = [...(msg.reactions || []), { reaction_name: reactionName, count: 1 }];
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  return (
    <div
      id={`message-${props.message.id}`}
      ref={props.replyingMessage?.id === props.message.id ? props.replyingToRef : null}
      className={style.message_wrapper}
      data-is-me={props.message.is_me}
      data-is-replying={props.replyingMessage?.id === props.message.id}
    >
      {!props.message.is_me && props.message.icon && (
        <Avatar className={style.avatar}>
          <AvatarImage src={props.message.icon} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          <div>
            <MessageAuther messageName={props.message.author_name} />
            <MessageContent message={props.message} />
            <MessageReaction message={props.message} />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => deleteMessage(props.message.id)}>削除</ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              handleReply(props.message.id, props.message.author_name, props.message.content)
            }
          >
            返信
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>リアクションをつける</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {reactionList.map(reaction => (
                <ContextMenuItem key={reaction} onClick={() => addReaction(reaction)}>
                  {reaction}
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
              <ContextMenuItem>すべての絵文字を表示</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};
