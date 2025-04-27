import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export interface RequestOptions {
  method?: string;
  body?: string | object;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

/**
 * Make an API request with JSON handling
 */
export async function apiRequest<T = any>(
  urlOrOptions: string | RequestOptions,
  options?: RequestOptions
): Promise<T> {
  let url: string;
  let requestOptions: RequestOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {}
  };

  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    if (options) {
      requestOptions = { ...requestOptions, ...options };
    }
  } else {
    throw new Error('URL must be a string');
  }

  if (requestOptions.body && typeof requestOptions.body !== 'string') {
    requestOptions.body = JSON.stringify(requestOptions.body);
    requestOptions.headers = {
      ...requestOptions.headers,
      'Content-Type': 'application/json'
    };
  }

  const res = await fetch(url, requestOptions as RequestInit);
  await throwIfResNotOk(res);
  
  try {
    return await res.json();
  } catch (e) {
    // Return empty object if no JSON response
    return {} as T;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
