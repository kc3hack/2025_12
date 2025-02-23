import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import style from "./index.module.scss";
import React from "react";
import { Search } from "lucide-react";

type SearchInputProps = {
  handleOrderChange: (order: string) => void;
  handleSearch: (search: string) => void;
};
export const Header = (props: SearchInputProps) => {
  const { handleOrderChange, handleSearch } = props;
  return (
    <div className={style.search_container}>
      <div className={style.search}>
        <div className={style.search_input_container}>
          <Search className={style.search_icon} size={18} />
          <Input
            className={style.input}
            placeholder="検索"
            onChange={e => {
              handleSearch(e.target.value);
            }}
          />
        </div>
        <Select onValueChange={handleOrderChange}>
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
    </div>
  );
};
