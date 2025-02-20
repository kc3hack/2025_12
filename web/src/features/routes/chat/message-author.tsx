import style from "./messagecontainer.module.scss";

type Props = {
  messageAuther: string | null;
};

export const MessageAuther = (props: Props) => {
  return <div className={style.messsage_author}>{props.messageAuther}</div>;
};
