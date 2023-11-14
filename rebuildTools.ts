/**
 * This file uses the OpenAI Chat Completions API to automatically generate OpenAI Function Call
 * JSON objects for an arbitrary code file. It takes a source file, reads it and passes it into 
 * OpenAI with a simple prompt, then writes the output to another file. Extend as needed.
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

import { OptionValues, program } from 'commander';

//takes an input file, and generates a new tools.json file based on the input file
program.option('-s, --sourceFile [value]', 'The source file to use for the prompt', './API.ts');
program.option('-o, --outputFile [value]', 'The output file to write the tools.json to (defaults to your source filename + .tools.json');

const openai = new OpenAI();

/**
 * Takes an input file, and generates a new tools.json file based on the input file.
 * @param sourceFile - The source file to use for the prompt.
 * @param outputFile - The output file to write the tools.json to. Defaults to 
 * @returns Promise<void>
 */
async function build({ sourceFile, outputFile = `${sourceFile}.tools.json` }: OptionValues) {
  console.log(`Reading ${sourceFile}...`);
  const sourceFileText = fs.readFileSync(path.join(__dirname, sourceFile), 'utf-8');

  const prompt = `
    This is the implementation of my ${sourceFile} file:

    ${sourceFileText}

    Please give me a JSON object that contains a single key called "tools", which is an array of the functions in this file.
    This is an example of what I expect (one element of the array):

    {
      "type": "function",
      "function": {
        "name": "addTask",
        "description": "Adds a new task to the database.",
        "parameters": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the task."
            },
            "priority": {
              "type": "number",
              "description": "The priority of the task, with lower numbers indicating higher priority."
            },
            "completed": {
              "type": "boolean",
              "description": "Whether the task is marked as completed."
            },
            "deleted": {
              "type": "boolean",
              "description": "Whether the task is marked as deleted."
            }
          },
          "required": ["name"]
        }
      }
    },

    Please expand the input schema for each function to break them down into primitives - for example if a function has a type Task as an input type, please look up the definition of that schema and expand it into primitives for the function input. Make sure that the JSON structure strictly adheres to the shape above - each function should have a parameters section, which should have type and properties sections within it. Each property should have a key that is the name of the property, and a value that is an object with a type and description. The type should be a primitive type, and the description should be a string.

  `
  //Call the OpenAI API to generate the function definition, and stream the results back
  const stream = await openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  //Keep the new tools.json in memory until we have it all
  let newToolsJson = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);
    newToolsJson += content;
  }

  console.log('\n');
  console.log(`Updating ${outputFile}...`);

  // Write the tools JSON to ../tools.json
  fs.writeFileSync(path.join(__dirname, outputFile), newToolsJson);
  console.log('Done');
}

build(program.parse(process.argv).opts());