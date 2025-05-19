import type {
	AddToolResultOptions,
	AppendMessage,
	CreateStartRunConfig,
	ExternalStoreMessageConverter,
	ExternalStoreThreadListAdapter,
	ThreadMessageLike,
} from "@assistant-ui/react";
import type { CoreMessage } from "@mastra/core";
import type {
	FilePart,
	ImagePart,
	TextPart,
	ToolCallPart,
	ToolResultPart,
} from "ai";
import { useCallback, useState } from "react";
import { MASTRA_AGENT_ID, useMastraClient } from "./use-mastra-client";
import { useMastraThreadListAdapter } from "./use-mastra-threadlist-adapter";

const convertAssistantUIMessageToMastraMessage = (
	message: AppendMessage,
): CoreMessage => {
	switch (message.role) {
		case "system": {
			if (
				Array.isArray(message.content) &&
				message.content.length === 1 &&
				"text" in message.content[0]
			) {
				return {
					role: "system" as const,
					content: message.content[0].text,
				};
			}

			throw new Error("Unexpected system message format");
		}
		case "user": {
			return {
				role: "user",
				content: message.content as (TextPart | ImagePart | FilePart)[],
			};
		}
		case "assistant": {
			return {
				role: "assistant",
				content: message.content as (
					| TextPart
					| ImagePart
					| FilePart
					| ToolCallPart
				)[],
			};
		}
	}
};

export const useMastraStoreAdapter = () => {
	const [isDisabled, setIsDisabled] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [messages, setMessages] = useState<readonly CoreMessage[]>([]);
	const [error, setError] = useState<Error | null>();
	const client = useMastraClient();
	const agent = client.getAgent(MASTRA_AGENT_ID);

	const handleError = useCallback((e: unknown, operation: string) => {
		const errorObj = e instanceof Error ? e : new Error(String(e));
		console.error(`${operation} failed:`, errorObj);
		setError(errorObj);
		setIsRunning(false);
		setIsDisabled(false);
		return errorObj;
	}, []);

	const onNew = useCallback(
		async (message: AppendMessage) => {
			try {
				setIsRunning(true);
				setIsDisabled(true);
				setError(null);

				const userMessage = convertAssistantUIMessageToMastraMessage(message);
				setMessages((prev) => [...prev, userMessage]);

				const initialAssistantMessage: CoreMessage = {
					role: "assistant",
					content: [{ type: "text", text: "" }],
				};

				setMessages((prev) => [...prev, initialAssistantMessage]);

				// get stream response from mastra
				const response = await agent.stream({
					messages: [userMessage],
					threadId: "default-thread",
					resourceId: "default-resource",
				});

				let assistantMessageText = "";
				const assistantToolCalls: (ToolCallPart &
					Partial<Pick<ToolResultPart, "result">>)[] = [];

				response.processDataStream({
					onTextPart: (text) => {
						assistantMessageText += text;
						setMessages((prev) => {
							const updatedMessages = [...prev];
							const lastMessageIndex = updatedMessages.length - 1;
							const assistantMessage = updatedMessages[lastMessageIndex];

							if (
								assistantMessage &&
								assistantMessage.role === "assistant" &&
								Array.isArray(assistantMessage.content)
							) {
								const updatedContent = [];
								let textPartFound = false;

								for (const part of assistantMessage.content) {
									if (part.type === "text") {
										textPartFound = true;
										updatedContent.push({
											...part,
											text: assistantMessageText,
										});
										continue;
									}
									updatedContent.push(part);
								}

								if (!textPartFound) {
									updatedContent.push({
										type: "text" as const,
										text: assistantMessageText,
									});
								}

								updatedMessages[lastMessageIndex] = {
									...assistantMessage,
									content: updatedContent,
								};
							}

							return updatedMessages;
						});
					},
					onDataPart: (data) => {
						console.error("Data part not supported by this adapter yet");
					},
					onFilePart: (file) => {
						console.error("File part not supported by this adapter yet");
					},
					onToolCallPart: (toolCall) => {
						assistantToolCalls.push({
							...toolCall,
							type: "tool-call",
						});

						setMessages((prev) => {
							const updatedMessages = [...prev];
							const lastMessageIndex = prev.length - 1;
							const lastAssistantMessage = updatedMessages[lastMessageIndex];

							if (
								lastAssistantMessage &&
								lastAssistantMessage.role === "assistant" &&
								Array.isArray(lastAssistantMessage.content)
							) {
								const updatedContent = [];
								let toolCallFound = false;

								for (const part of lastAssistantMessage.content) {
									if (
										part.type === "tool-call" &&
										part.toolCallId === toolCall.toolCallId
									) {
										toolCallFound = true;
										updatedContent.push({
											...part,
											toolCallId: toolCall.toolCallId,
										});
										continue;
									}

									updatedContent.push(part);
								}

								if (!toolCallFound) {
									updatedContent.push({
										type: "tool-call" as const,
										toolCallId: toolCall.toolCallId,
										toolName: toolCall.toolName,
										args: toolCall.args,
									});
								}

								updatedMessages[lastMessageIndex] = {
									...lastAssistantMessage,
									content: updatedContent,
								};
							}

							return updatedMessages;
						});
					},
					onToolResultPart: (toolResult) => {
						// find the tool call with similar toolCallId
						const associatedToolCall = assistantToolCalls.find(
							(toolCall) => toolCall.toolCallId === toolResult.toolCallId,
						);

						if (!associatedToolCall) {
							return;
						}

						setMessages((prev) => {
							const updatedMessages = [...prev];
							const lastMessageIndex = prev.length - 1;
							const lastAssistantMessage = updatedMessages[lastMessageIndex];

							if (
								lastAssistantMessage &&
								lastAssistantMessage.role === "assistant" &&
								Array.isArray(lastAssistantMessage.content)
							) {
								const updatedContent = lastAssistantMessage.content.map(
									(part) => {
										if (
											part.type === "tool-call" &&
											part.toolCallId === toolResult.toolCallId
										) {
											return {
												...part,
												result: toolResult.result,
											};
										}
										return part;
									},
								);

								updatedMessages[lastMessageIndex] = {
									...lastAssistantMessage,
									content: updatedContent,
								};
							}

							return updatedMessages;
						});
					},
					onReasoningPart: (reasoning) => {
						console.error("Reasoning not supported by this adapter yet");
					},
					onRedactedReasoningPart: (redactedReasoning) => {
						console.error(
							"Redacted reasoning not supported by this adapter yet",
						);
					},
					onErrorPart: (error) => {
						console.error("Error not supported by this adapter yet");
					},
					onFinishMessagePart: (finishMessagePart) => {
						console.error(
							"Finish message part not supported by this adapter yet",
						);
					},
					onFinishStepPart: (finishStepPart) => {
						console.error("Finish step part not supported by this adapter yet");
					},
				});
			} catch (error) {
				handleError(error, "onNew");
			} finally {
				setIsRunning(false);
				setIsDisabled(false);
			}
		},
		[agent.stream, handleError],
	);

	const convertMessage: ExternalStoreMessageConverter<CoreMessage> =
		useCallback((message, idx) => {
			return message as ThreadMessageLike;
		}, []);

	const onEdit = useCallback(async (message: AppendMessage) => {}, []);

	const onAddToolResult = useCallback(
		async (options: AddToolResultOptions) => {},
		[],
	);

	const onCancel = useCallback(async () => {}, []);

	const onReload = useCallback(
		async (parentId: string | null, startRunConfig: CreateStartRunConfig) => {},
		[],
	);

	return {
		isDisabled,
		isRunning,
		messages,
		setMessages,
		onNew,
		convertMessage,
		onEdit,
		onAddToolResult,
		onCancel,
		onReload,
		adapters: {
			threadList: useMastraThreadListAdapter("default-thread"),
		},
	};
};
