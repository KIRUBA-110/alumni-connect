import { useState, useEffect, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import type { User, InsertUser, LoginCredentials } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: InsertUser) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
