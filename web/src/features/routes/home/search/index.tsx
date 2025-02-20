import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import style from "./index.module.scss";

export const Searchinput = () => {
  return (
    <div className={style.search}>
      <Input
        className={style.input}
        onChange={e => {
          console.debug(e.target.value);
        }}
      />
      <Select>
        <SelectTrigger className={style.drop}>
          <SelectValue placeholder="並び替え" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name_up">名前(昇順)</SelectItem>
          <SelectItem value="name_down">名前(降順)</SelectItem>
          <SelectItem value="creation">作成順</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
