import { createApiClient } from "./api";

export const apiClient = createApiClient(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
  axiosConfig: {
    headers: {
      "content-type": "application/json"
    },
    withCredentials: true
  }
});
