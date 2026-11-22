const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/$/, "");

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    token,
    headers,
    ...fetchOptions
  } = options;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,

      credentials: "include",

      headers: {
        Accept:
          "application/json",

        ...(fetchOptions.body instanceof
        FormData
          ? {}
          : {
              "Content-Type":
                "application/json",
            }),

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...headers,
      },

      cache: "no-store",
    },
  );

  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  let data: unknown;

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    data = await response.json();
  } else {
    data =
      await response.text();
  }

  if (!response.ok) {
    let message =
      "Une erreur est survenue.";

    if (
      typeof data ===
        "object" &&
      data !== null &&
      "message" in data
    ) {
      const apiMessage =
        (
          data as {
            message?: unknown;
          }
        ).message;

      if (
        Array.isArray(
          apiMessage,
        )
      ) {
        message =
          apiMessage.join(
            ", ",
          );
      } else if (
        typeof apiMessage ===
        "string"
      ) {
        message =
          apiMessage;
      }
    } else if (
      typeof data ===
      "string"
    ) {
      message = data;
    }

    throw new Error(
      message,
    );
  }

  return data as T;
}

export function getApiUrl() {
  return API_URL;
}