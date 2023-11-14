import { PrismaClient, Task } from '@prisma/client'

const prisma = new PrismaClient()

//a whitelist/subset of the Task Prisma model
interface TaskInput {
  name: string;
  priority?: number;
  completed?: boolean;
  deleted?: boolean;
}

/**
 * Adds a new task to the database.
 * @param taskInput - An object containing the details of the task to be added.
 * @param taskInput.name - The name of the task.
 * @param taskInput.priority - The priority of the task.
 * @returns A Promise that resolves when the task has been added to the database.
 */
async function addTask(taskInput: Task): Promise<Task | void> {
  try {
    const task = await prisma.task.create({
      data: taskInput
    })
    console.log(`Task ${task.id} created with name ${task.name} and priority ${task.priority}.`)

    return task;
  } catch (e) {
    console.error(e)
  }
}

/**
 * Updates a task in the database.
 * @param id - The ID of the task to update.
 * @param updates - An object containing the updates to apply to the task.
 * @param updates.name - The updated name of the task.
 * @param updates.priority - The updated priority of the task.
 * @param updates.completed - The updated completed status of the task.
 * @returns A Promise that resolves when the task has been updated in the database.
 */
async function updateTask(id: string, updates: Partial<TaskInput>): Promise<void> {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: updates,
    })
    console.log(`Task ${task.id} updated with name ${task.name} and priority ${task.priority}.`)
  } catch (e) {
    console.error(e)
  }
}

/**
 * Retrieves all tasks from the database.
 * @param onlyPending - A boolean indicating whether to return only tasks not marked as completed.
 * @returns A Promise that resolves with an array of all tasks in the database.
 */
async function getTasks(onlyPending?: boolean): Promise<Task[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: onlyPending ? { completed: false } : undefined
    })
    console.log(`Retrieved ${tasks.length} tasks from the database.`)
    return tasks
  } catch (e) {
    console.error(e)
    return []
  }
}


/**
 * Soft deletes a task in the database.
 * @param id - The ID of the task to delete.
 * @returns A Promise that resolves when the task has been soft deleted in the database.
 */
async function removeTask(id: string): Promise<void> {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: { deleted: true } as TaskInput,
    })
    console.log(`Task ${task.id} marked as deleted.`)
  } catch (e) {
    console.error(e)
  }
}

/**
 * Marks a task as completed in the database.
 * @param id - The ID of the task to mark as completed.
 * @returns A Promise that resolves when the task has been marked as completed in the database.
 */
async function completeTask(id: string): Promise<void> {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: { completed: true } as TaskInput,
    })
    console.log(`Task ${task.id} marked as completed.`)
  } catch (e) {
    console.error(e)
  }
}

/**
 * Deletes all tasks in the database.
 * @param completedOnly - A boolean indicating whether to delete only completed tasks.
 * @returns A Promise that resolves when all tasks have been deleted from the database.
 */
async function deleteAllTasks(completedOnly?: boolean): Promise<void> {
  try {
    if (completedOnly) {
      await prisma.task.deleteMany({
        where: { completed: true },
      })
      console.log('All completed tasks deleted.')
    } else {
      await prisma.task.deleteMany()
      console.log('All tasks deleted.')
    }
  } catch (e) {
    console.error(e)
  }
}


export { addTask, updateTask, removeTask, completeTask, deleteAllTasks, getTasks };
export type { TaskInput };

