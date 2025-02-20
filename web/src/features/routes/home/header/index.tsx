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

const Sample = () => {
  return (
    <div className={style.friends_container}>
      {sampleData.map(item => (
        <div className={style.item_container} key={item.name}>
          <div className={style.item_container}>
            <Avatar>
              <AvatarImage src="https://iconbu.com/wp-content/uploads/2023/10/%E5%93%8002.png" />
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
export const Friends = () => {
  return (
    <div>
      <Sample />
    </div>
  );
};
