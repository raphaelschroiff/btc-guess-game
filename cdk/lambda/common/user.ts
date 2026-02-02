import { AttributeValue, DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

type User = {
  userName: string;
  currentGuess: 'UP' | 'DOWN' | '';
  currentPrice?: number;
  score: number;
  guessMadeAt: Date | null;
}

export async function getUser(client: DynamoDBClient, tableName: string, userName: string): Promise<User | null> {
  const result = await client.send(new GetItemCommand({
    TableName: tableName,
    Key: {
      PK: { S: `USER#${userName}` },
      SK: { S: `USER#${userName}` },
    },
  }));

  if (result?.Item) {
    return userFromItem(result.Item);
  }

  return null;
}

function userFromItem(item: Record<string, AttributeValue>): User {
  const userName = item.userName?.S;
  if (!userName) {
    throw new Error('Invalid userName in DynamoDB item');
  }
  const currentGuess = item.currentGuess?.S;
  const score = item.score?.N ? parseInt(item.score.N) : 0;
  const guessMadeAt = item.guessMadeAt?.S ? new Date(item.guessMadeAt.S) : null;
  return {
    userName,
    currentGuess: currentGuess === 'UP' || currentGuess === 'DOWN' ? currentGuess : '',
    score,
    guessMadeAt,
    currentPrice: item.currentPrice?.N ? parseFloat(item.currentPrice.N) : undefined,
  }
}

export async function updateUserScore(client: DynamoDBClient, tableName: string, userName: string, newScore: number): Promise<void> {
  await client.send(new UpdateItemCommand({
    TableName: tableName,
    Key: {
      PK: { S: `USER#${userName}` },
      SK: { S: `USER#${userName}` },
    },
    UpdateExpression: 'SET score = :newScore, guessMadeAt = :null, currentGuess = :null, currentPrice = :null',
    ExpressionAttributeValues: {
      ':newScore': { N: newScore.toString() },
      ':null': { NULL: true },
    },
  }));
}

