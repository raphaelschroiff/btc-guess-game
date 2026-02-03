import { baseUrl } from "../constants";

export async function priceQuery(): Promise<number> {
  const response = await fetch(`${baseUrl}/current-price`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  if (!result || typeof result.price !== 'number') {
    throw new Error('Invalid price response');
  }
  return result.price as number;
}

export function formatPrice(price: number): string {
  return `$${price}`;
}

