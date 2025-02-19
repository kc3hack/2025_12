"use client";

import style from "@routes/create-profile/index.module.scss";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CreateProfilePage = () => {
  return (
    <div className={style.cerate_profile_page}>
      <Card className={style.card}>
        <CardHeader>
          <CardTitle>プロフィールを作成</CardTitle>
        </CardHeader>
        <CardContent className={style.content}>
          <div className={style.left_container}>
            <Avatar className={style.avatar}>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Button variant="secondary" className={style.button}>
              アップロード
            </Button>
          </div>
          <div className={style.right_container}>
            <p>名前</p>
            <Input />
            <p>自己紹介</p>
            <Textarea />
          </div>
        </CardContent>
        <CardFooter className={style.footer}>
          <Button className={style.submit_button}>登録</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateProfilePage;
