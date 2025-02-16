"use client";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Link from "next/link";
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
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 sm:px-0">
      <SignIn.Root>
        <Clerk.Loading>
          {isGlobalLoading => (
            <>
              <SignIn.Step name="start">
                <Card className="w-full sm:w-96">
                  <CardHeader>
                    <CardTitle>ログイン</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-y-4">
                    <Clerk.Field name="identifier" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Email address</Label>
                      </Clerk.Label>
                      <Clerk.Input type="email" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive" />
                    </Clerk.Field>
                    <Clerk.Field name="password" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Password</Label>
                      </Clerk.Label>
                      <Clerk.Input type="password" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive" />
                    </Clerk.Field>
                    <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                      or
                    </p>
                    <div className="grid grid-cols-2 gap-x-4">
                      <Clerk.Connection name="google" asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={isGlobalLoading}
                        >
                          <Clerk.Loading scope="provider:google">
                            {isLoading =>
                              isLoading ? (
                                <Icons.spinner className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Icons.google className="mr-2 size-4" />
                                  Google
                                </>
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </Clerk.Connection>
                      <Clerk.Connection name="discord" asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          disabled={isGlobalLoading}
                        >
                          <Clerk.Loading scope="provider:discord">
                            {isLoading =>
                              isLoading ? (
                                <Icons.spinner className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Icons.discord className="mr-2 size-4" />
                                  Discord
                                </>
                              )
                            }
                          </Clerk.Loading>
                        </Button>
                      </Clerk.Connection>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="grid w-full gap-y-4">
                      <SignIn.Action submit asChild>
                        <Button disabled={isGlobalLoading}>
                          <Clerk.Loading>
                            {isLoading => {
                              return isLoading ? (
                                <Icons.spinner className="size-4 animate-spin" />
                              ) : (
                                "次へ"
                              );
                            }}
                          </Clerk.Loading>
                        </Button>
                      </SignIn.Action>

                      <Button variant="link" size="sm" asChild>
                        <Clerk.Link navigate="sign-up">新規登録はこちら</Clerk.Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </SignIn.Step>
            </>
          )}
        </Clerk.Loading>
      </SignIn.Root>
    </div>
  );
}
