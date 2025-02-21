import style from "./index.module.scss";

type ChatType = { name: string };
type ChatProps = {
  items: ChatType[];
};
export const Chat = ({ items }: ChatProps) => {
  return (
    <div className={style.chat_container}>
      {items.map(item => (
        <div className={style.chat} key={item.name}>
          <p>{item.name}</p>
          <div className={style.icon} key={item.name} />
        </div>
      ))}
    </div>
  );
};
