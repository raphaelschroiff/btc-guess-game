import { type AttributeValue, DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { get } from "http";
import { getUser } from "../../common/user";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('GetUserName function invoked with event:', event);

  const userName = event.pathParameters?.userName;
  if (!userName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'UserName parameter is required' }),
    };
  }

  console.log(`Retrieving user name: ${userName}`);

  try {
    const user = await getUser(dynamoClient, TABLE_NAME, userName);
    if (user) {
      return {
        statusCode: 200,
        body: JSON.stringify(user),
      };
    }
  } catch (error) {
    console.error('Error retrieving user name from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'User not found' }),
  };
}


