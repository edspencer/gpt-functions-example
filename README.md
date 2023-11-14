# README for OpenAI Assistant Integration Demo

## Overview

This project demonstrates the integration of OpenAI's Assistants technology to automatically generate the JSON you need to have OpenAI call your own functions. The project uses OpenAI's recent updates to function calling and integrates them into a TypeScript-based task management application using a SQLite database and Prisma.

## Features

- Automatic generation of OpenAI Function Call JSON objects for internal APIs.
- Integration with OpenAI's Chat Completions API.
- Usage of TypeScript for API implementation.
- SQLite database management using Prisma.
- Generation and execution of Function Calls for internal APIs.

## Getting Started

1. Clone the repository from GitHub
2. Install the necessary dependencies via `npm` or `yarn`.
3. Run `npx prisma migrate dev` to create the sqlite database

## Usage

- The `rebuildTools.ts` script is used to generate a tools JSON file from your TypeScript source file.
- The script reads the source file, sends its contents to OpenAI, and saves the output as a tools JSON.
- Use `ts-node rebuildTools.ts -s API.ts` to generate your API's tools JSON file. This is already in the repo but will overwrite API.ts.tools.json if you run it
- The `demo.ts` script demonstrates how to use the generated tools JSON with OpenAI's Assistant
- Use `demo.ts -m "I need to buy bread, go to the gym and file my taxes. Taxes are a P1!` to see it create 3 Tasks in your sqlite database
- Use `demo.ts -m "I bought the bread, please update the gym to a P1 and add a task to pick up the cake` to see it complete, update and make new Tasks

## Key Components

- `API.ts`: TypeScript file containing your internal API functions.
- `rebuildTools.ts`: Script to generate tools JSON from your API file.
- `demo.ts`: Demonstrative script showcasing the integration with OpenAI's Assistant.

## Documentation

- Extensive in-code documentation and comments provided for understanding and extending the functionality.
- The blog post provides a detailed guide and insights on the implementation and use cases.

## Security and Best Practices

- Be aware of security considerations when exposing internal APIs.
- Regularly review and update the generated tools JSON for changes in your API.
- Consider implementing CI/CD checks for changes in the tools JSON.

## Dependencies

- OpenAI's GPT technology and APIs.
- TypeScript.
- SQLite and Prisma for database management.

## License

MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

Credit to the author of the original blog post for the concept and initial implementation.
