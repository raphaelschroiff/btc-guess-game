import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { badRequest, conflict, created, internalServerError } from "../../common/responses";

type PostUserBody = {
  userName: string;
};

function isValidPostUserBody(body: unknown): body is PostUserBody {
  return body != null &&
    typeof body === 'object' &&
    'userName' in body &&
    typeof body.userName === 'string';
}

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userName = event.body && JSON.parse(event.body);
  if (!userName) {
    return badRequest({ message: 'UserName is required' });
  }

  if (!isValidPostUserBody(userName)) {
    return badRequest({ message: 'Invalid body' });
  }

  console.log(`Storing user name: ${userName.userName}`);

  try {
    await dynamoClient.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: { S: `USER#${userName.userName}` },
        SK: { S: `USER#${userName.userName}` },
        userName: { S: userName.userName },
        score: { N: '0' },
        currentGuess: { S: '' },
        guessMadeAt: { S: '' },
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }));
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ConditionalCheckFailedException') {
      return conflict({ message: 'User already exists' });
    }

    console.error('Error storing user name in DynamoDB:', error);
    return internalServerError();
  }

  return created({ message: 'User created successfully' });
}
