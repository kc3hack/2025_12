import { createApiClient } from "./api";

export const apiClient = createApiClient(`http://localhost:3050`, {
  axiosConfig: {
    headers: {
      "content-type": "application/json"
    },
    withCredentials: true
  }
});
