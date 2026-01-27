import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import {  type ScheduledEvent, type Context } from 'aws-lambda';
import { BTC_PRICE_PK } from './common/constants';

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
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;
const dynamoClient = new DynamoDBClient();

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
  try {
    await storePriceInDynamoDB(btcPriceUsd);
  }
  catch (error) {
    console.error('Failed to store BTC price in DynamoDB', error);
  }
}

async function storePriceInDynamoDB(price: number): Promise<void> { 
  const timestamp = new Date().toISOString();

  await dynamoClient.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: { S: BTC_PRICE_PK },
      SK: { S: timestamp },
      price: { N: price.toString() },
    },
  }));
  console.log(`Stored BTC price ${price} USD at ${timestamp}`);
}