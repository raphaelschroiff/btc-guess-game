import { baseUrl } from "../constants";

export type UserResponse = {
  userName: string;
  currentGuess: "UP" | "DOWN" | "";
  score: number;
  guessMadeAt: string | null;
}

export type User = Omit<UserResponse, 'guessMadeAt'> & { guessMadeAt: Date | null };

export function isUserResponse(data: unknown): data is UserResponse {
  return typeof data === 'object' && data !== null &&
    'userName' in data && typeof data.userName === 'string' &&
    'currentGuess' in data && typeof data.currentGuess === 'string' && ['UP', 'DOWN', ''].includes(data.currentGuess) &&
    'score' in data && typeof data.score === 'number' &&
    'guessMadeAt' in data && (typeof data.guessMadeAt === 'string' || data.guessMadeAt === null);
}

export async function userQuery(username: string): Promise<User | null> {
  if (!username) {
    return null;
  }
  const response = await fetch(`${baseUrl}user/${username.toLowerCase()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  if (!isUserResponse(result)) {
    throw new Error('Invalid user response');
  }

  return {
    ...result,
    guessMadeAt: result.guessMadeAt ? new Date(result.guessMadeAt) : null,
  }
}

export async function makeGuessMutation(username: string, guess: "UP" | "DOWN"): Promise<void> {
  const response = await fetch(`${baseUrl}user/${username.toLowerCase()}/guess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ guess }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}

export async function createUserMutation(username: string): Promise<void> {
  const response = await fetch(`${baseUrl}user/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName: username.toLowerCase() }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create user');
  }
}
