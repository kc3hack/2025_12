import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import style from "./index.module.scss";
import Link from "next/link";

export const Header = () => {
  return (
    // TODO: ロゴは変えといて
    <div className={style.header_inner}>
      <Link href="/home" className={style.logo}>
        <img src="https://see-ss.com/img/logo@2x.png" alt="ロゴ" />
      </Link>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button className={style.login_button}>
            <p>ログイン</p>
          </Button>
        </SignedOut>
      </div>
    </div>
  );
};
