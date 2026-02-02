import { baseUrl } from "../constants";

export type ResolvedGuess = {
  guessCorrect: boolean;
  guess: 'UP' | 'DOWN';
  priceAtGuess: number;
  priceAfter: number;
  newScore: number;
};

function isResolvedGuess(data: unknown): data is ResolvedGuess {
  return typeof data === 'object' && data !== null &&
    'guessCorrect' in data && typeof data.guessCorrect === 'boolean' &&
    'guess' in data && typeof data.guess === 'string' && ['UP', 'DOWN'].includes(data.guess) &&
    'priceAtGuess' in data && typeof data.priceAtGuess === 'number' &&
    'priceAfter' in data && typeof data.priceAfter === 'number' &&
    'newScore' in data && typeof data.newScore === 'number';
}

export async function resolveGuessMutation(username: string): Promise<ResolvedGuess> {
  const response = await fetch(`${baseUrl}user/${username.toLowerCase()}/resolve`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Error resolving guess: ${response.statusText}`);
  }
  const data = await response.json();
  if (!isResolvedGuess(data)) {
    throw new Error('Invalid resolve response');
  }
  return data;
}
