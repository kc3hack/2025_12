import style from "./messagecontainer.module.scss";

type Props = {
  messageName: string | null;
};

export const MessageAuther = (props: Props) => {
  return <div className={style.messsage_author}>{props.messageName}</div>;
};
