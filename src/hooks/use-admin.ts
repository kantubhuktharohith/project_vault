import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { loginAdmin, getAdminStatus } from "@/lib/auth.functions";

const COOKIE_NAME = "vault_session";

export function useAdmin() {
  const queryClient = useQueryClient();
  const doLogin = useServerFn(loginAdmin);
  const doCheckStatus = useServerFn(getAdminStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-status"],
    queryFn: async () => doCheckStatus(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: false,
  });

  const isAdmin = data?.isAdmin ?? false;

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const result = await doLogin({ data: { password } });
      // Set the session cookie on the client
      document.cookie = `${result.cookieName}=${encodeURIComponent(result.token)}; path=/; max-age=${result.maxAgeSeconds}; samesite=strict`;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-status"] });
    },
  });

  const login = useCallback(
    (password: string) => loginMutation.mutateAsync(password),
    [loginMutation],
  );

  const logout = useCallback(() => {
    // Clear the session cookie
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=strict`;
    queryClient.setQueryData(["admin-status"], { isAdmin: false });
  }, [queryClient]);

  return {
    isAdmin,
    isLoading,
    login,
    logout,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
  };
}
