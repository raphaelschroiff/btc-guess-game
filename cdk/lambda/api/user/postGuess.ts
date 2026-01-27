import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { getCurrentBtcPrice } from "../../common/dbMethods";

type PostGuessBody = {
  guess: 'UP' | 'DOWN';
};

function isValidPostGuessBody(body: unknown): body is PostGuessBody {
  return body != null &&
    typeof body === 'object' &&
    'guess' in body &&
    (body.guess === 'UP' || body.guess === 'DOWN');
}

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userName = event.pathParameters?.userName;
  if (!userName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'UserName parameter is required' }),
    };
  }

  const body = event.body && JSON.parse(event.body);
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Request body is required' }),
    };
  }
  if (!isValidPostGuessBody(body)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid body' }),
    };
  }

  console.log(`Storing guess for user ${userName}: ${body.guess}`);

  try {
    const currentPrice = await getCurrentBtcPrice(dynamoClient, TABLE_NAME);
    await dynamoClient.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `USER#${userName}` },
        SK: { S: `USER#${userName}` },
      },
      UpdateExpression: 'SET currentGuess = :guess, guessMadeAt = :guessMadeAt, currentPrice = :currentPrice',
      ExpressionAttributeValues: {
        ':guess': { S: body.guess },
        ':guessMadeAt': { S: new Date().toISOString() },
        ':currentPrice': { N: currentPrice.toString() },
      },
    }));
  } catch (error) {
    console.error('Error storing guess in DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Guess stored successfully' }),
  };
}