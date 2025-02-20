"use client";
import { type RefObject, useState, useCallback } from "react";
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
import { memo } from "react";

type Props = {
  message: Message;
  latestMessagePositionRef: RefObject<HTMLDivElement | null>;
  replyingToRef: RefObject<HTMLDivElement | null>;
  replyingMessage: ReplyMessage | null;
  bottomInputRef: RefObject<HTMLTextAreaElement | null>;
  setReplyingMessage: (message: ReplyMessage | null) => void;
};

const reactionList = [":App1e:", ":Smile:", ":Money:"];

export const MessageCell = memo((props: Props) => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null); // 編集中のメッセージの ID を管理

  const deleteMessage = (id: string) => {
    if (props.replyingMessage?.id === id) {
      props.setReplyingMessage(null);
    }
    setMessages(messages.filter(message => message.id !== id));
  };

  const handleReply = (id: string, author: string, content: string) => {
    const replyMessage: ReplyMessage = {
      id: id,
      author_name: author,
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
            newReactions = [{ reaction_name: reactionName, count: 1 }, ...(msg.reactions || [])];
          }
          return { ...msg, reactions: newReactions };
        }
        return msg;
      })
    );
  };

  const changeMessage = (id: string) => {
    setEditingMessageId(id); // 編集モードにする
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.value;
    setMessages(prevMessages =>
      prevMessages.map(msg => {
        if (msg.id === props.message.id) {
          return { ...msg, content: newContent }; // content を更新
        }
        return msg;
      })
    );
  };

  const handleSave = () => {
    setEditingMessageId(null); // 編集モードを解除
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
            {editingMessageId === props.message.id ? ( // 編集モードかどうかで表示を切り替え
              <div>
                <input type="text" value={props.message.content} onChange={handleContentChange} />
                <button type="button" onClick={handleSave}>
                  保存
                </button>
              </div>
            ) : (
              <MessageContent message={props.message} />
            )}
            <MessageReaction message={props.message} />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => changeMessage(props.message.id)}>編集</ContextMenuItem>
          <ContextMenuItem onClick={() => deleteMessage(props.message.id)}>削除</ContextMenuItem>
          <ContextMenuItem
            onClick={() =>
              handleReply(props.message.id, props.message.author, props.message.content)
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
});
