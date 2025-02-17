import style from "./index.module.scss";
const sampleData = [
  { name: "group1" },
  { name: "group2" },
  { name: "group3" },
  { name: "group4" },
  { name: "group5" },
  { name: "group6" },
  { name: "group7" },
  { name: "group8" },
  { name: "group9" },
  { name: "group10" },
  { name: "group11" },
  { name: "group12" },
  { name: "group13" },
  { name: "group14" },
  { name: "group15" },
  { name: "group16" },
  { name: "group17" },
  { name: "group18" },
  { name: "group19" },
  { name: "group20" },
  { name: "group21" },
  { name: "group22" },
  { name: "group23" },
  { name: "group24" },
  { name: "group25" },
  { name: "group26" },
  { name: "group27" },
  { name: "group28" },
  { name: "group29" },
  { name: "group30" },
  { name: "group31" },
  { name: "group32" },
  { name: "group33" }
];
export const Chat = () => {
  return (
    <div className={style.chat_container}>
      {sampleData.map((item, index) => (
        <div className={style.chat} key={item.name}>
          <p>{item.name}</p>
          <div className={style.icon} key={item.name} />
        </div>
      ))}
    </div>
  );
};
