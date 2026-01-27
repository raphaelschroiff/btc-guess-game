import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { type APIGatewayProxyEvent, type APIGatewayProxyResult } from "aws-lambda";
import { BTC_PRICE_PK } from "../common/constants";

const dynamoClient = new DynamoDBClient();
const TABLE_NAME = process.env.BTC_GUESS_TABLE_NAME;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    const result = await dynamoClient.send(new QueryCommand({
        TableName: TABLE_NAME,
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
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'no price not found' }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ price: parseFloat(price) }),
    };
}