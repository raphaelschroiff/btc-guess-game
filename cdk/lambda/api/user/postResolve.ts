import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getUser, updateUserScore } from "../../common/user";
import { getBtcPriceAfter } from "../../common/price";
import { badRequest, internalServerError, notFound, ok } from "../../common/responses";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME!;

type ResolveResponse = {
  guessCorrect: boolean;
  guess: 'UP' | 'DOWN';
  priceAtGuess: number;
  priceAfter: number;
  newScore: number;
};

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userName = event.pathParameters?.userName;
  if (!userName) {
    return badRequest({ reason: 'UserName parameter is required' });
  }
  const user = await getUser(dynamoClient, TABLE_NAME, userName);
  if (!user) {
    return notFound({ message: 'User not found' });
  }

  const guessMadeAt = user.guessMadeAt;
  if (!guessMadeAt || user.currentGuess === '' || user.currentPrice === undefined) {
    return badRequest({ reason: 'NO_GUESS_MADE' });
  }

  if (new Date() < new Date(guessMadeAt.getTime() + 60 * 1000)) {
    return badRequest({ reason: 'RESOLUTION_TIME_NOT_PASSED' });
  }

  const priceAfterGuess = await getBtcPriceAfter(dynamoClient, TABLE_NAME, guessMadeAt);
  if (priceAfterGuess === null) {
    return badRequest({ reason: 'NO_PRICE_AFTER_GUESS' });
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
    return internalServerError();
  }
  const responseBody: ResolveResponse = {
    guessCorrect,
    guess: user.currentGuess,
    priceAtGuess: user.currentPrice,
    priceAfter: priceAfterGuess,
    newScore,
  };

  return ok(responseBody);
}

function guessIsCorrect(guess: 'UP' | 'DOWN', priceAtGuess: number, priceAfter: number): boolean {
  return (guess === 'UP' && priceAfter > priceAtGuess) ||
    (guess === 'DOWN' && priceAfter < priceAtGuess);
}
