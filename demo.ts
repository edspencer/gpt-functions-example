import OpenAI from "openai";
import toolsJson from "./API.ts.tools.json";
import { OptionValues, program } from "commander";

import { Task } from '@prisma/client'
import { addTask, removeTask, updateTask, completeTask, getTasks, deleteAllTasks } from "./API";

const openai = new OpenAI();

program.option('-t, --truncate', 'Truncate the database before running the demo')
program.option('-m, --message [value]', 'The message to send from the user');

/**
 * The instructions that we give the Assistant itself.
*/
const missionStatement = `
You are an expert task planning assistant who helps people organize the tasks in the various parts of their lives.
Human users will chat with you to keep track of their tasks, each of which can be given a priority and a status of completed or not.
You will need to keep track of the tasks and their attributes in order to respond to the user's requests.
Assume that the user might just be giving you a list of items to create. Unless a multi-line or comma-separated list is given, assume that each new line or element is a new Task to create.
They could also be asking you to update an existing item.
If the user indicates a priority, please translate this to the priority number, where 1 means top priority and 3 means bottom priority. If they did not give one, assume priority 2.
Ignore the getTasks function and just use the tasks I pass you`;

//if you called this without any instructions, this is the default message that will be sent
const defaultUserMessage = "I need to go buy bread from the store, then go to the gym. I also need to do my taxes, which is a P1.";

/**
 * The main function that runs the demo. Creates an Assistant, a Thread, then
 * sends a Message, starts a Run and runs the tasks the Assistant calls for.
 */
async function main({ message = defaultUserMessage, truncate = false }: OptionValues) {
  if (truncate) {
    await deleteAllTasks()
  }

  const assistant = await createAssistant();
  const thread = await getThreadForUser();

  const existingTasks = await getTasks();

  await engageAssistant(assistant, thread, existingTasks, message);
}

/**
 * Creates an OpenAI Assistant configuired with the mission statement.
 * @returns A Promise that resolves with the newly created Assistant.
 */
export async function createAssistant() {
  console.log('Creating assistant...')

  const assistant = await openai.beta.assistants.create({
    name: "Task Planner",
    instructions: missionStatement,
    model: "gpt-4-1106-preview",
    tools: toolsJson.tools as any
  });

  console.log(`Created assistant ${assistant.id} with name ${assistant.name}.`);

  return assistant;
}

//this should probably give you a persistent thread for a given user, but BYOL here
export async function getThreadForUser() {
  const thread = await openai.beta.threads.create({});

  console.log(`Created thread ${thread.id}`);
  return thread;
}

/**
 * Engages the assistant to respond to a user message and update tasks as appropriate.
 * @param assistant - The assistant object containing the ID of the assistant.
 * @param thread - The thread object containing the ID of the thread.
 * @param tasks - An array of Task objects.
 * @param userMessage - The message sent by the user.
 * @returns A Promise that resolves when all tasks have been updated.
 */
export async function engageAssistant(assistant: { id: string }, thread: { id: string }, tasks: Task[], userMessage: string) {
  const content = `This is the message the user just sent:

  ${userMessage}

  Please use the functions provided to update the tasks as appropriate.
  If the user says they have already done a task that you recognize in the users tasks, call the function to mark it completed.
  `

  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content
  });

  console.log("Created message");
  console.log(message.id);

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: `These are the tasks that the user already has: ${JSON.stringify(tasks)}. Please update them as appropriate, do not make duplicates.`,
  });

  const actions = await getActionsForRun(thread, run);

  console.log('Actions:')
  console.log(actions);

  if (!actions) {
    console.log('No actions required, exiting...');
    return;
  }

  //now iterate over the function calls OpenAI asked us to make
  for (const action of actions) {
    const decodedArgs = JSON.parse(action.function.arguments);

    switch (action.function.name) {
      case "addTask":
        console.log('Adding task');
        await addTask(decodedArgs);
        break;
      case "updateTask":
        console.log('Updating task');
        await updateTask(decodedArgs.id, decodedArgs.updates);
        break;
      case "completeTask":
        console.log('Completing task');
        await completeTask(decodedArgs.id);
        break;
      case "removeTask":
        console.log('Removing task');
        await removeTask(decodedArgs.id);
        break;
      default:
        console.log(`Unknown action: ${action.function.name}`);
        break;
    }
  }

}

/**
 * Currently, we have to poll an endpoint to figure out if the run is complete yet.
 * Obviously, this needs a lot more error handling than this but you get the point.
 * @param thread - The thread containing the run.
 * @param run - The run to retrieve actions for.
 * @returns An array of tool calls for the run, or an empty array if no actions are required.
 */
async function getActionsForRun(thread: { id: string }, run: { id: string }): Promise<any[] | undefined> {
  console.log('Polling thread')
  const response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  console.log(`Current status: ${response.status}`)

  if (response.status === "completed" || response.status === "requires_action") {
    return response.required_action?.submit_tool_outputs?.tool_calls || [];
  } else if (response.status === "failed") {
    console.error('Action failed');
    console.error(response);
  } else {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Trying again in 2 seconds...');
    return await getActionsForRun(thread, run);
  }
}

//kick things off
main(program.parse(process.argv).opts());