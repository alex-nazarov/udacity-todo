import 'source-map-support/register'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'

import {CreateTodoRequest} from '../../requests/CreateTodoRequest'
import {TodoItem} from "../../models/TodoItem";
import {parseUserId} from '../../auth/utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todoTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing event: ', event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const newItem = await createToDo(newTodo, jwtToken)
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newItem
        })
    }
}

async function createToDo(
    createToDoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)
    const timestamp = new Date().toISOString()

    const newItem = {
        todoId: itemId,
        userId: userId,
        createdAt: timestamp,
        ...createToDoRequest,
        done: false
    }

    await docClient.put({
        TableName: todoTable,
        Item: newItem
    }).promise()

    return newItem
}