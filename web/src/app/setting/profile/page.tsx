"use client";
import style from "../../../features/routes/settings-scss/page.module.scss";
import Image from "next/image";

const Profile = () => {
  return (
    <>
      <div className={style.profile_container}>
        <div className={style.profile}>
          <p>My Profile</p>
          <Image src="/globe.svg" alt="pp" width={100} height={100} className={style.image} />
        </div>
        <div className={style.namebox_container}>
          <p>お名前</p>
          <input className={style.namebox} />
          <div className={style.intro_container}>
            <p>自己紹介</p>
            <input className={style.intro} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
