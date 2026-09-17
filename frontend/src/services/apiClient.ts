import { API_BASE_URL } from '../constants/auth';

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<{ response: Response; data: T }> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await response.json()) as T;
  return { response, data };
};
