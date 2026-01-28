import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { getUser, updateUserScore } from "../../common/user";
import { getBtcPriceAfter, getCurrentBtcPrice } from "../../common/price";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;

type CheckResolvedResponse = {
  guessCorrect: boolean;
  guess: 'UP' | 'DOWN';
  priceAtGuess: number;
  priceAfter: number;
  newScore: number;
};

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userName = event.pathParameters?.userName;
  if (!userName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: 'UserName parameter is required' }),
    };
  }
  const user = await getUser(dynamoClient, TABLE_NAME, userName);
  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'User not found' }),
    };
  }

  const guessMadeAt = user.guessMadeAt;
  if (!guessMadeAt || user.currentGuess === '' || user.currentPrice === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: 'NO_GUESS_MADE' }),
    };
  }

  if (new Date() < new Date(guessMadeAt.getTime() +  60 * 1000)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: 'RESOLUTION_TIME_NOT_PASSED' }),
    };
  }

  const priceAfterGuess = await getBtcPriceAfter(dynamoClient, TABLE_NAME, guessMadeAt);
  if (priceAfterGuess === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ reason: 'NO_PRICE_AFTER_GUESS' }),
    };
  }

  const guessCorrect = guessIsCorrect(user.currentGuess, user.currentPrice, priceAfterGuess);
  let newScore: number;
  if (guessCorrect) {
    newScore = user.score + 1;
  } else {
    newScore = Math.max(0, user.score - 1);
  }

  // Update user score in DynamoDB
  try {
    await updateUserScore(dynamoClient, TABLE_NAME, userName, newScore);
  } catch (error) {
    console.error('Error updating user score in DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
  const responseBody: CheckResolvedResponse = {
    guessCorrect,
    guess: user.currentGuess,
    priceAtGuess: user.currentPrice,
    priceAfter: priceAfterGuess,
    newScore,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
  };
}

function guessIsCorrect(guess: 'UP' | 'DOWN', priceAtGuess: number, priceAfter: number): boolean {
  return (guess === 'UP' && priceAfter > priceAtGuess) ||
         (guess === 'DOWN' && priceAfter < priceAtGuess);
}