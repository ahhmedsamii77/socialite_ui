import { io } from "socket.io-client";
import { getPrefix } from "./apis/apis";
export const socket = io(import.meta.env.VITE_API_BASE_URL, {
  autoConnect: false,
});


export function reconnectSocket(token: string) {
  socket.auth = {
    authorization: `${getPrefix(token)} ${token}`,
  };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect();
}
