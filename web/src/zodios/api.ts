import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const User = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    id: z.string(),
    introduction: z.union([z.string(), z.null()]).optional(),
    nickname: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();

export const schemas = {
  User,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/users/:id",
    alias: "get_user",
    description: `IDからユーザーを取得`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: User,
    errors: [
      {
        status: 404,
        description: `User not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/users/me",
    alias: "get_user_me",
    description: `ログインユーザーの情報を取得`,
    requestFormat: "json",
    response: User,
    errors: [
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/webhook/user_deleted",
    alias: "webhook_user_deleted",
    description: `ユーザーがアカウントを削除したときにClerkから呼ばれるWebhook`,
    requestFormat: "binary",
    parameters: [
      {
        name: "body",
        description: `Raw binary data`,
        type: "Body",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/webhook/user_signup",
    alias: "webhook_user_signup",
    description: `ユーザーがアカウントを登録したときにClerkから呼ばれるWebhook`,
    requestFormat: "binary",
    parameters: [
      {
        name: "body",
        description: `Raw binary data`,
        type: "Body",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/webhook/user_updated",
    alias: "webhook_user_updated",
    description: `ユーザーがアカウント情報を更新したときにClerkから呼ばれるWebhook`,
    requestFormat: "binary",
    parameters: [
      {
        name: "body",
        description: `Raw binary data`,
        type: "Body",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Bad Request`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal Server Error`,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
