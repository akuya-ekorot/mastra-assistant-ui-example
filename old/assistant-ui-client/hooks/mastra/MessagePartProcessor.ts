import type { CoreAssistantMessage, CoreMessage } from "@mastra/core";

export type MessagePart = Extract<
	CoreMessage["content"],
	Array<unknown>
>[number] & { id: string; order: number; isComplete?: boolean };

export type StreamingMessage = Omit<CoreMessage, "content"> & {
	id: string;
	isComplete?: boolean;
	content: MessagePart[];
	parts: MessagePart[];
};

const getOrCreateAssistantMessage = (messages: StreamingMessage[]) => {
	const lastMessageIndex = messages.length - 1;
	const lastMessage = messages[lastMessageIndex];

	if (lastMessage.role === "assistant" && !lastMessage.isComplete) {
		return { message: lastMessage, messageIndex: lastMessageIndex };
	}

	return {
		message: {
			id: crypto.randomUUID(),
			role: "assistant" as const,
			content: [],
			parts: [],
			isComplete: false,
		},
		messageIndex: messages.length,
	};
};

const addPartToMessage = (
	message: StreamingMessage,
	part: Omit<MessagePart, "id" | "order" | "isComplete">,
) => {
	const newPart = {
		...part,
		id: crypto.randomUUID(),
		order: message.parts.length,
	} as MessagePart;

	message.parts.push(newPart);
};

const updateMessageContent = (message: StreamingMessage) => {
	const content: StreamingMessage["content"] = [];
	const toolCalls = new Map<
		string,
		Extract<
			StreamingMessage["content"][number],
			{ result: unknown } | { args: unknown }
		>
	>();

	for (const part of message.parts.sort((a, b) => a.order - b.order)) {
		const lastPart = content[content.length - 1];

		switch (part.type) {
			case "text": {
				if (lastPart?.type === "text") {
					lastPart.text += part.text;
				} else {
					content.push(part);
				}
				break;
			}
			case "image":
				content.push(part);
				break;
			case "file":
				content.push(part);
				break;
			case "reasoning": {
				if (lastPart?.type === "reasoning") {
					lastPart.text += part.text;
				} else {
					content.push(part);
				}
				break;
			}
			case "redacted-reasoning":
				if (lastPart?.type === "redacted-reasoning") {
					lastPart.data += part.data;
				} else {
					content.push(part);
				}
				break;
			case "tool-call":
				toolCalls.set(part.toolCallId, part);
				content.push(part);
				break;
			case "tool-result": {
				const toolCallIndex = message.content.findIndex(
					(p) => p.type === "tool-call" && p.toolCallId === part.toolCallId,
				);

				if (toolCallIndex !== -1) {
					message.content.splice(toolCallIndex, 1, {
						id: part.id,
						order: part.order,
						type: "tool-result",
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						result: part.result,
					});
				} else {
					content.push(part);
				}
				break;
			}
		}
	}

	message.content = content;
};

export const processTextPart = (
	messages: StreamingMessage[],
	part: string,
): StreamingMessage[] => {
	const { message, messageIndex } = getOrCreateAssistantMessage(messages);

	const a: Omit<Extract<MessagePart, { type: "text" }>, "id" | "order"> = {
		type: "text",
		text: part,
		isComplete: false,
	};

	addPartToMessage(message, a);
	updateMessageContent(message);

	console.log({ messages, part });

	return [
		...messages.slice(0, messageIndex),
		message,
		...messages.slice(messageIndex + 1),
	];
};
