import { Button } from "@/components/ui/button";
import style from "./index.module.scss";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    // TODO: ロゴは変えといて
    <div className={style.header_inner}>
      <div className={style.logo}>
        <img src="https://see-ss.com/img/logo@2x.png" alt="ロゴ" />
      </div>
      <div>
        <SignedIn>
          <div className={style.header_login}>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <Button className={style.header_login}>
            <p>ログイン</p>
          </Button>
        </SignedOut>
      </div>
    </div>
  );
};
