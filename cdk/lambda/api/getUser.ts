import { type AttributeValue, DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";

type User = {
  userName: string;
  currentGuess: 'UP' | 'DOWN' | '';
  score: number;
  guessMadeAt: Date | null;
}

function userFromItem(item: Record<string, AttributeValue>): User {
  const userName = item.userName.S;
  if (!userName) {
    throw new Error('Invalid userName in DynamoDB item');
  }
  const currentGuess = item.currentGuess.S;
  const score = item.score.N ? parseInt(item.score.N) : 0;
  const guessMadeAt = item.guessMadeAt.S ? new Date(item.guessMadeAt.S) : null;
  return {
    userName,
    currentGuess: currentGuess === 'UP' || currentGuess === 'DOWN' ? currentGuess : '',
    score,
    guessMadeAt,
  };
}

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
    const result = await dynamoClient.send(new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: { S: `USER#${userName}` },
        SK: { S: `USER#${userName}` },
      },
    }));

    if (result?.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(userFromItem(result.Item)),
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