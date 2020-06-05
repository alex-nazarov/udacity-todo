import * as uuid from 'uuid'

import {ToDoAccess} from "../dataLayer/todoAccess";
import {TodoItem} from "../models/TodoItem";
import {CreateTodoRequest} from "../requests/CreateTodoRequest";
import {ImagesBucketAccess} from "../fileStorage/imagesBucketAccess";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";

const todoAccess = new ToDoAccess()
const imagesBucketAccess = new ImagesBucketAccess()

export async function getAllToDos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllToDos(userId)
}

export async function createToDo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
    const itemId = uuid.v4()
    const timestamp = new Date().toISOString()
    const newItem = {
        todoId: itemId,
        userId: userId,
        createdAt: timestamp,
        ...newTodo,
        done: false
    }
    return todoAccess.createToDo(newItem)
}

export async function deleteToDo(todoId: string): Promise<void> {
    const toDoItem = await todoAccess.getTodoItem(todoId);
    if(!toDoItem){
        throw Error('Item not found')
    }
    await todoAccess.deleteToDo(toDoItem);
}

export async function getUploadUrl(todoId: string): Promise<string> {
    const toDoItem = await todoAccess.getTodoItem(todoId);
    if(!toDoItem){
        throw Error('Item not found')
    }
    const imageId = todoId + '-attachment'
    const bucketName = process.env.TODOS_S3_BUCKET
    toDoItem.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    await todoAccess.updateToDoImageId(toDoItem)
    return await imagesBucketAccess.getUploadUrl(imageId)
}

export async function updateToDo(todoId: string, updateReq: UpdateTodoRequest): Promise<void> {
    console.log("Execute business logic")
    const toDoItem = await todoAccess.getTodoItem(todoId);
    if(!toDoItem){
        throw Error('Item not found')
    }
    console.log("ToDo Item discovered "+ toDoItem)
    toDoItem.done = updateReq.done;
    toDoItem.dueDate = updateReq.dueDate;
    console.log("ToDo Item updated, save it "+ toDoItem)
    await todoAccess.updateToDoStatus(toDoItem)
}