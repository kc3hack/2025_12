import style from "./index.module.scss";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Createbutton = () => {
  return (
    <div className={style.create_button}>
      <Dialog>
        <DialogTrigger asChild>
          <Button>ルーム作成</Button>
        </DialogTrigger>
        <DialogContent className={style.dialog_content}>
          <DialogHeader>
            <DialogTitle>ルーム作成</DialogTitle>
          </DialogHeader>
          <div className={style.input_container}>
            <div className={style.input_content}>
              <Label htmlFor="name" className={style.input_title}>
                部屋名
              </Label>
              <Input id="name" className={style.input} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">ルーム作成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
