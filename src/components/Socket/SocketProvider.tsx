import useSocketEvents from "@/hooks/useSocketEvents";

export default function SocketProvider() {
  useSocketEvents();
  return null;
}
