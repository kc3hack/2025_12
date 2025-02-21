import style from "./index.module.scss";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sampleData = [
  { name: "tanaka" },
  { name: "matsuda" },
  { name: "honda" },
  { name: "suzuki" },
  { name: "yosida" },
  { name: "hayasi" }
];

export const IconContainer = () => {
  return (
    <div className={style.friends_container}>
      {sampleData.map(item => (
        <div className={style.item_container} key={item.name}>
          <div className={style.item_container}>
            <Avatar>
              <AvatarImage src="https://img.freepik.com/free-photo/fuji-mountain-kawaguchiko-lake-morning-autumn-seasons-fuji-mountain-yamanachi-japan_335224-102.jpg" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className={style.item_container}>
            <p className={style.name}>{item.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
