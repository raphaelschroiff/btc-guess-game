import {  type ScheduledEvent, type Context } from 'aws-lambda';

// relevant subset of the Coingecko API response for bitcoin <-> USD price
type CoingeckoPriceResponse = {
  bitcoin: {
    usd: number;
  };
};

function isBitcoinPriceResponse(data: unknown): data is CoingeckoPriceResponse {
  return (
    data != null &&
    typeof data === 'object' &&
    'bitcoin' in data &&
    data.bitcoin != null &&
    typeof data.bitcoin === 'object' &&
    'usd' in data.bitcoin &&
    typeof data.bitcoin.usd === 'number'
  );
}

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

export async function handler(event: ScheduledEvent, context: Context): Promise<void> {
  const response = await fetch(COINGECKO_API_URL)
  if (!response.ok) {
    console.error(`Failed to fetch BTC price: ${response.status} ${response.statusText}`);
    return;
  }

  const data = await response.json();

  if (!isBitcoinPriceResponse(data)) {
    console.error('Invalid response format from Coingecko API', data);
    return;
  }

  const btcPriceUsd = data.bitcoin.usd;
  console.log(`Fetched BTC price: ${btcPriceUsd} USD`);
}