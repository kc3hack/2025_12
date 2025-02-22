"use client";
import style from "../../../features/routes/settings-scss/page.module.scss";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" className={style.account_card_container}>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className={style.textbox}>
            <div className={style.left_container}>
              <Avatar className={style.image}>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className={style.right_container}>
              <div className="space-y-1">
                <Label htmlFor="name">Username</Label>
                <Input id="username" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Self-Introduction</Label>
                <Input id="self-introduction" className={style.intro} />
                <CardFooter>
                  <Button className={style.changes}>Save changes</Button>
                </CardFooter>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
