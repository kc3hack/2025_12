import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import style from "./index.module.scss";

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
          <Link href="/sign-in">
            <Button className={style.login_button}>
              <p>ログイン</p>
            </Button>
          </Link>
        </SignedOut>
      </div>
    </div>
  );
};
