"use client";

import { ReactNode, useEffect } from "react";
import style from "../../features/routes/settings-scss/page.module.scss";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const SettingsSidebar = () => {
  const Router = useRouter();
  const PathName = usePathname();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [PathName]);
  return (
    <div className={style.setting_container}>
      <button type="button" className={style.setting1} onClick={() => Router.push("./profile")}>
        Profile
      </button>
      <button type="button" className={style.setting2} onClick={() => Router.push("./account")}>
        Account
      </button>
      <button type="button" className={style.setting2}>
        項目3
      </button>
      <button type="button" className={style.setting2}>
        項目4
      </button>
      <button type="button" className={style.setting2}>
        項目5
      </button>
      <button type="button" className={style.setting2}>
        項目2
      </button>
      <button type="button" className={style.setting2}>
        項目2
      </button>
      <button type="button" className={style.setting2}>
        項目2
      </button>
      <button type="button" className={style.setting2}>
        項目2
      </button>
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
