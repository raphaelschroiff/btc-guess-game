import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
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