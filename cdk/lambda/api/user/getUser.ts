import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { getUser } from "../../common/user";
import { badRequest, internalServerError, notFound, ok } from "../../common/responses";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('GetUserName function invoked with event:', event);

  const userName = event.pathParameters?.userName;
  if (!userName) {
    return badRequest({ message: 'UserName parameter is required' });
  }

  console.log(`Retrieving user name: ${userName}`);

  try {
    const user = await getUser(dynamoClient, TABLE_NAME, userName);
    if (user) {
      return ok(user);
    }
  } catch (error) {
    console.error('Error retrieving user name from DynamoDB:', error);
    return internalServerError();
  }

  return notFound({ message: 'User not found' });
}


