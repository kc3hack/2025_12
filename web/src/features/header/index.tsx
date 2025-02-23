import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import style from "./index.module.scss";

export const Header = () => {
  return (
    <div className={style.header_inner}>
      <Link href="/home" className={style.logo}>
        <p>Occha</p>
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
