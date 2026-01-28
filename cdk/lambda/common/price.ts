import { AttributeValue, DynamoDBClient, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { BTC_PRICE_PK } from "./constants";

export async function getCurrentBtcPrice(client: DynamoDBClient, tableName: string): Promise<number> {
  const result = await client.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: BTC_PRICE_PK },
    },
    ScanIndexForward: false, // descending order
    Limit: 1,
    ProjectionExpression: 'price',
  }));
  const price = result.Items?.[0]?.price.N;
  if (!price) {
    throw new Error('Current BTC price not found in DynamoDB');
  }
  return parseFloat(price);
}

export async function getBtcPriceAfter(client: DynamoDBClient, tableName: string, date: Date): Promise<number | null> {
  const result = await client.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'PK = :pk AND SK > :sk',
    ExpressionAttributeValues: {
      ':pk': { S: BTC_PRICE_PK },
      ':sk': { S: date.toISOString() },
    },
    ScanIndexForward: false, // descending order
    Limit: 1,
    ProjectionExpression: 'price',
  }));
  const price = result.Items?.[0]?.price.N;
  if (!price) {
    return null;
  }
  return parseFloat(price);
}
