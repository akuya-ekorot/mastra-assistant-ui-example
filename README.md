# Mastra & Assistant UI Integration Example

## Overview

This project demonstrates integrating Mastra (as a separate server instance) with Assistant UI to create a rich, conversational AI experience. It showcases a client-server architecture where the Next.js frontend (powered by Assistant UI) communicates with a Mastra backend.

While this example uses a separate Mastra server, it's worth noting that a full-stack approach, with the Mastra server-side logic running within the same Next.js application, is also a feasible architecture.

## Key Technologies

*   **Assistant UI (`@assistant-ui/react`)**: A React library for rapidly building beautiful and feature-rich chat user interfaces.
*   **Mastra Client JS (`@mastra/client-js`)**: The official JavaScript client for interacting with a Mastra conversational AI backend.
*   **Next.js**: A popular React framework for building server-rendered and statically generated web applications.
*   **TypeScript**: For static typing, enhancing code quality and developer experience.

## Core Integration Points & Logic (`frontend/`)

The frontend application, located in the `frontend/` directory, contains all the UI and client-side logic for the chat interface.

### Main Assistant UI Setup (`app/assistant.tsx`)

This is the primary React component where the Assistant UI is initialized and rendered.
*   It utilizes `AssistantRuntimeProvider` from `@assistant-ui/react` to provide the necessary context for the chat components.
*   The core of the Mastra integration is achieved by passing a custom runtime, created by the `useMastraRuntime` hook, to the `AssistantRuntimeProvider`. This hook acts as the bridge between Assistant UI's expectations and Mastra's capabilities.
*   This component also demonstrates how to integrate custom UI components for specific AI tools, as seen with the `WeatherToolUI`.

### Mastra Communication Layer (`mastra/` directory)

This crucial directory encapsulates all the custom React hooks and utility functions responsible for seamless communication with the Mastra backend.

*   **`useMastraRuntime.tsx`**:
    *   This is the central hook that connects Assistant UI to the Mastra backend.
    *   It leverages `useExternalStoreRuntime` from Assistant UI, a flexible mechanism designed for integrating custom backend logic.
    *   It composes `useSendMessage` (for handling message exchange) and `useMastraThreadList` (for managing conversation threads) to supply the necessary functions and reactive data to the Assistant UI components.
    *   It also uses `coreMessageToThreadMessageLike` (from `converters.ts`) to adapt Mastra message formats to what Assistant UI expects.

*   **`useMastraClient.tsx`**:
    *   A straightforward hook that provides a memoized instance of the `MastraClient` from `@mastra/client-js`.
    *   It configures the Mastra server's `baseUrl`, defaulting to `http://localhost:4111` but can be overridden via the `NEXT_PUBLIC_MASTRA_BASE_URL` environment variable.

*   **`useSendMessage.tsx`**:
    *   Manages the entire lifecycle of sending user messages to the Mastra agent and processing the streamed responses.
    *   It initializes a Mastra agent instance using `client.getAgent(agentId)`.
    *   On load, it attempts to fetch existing messages for the current thread or creates a new thread if one doesn't exist for the given `threadId`.
    *   The `sendMessage` function is key:
        *   It optimistically appends the user's message to the local UI state.
        *   It then calls `agent.stream()` to send the message history to Mastra and receive a stream of events (text, tool calls, etc.).
        *   It uses Mastra's `stream.processDataStream({...})` method to register handlers for different parts of the response stream.
        *   These handlers update the message state in real-time, often using helper functions from `stream-processors.ts` to correctly format and append new message content.

*   **`useMastraThreadList.tsx`**:
    *   This hook is responsible for managing conversation threads. It allows fetching, displaying, and interacting with threads stored by Mastra.
    *   It provides an adapter compatible with Assistant UI's thread list components, offering functionalities such as:
        *   Fetching regular and archived threads using `client.getMemoryThreads()`.
        *   Archiving and unarchiving threads by updating thread metadata via `thread.update()`.
        *   Deleting threads using `thread.delete()`.
        *   Renaming threads via `thread.update()`.
        *   Switching to a newly created thread (`client.createMemoryThread()` followed by updating the active `threadId`).
        *   Switching between existing threads.

*   **`stream-processors.ts`**:
    *   Contains specialized handler functions like `handleOnTextPart`, `handleOnToolCallPart`, and `handleOnToolResultPart`.
    *   These functions are invoked by `useSendMessage` to process different types of data units received from the Mastra stream.
    *   Their primary role is to correctly update the Assistant UI's message state by formatting and appending new message parts (text, tool calls with arguments, tool results) as they arrive, ensuring the UI reflects the conversation progress accurately.

*   **`converters.ts`**:
    *   Provides essential utility functions for translating message structures between Assistant UI's internal format (e.g., `AppendMessage`, `ThreadMessageLike`) and Mastra's `CoreMessage` format.
    *   `appendMessageToCoreMessage`: Converts messages composed by Assistant UI into the format Mastra expects before they are sent to the agent.
    *   `coreMessageToThreadMessageLike`: Transforms messages received from Mastra into a structure that Assistant UI components can render.
    *   `coreMessagesToModifiedCoreMessages`: A crucial pre-processing step for messages fetched from Mastra. It intelligently combines related `tool_call` and `tool_result` parts from potentially separate Mastra messages into a single, coherent Assistant message object, which is vital for correctly displaying tool interactions in the UI.

### Custom Tool UI Example (`components/custom/weather-tool-ui.tsx`)

*   This file illustrates how to build a custom React component to render a user-friendly interface for a specific tool that the Mastra agent might invoke (e.g., a "getWeather" tool).
*   It uses the `makeAssistantToolUI` higher-order component from `@assistant-ui/react`. This function takes your tool's name and a render function.
*   The render function receives the tool's arguments (`args`), its current execution status (`status`), and the eventual result (`result`), allowing you to create a dynamic and informative UI for each stage of the tool's lifecycle. This significantly enhances the user experience when the AI uses tools.

## How It Works (Simplified Flow)

1.  **User Input**: The user types a message into the Assistant UI chat input.
2.  **Capture & Convert**: `assistant.tsx`, through `useMastraRuntime` and `useSendMessage`, captures this input. The `appendMessageToCoreMessage` function (from `converters.ts`) transforms the UI message into Mastra's `CoreMessage` format.
3.  **Send to Mastra**: The `agent.stream()` method (in `useSendMessage.tsx`) sends the formatted message (and conversation history) to the Mastra backend.
4.  **Mastra Processing & Streaming**: The Mastra agent processes the input and streams back responses. These can include text, requests to call tools, or other structured data.
5.  **Process Stream**: Back in `useSendMessage.tsx`, the `stream.processDataStream` method and its registered handlers (defined in `stream-processors.ts`) process these incoming stream parts.
6.  **Convert & Update UI**: As data arrives, it's converted back to Assistant UI's `ThreadMessageLike` format using `coreMessageToThreadMessageLike` (from `converters.ts`). The React state is updated, causing the UI to re-render dynamically, showing the ongoing conversation, including any custom tool UIs like `WeatherToolUI` if a tool is invoked.

## Getting Started / Running the Example

*(Please add instructions here on how to set up and run the project, e.g., prerequisites, environment variable setup (`.env.local`), `npm install`, `npm run dev` for the frontend, and how to run the Mastra server instance.)*

**Example Environment Variables (`frontend/.env.local`):**
```
NEXT_PUBLIC_MASTRA_BASE_URL=http://localhost:4111
```

## Key Takeaways

*   This example provides a robust and clear pattern for integrating Assistant UI with a separate Mastra backend.
*   The `frontend/mastra/` directory offers a well-structured, modular, and potentially reusable layer for all Mastra-specific communication logic.
*   It effectively demonstrates how to handle real-time streaming responses and complex tool interactions within a React application.
*   The project highlights the flexibility of Assistant UI in accommodating custom backends and enhancing user experience with custom UIs for agent tools.
