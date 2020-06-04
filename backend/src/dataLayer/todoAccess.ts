import * as AWS from "aws-sdk";
import {TodoItem} from "../models/TodoItem";

export class ToDoAccess {

    constructor(
        private readonly docClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE,
        private readonly todoIdIndex = process.env.TODO_ID_INDEX) {
    }

    async getAllToDos(
        userId: string
    ): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todoTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise()

        return result.Items as TodoItem[]
    }


    async createToDo(
        item: TodoItem
    ): Promise<TodoItem> {

        await this.docClient.put({
            TableName: this.todoTable,
            Item: item
        }).promise()

        return item
    }

    async deleteToDo(
        item: TodoItem
    ): Promise<TodoItem> {

        await this.docClient.delete(
            {
                TableName: this.todoTable,
                Key: {
                    userId: item.userId,
                    createdAt: item.createdAt
                }
            }
        ).promise()

        return item
    }

    async updateToDoImageId(
        item: TodoItem
    ): Promise<void> {

        await this.docClient.update(
            {
                TableName: this.todoTable,
                Key: {
                    userId: item.userId,
                    createdAt: item.createdAt
                },
                UpdateExpression: "set attachmentUrl = :attachmentUrl",
                ExpressionAttributeValues: {
                    ":attachmentUrl": item.attachmentUrl
                }
            }
        ).promise()
    }

    async updateToDoStatus(
        item: TodoItem
    ): Promise<void> {

        await this.docClient.update(
            {
                TableName: this.todoTable,
                Key: {
                    userId: item.userId,
                    createdAt: item.createdAt
                },
                UpdateExpression: "set #tdName=:toDoName, dueDate=:dDate, done=:toDoDone",
                ExpressionAttributeNames: {
                    "#tdName": "name"
                },
                ExpressionAttributeValues: {
                    ":toDoName": item.name,
                    ":dDate": item.dueDate,
                    ":toDoDone": item.done
                }
            }
        ).promise()
    }

    async getTodoItem(todoId: string): Promise<TodoItem> {
        const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: this.todoIdIndex,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise()
        if (result.Count > 0)
            return result.Items[0] as TodoItem
        else
            return undefined
    }

}