"use client";
import style from "../../../features/routes/settings-scss/page.module.scss";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

const Profile = () => {
  return (
    <>
      <div className={style.profile_container}>
        <div className={style.profile}>
          <p className={style.my_profile}>My Profile</p>
          <Avatar className={style.image}>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"  />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
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
