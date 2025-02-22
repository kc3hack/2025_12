"use client";

import { ReactNode, useEffect } from "react";
import style from "../../features/routes/settings-scss/page.module.scss";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button"

const SettingsSidebar = () => {
  const Router = useRouter();
  const PathName = usePathname();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [PathName]);
  return (
    <div className={style.setting_container}>
      <Button type="button"  variant="ghost"   className={style.setting1} onClick={() => Router.push("./profile")}>
        Profile
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2} onClick={() => Router.push("./account")}>
        Account
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2}>
        項目1
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2}>
        項目2
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2}>
        項目3
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2}>
        項目4
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2}>
        項目5
      </Button>
      <Button type="button"  variant="ghost"  className={style.setting2}>
        項目6
      </Button>
      <Button type="button"  variant="ghost" className={style.setting2}>
        項目7
      </Button>
    </div>
  );
};

const SettingsLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <div className={style.layout}>
        <div className={style.container}>
          <SettingsSidebar />
          <div className={style.contents}>{children}</div>
        </div>
      </div>
    </main>
  );
};

export default SettingsLayout;
