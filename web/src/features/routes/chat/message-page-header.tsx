import { Button } from "@/components/ui/button";
import style from "./message-page-header.module.scss";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const MessagePageHeader = () => {
  return (
    <div className={style.header_inner}>
      <div className={style.logo}>
        <p>asdfa</p>
      </div>
    </div>
  );
};
