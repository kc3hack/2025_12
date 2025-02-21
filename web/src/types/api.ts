import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const CreateRoomRequest = z.object({ room_name: z.string() }).passthrough();
const Room = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    creator_id: z.union([z.string(), z.null()]).optional(),
    expired_at: z.union([z.string(), z.null()]).optional(),
    id: z.string(),
    room_name: z.string(),
    url: z.string(),
  })
  .passthrough();
const RoomUpdate = z
  .object({
    creator_id: z.union([z.string(), z.null()]),
    expired_at: z.union([z.string(), z.null()]),
    name: z.union([z.string(), z.null()]),
  })
  .partial()
  .passthrough();
const User = z
  .object({
    created_at: z.string().datetime({ offset: true }),
    id: z.string(),
    introduction: z.union([z.string(), z.null()]).optional(),
    nickname: z.union([z.string(), z.null()]).optional(),
  })
  .passthrough();

export const schemas = {
  CreateRoomRequest,
  Room,
  RoomUpdate,
  User,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/rooms",
    alias: "create_room",
    description: `ルームを新規作成`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ room_name: z.string() }).passthrough(),
      },
    ],
    response: Room,
    errors: [
      {
        status: 404,
        description: `Room not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/rooms/:room_id",
    alias: "delete_room",
    description: `ルームを削除`,
    requestFormat: "json",
    parameters: [
      {
        name: "room_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 404,
        description: `Room not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/rooms/:room_id",
    alias: "update_room",
    description: `ルームをアップデート`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RoomUpdate,
      },
      {
        name: "room_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Room,
    errors: [
      {
        status: 404,
        description: `Room not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/rooms/:room_id/users",
    alias: "get_room_users",
    description: `ルーム内のユーザ一覧を取得`,
    requestFormat: "json",
    parameters: [
      {
        name: "room_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(User),
    errors: [
      {
        status: 404,
        description: `Room not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
        schema: z.void(),
      },
    ],
  },
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
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/users/:user_id/rooms",
    alias: "get_user_rooms",
    description: `ユーザーが参加しているルームを取得`,
    requestFormat: "json",
    parameters: [
      {
        name: "user_id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.array(Room),
    errors: [
      {
        status: 404,
        description: `Room not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
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
        description: `User not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
      {
        status: 503,
        description: `Failed to communicate database`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
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
    method: "post",
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
    method: "post",
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
