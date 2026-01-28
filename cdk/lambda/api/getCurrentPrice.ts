import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { getCurrentBtcPrice } from "../common/price";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (!TABLE_NAME) {
    console.error('TABLE_NAME is not defined in environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' }),
      };
    }

  try {
    const price = await getCurrentBtcPrice(dynamoClient, TABLE_NAME);
    return {
        statusCode: 200,
        body: JSON.stringify({ price }),
    };
  } catch (error) {
    console.error('Error fetching current BTC price:', error);
    return {
    statusCode: 500,
    body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}