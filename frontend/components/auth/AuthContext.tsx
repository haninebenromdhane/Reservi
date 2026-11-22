"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "@/lib/api";

import type {
  AuthResponse,
  AuthUser,
  UserRole,
} from "@/types/auth";

export type { UserRole };

export type User =
  AuthUser;

type AuthContextType = {
  user: User | null;

  accessToken:
    | string
    | null;

  ready: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<User>;

  setAuthenticatedUser: (
    response: AuthResponse,
  ) => void;

  logout: () => Promise<void>;

  updateAvatarUrl: (
    avatarUrl: string,
  ) => void;

  refreshSession: () => Promise<
    User | null
  >;
};

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

const TOKEN_KEY =
  "reservi_access_token";

const USER_KEY =
  "reservi_user";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    accessToken,
    setAccessToken,
  ] =
    useState<string | null>(
      null,
    );

  const [
    ready,
    setReady,
  ] =
    useState(false);

  const persist = (
    response: AuthResponse,
  ) => {
    setUser(
      response.user,
    );

    setAccessToken(
      response.accessToken,
    );

    localStorage.setItem(
      TOKEN_KEY,
      response.accessToken,
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(
        response.user,
      ),
    );
  };

  const clear = () => {
    setUser(null);

    setAccessToken(null);

    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );
  };

  const refreshSession =
    async () => {
      try {
        const response =
          await apiFetch<AuthResponse>(
            "/auth/refresh",
            {
              method: "POST",
            },
          );

        persist(response);

        return response.user;
      } catch {
        /*
         * There may simply be no refresh
         * cookie yet. Do not automatically
         * destroy locally restored state
         * here.
         */
        return null;
      }
    };

  useEffect(() => {
    let cancelled =
      false;

    const initialize =
      async () => {
        /*
         * First restore the locally stored
         * user/token so the UI does not
         * immediately lose its state.
         */
        const storedToken =
          localStorage.getItem(
            TOKEN_KEY,
          );

        const storedUser =
          localStorage.getItem(
            USER_KEY,
          );

        if (
          storedToken &&
          storedUser
        ) {
          try {
            const parsedUser =
              JSON.parse(
                storedUser,
              ) as User;

            if (
              !cancelled
            ) {
              setAccessToken(
                storedToken,
              );

              setUser(
                parsedUser,
              );
            }
          } catch {
            localStorage.removeItem(
              TOKEN_KEY,
            );

            localStorage.removeItem(
              USER_KEY,
            );
          }
        }

        /*
         * Then try to refresh from the
         * HttpOnly cookie.
         */
        try {
          const response =
            await apiFetch<AuthResponse>(
              "/auth/refresh",
              {
                method: "POST",
              },
            );

          if (
            !cancelled
          ) {
            persist(response);
          }
        } catch {
          /*
           * No refresh cookie is normal
           * before the first login.
           *
           * If local authentication exists,
           * keep it for now.
           */
        } finally {
          if (
            !cancelled
          ) {
            setReady(true);
          }
        }
      };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ) => {
    const response =
      await apiFetch<AuthResponse>(
        "/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

    persist(response);

    return response.user;
  };

  const setAuthenticatedUser =
    (
      response: AuthResponse,
    ) => {
      persist(response);
    };

  const logout = async () => {
    try {
      await apiFetch(
        "/auth/logout",
        {
          method: "POST",

          token:
            accessToken ??
            undefined,
        },
      );
    } finally {
      clear();
    }
  };

  /*
   * Reflète côté client l'avatarUrl renvoyé par le serveur après un
   * upload réussi (POST /users/me/avatar). Contrairement à l'ancien
   * comportement, l'image n'est jamais stockée seulement en mémoire :
   * c'est bien l'URL persistée en base qui est utilisée ici.
   */
  const updateAvatarUrl = (
    avatarUrl: string,
  ) => {
    setUser(
      (current) => {
        if (!current) {
          return current;
        }

        const updated = {
          ...current,
          avatarUrl,
        };

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(
            updated,
          ),
        );

        return updated;
      },
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        ready,
        login,
        setAuthenticatedUser,
        logout,
        updateAvatarUrl,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider",
    );
  }

  return context;
}