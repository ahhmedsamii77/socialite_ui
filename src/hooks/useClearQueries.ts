import { useQueryClient } from "@tanstack/react-query";

export default function useClearQueries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.clear();
  };
}
