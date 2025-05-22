import type { TextPart, ToolCall, ToolCallPart, ToolResult } from "ai";
import type {
	ModifiedAssistantContent,
	ModifiedCoreMessage,
} from "./use-send-message";

export const handleOnTextPart = (
	text: string,
	messages: ModifiedCoreMessage[],
): ModifiedCoreMessage[] => {
	const lastMessage = messages[messages.length - 1];

	if (lastMessage && lastMessage.role === "assistant") {
		if (typeof lastMessage.content === "string") {
			const updatedContent = lastMessage.content + text;
			return [
				...messages.slice(0, -1),
				{ ...lastMessage, content: updatedContent },
			];
		}

		const lastPart = lastMessage.content[lastMessage.content.length - 1];

		if (lastPart && lastPart.type === "text") {
			const updatedLastPart: TextPart = {
				...lastPart,
				text: lastPart.text + text,
			};
			return [
				...messages.slice(0, -1),
				{
					...lastMessage,
					content: [...lastMessage.content.slice(0, -1), updatedLastPart],
				},
			];
		}

		if (lastPart) {
			return [
				...messages.slice(0, -1),
				{
					...lastMessage,
					content: [...lastMessage.content, { type: "text", text }],
				},
			];
		}

		return [
			...messages.slice(0, -1),
			{
				...lastMessage,
				content: [{ type: "text", text }],
			},
		];
	}

	if (lastMessage) {
		return [
			...messages,
			{
				role: "assistant",
				content: [{ type: "text", text }],
			},
		];
	}

	return [{ role: "assistant", content: [{ type: "text", text }] }];
};

export const handleOnToolCallPart = (
	toolCall: ToolCall<string, unknown>,
	messages: ModifiedCoreMessage[],
): ModifiedCoreMessage[] => {
	const lastMessage = messages[messages.length - 1];

	if (lastMessage && lastMessage.role === "assistant") {
		if (typeof lastMessage.content === "string") {
			const updatedTextPart: TextPart = {
				type: "text",
				text: lastMessage.content,
			};
			const newToolCallPart = {
				type: "tool-call",
				args: toolCall.args,
				toolCallId: toolCall.toolCallId,
				toolName: toolCall.toolName,
			} satisfies ToolCallPart;

			const updatedContent = [updatedTextPart, newToolCallPart];

			return [
				...messages.slice(0, -1),
				{ ...lastMessage, content: updatedContent },
			];
		}

		return [
			...messages.slice(0, -1),
			{
				...lastMessage,
				content: [...lastMessage.content, { ...toolCall, type: "tool-call" }],
			},
		];
	}

	return [
		{
			role: "assistant",
			content: [{ ...toolCall, type: "tool-call" }],
		},
	];
};

export const handleOnToolResultPart = (
	toolResult: Omit<ToolResult<string, unknown, unknown>, "toolName" | "args">,
	messages: ModifiedCoreMessage[],
): ModifiedCoreMessage[] => {
	const lastMessage = messages[messages.length - 1];

	if (!lastMessage) return messages;

	if (lastMessage.role !== "assistant") return messages;

	if (typeof lastMessage.content === "string") return messages;

	const toolCall = lastMessage.content.find(
		(p) => p.type === "tool-call" && p.toolCallId === toolResult.toolCallId,
	);

	const toolCallIndex = lastMessage.content.findIndex(
		(p) => p.type === "tool-call" && p.toolCallId === toolResult.toolCallId,
	);

	if (!toolCall || toolCall.type !== "tool-call") return messages;

	const updatedToolCall = {
		...toolCall,
		type: "tool-call" as const,
		toolCallId: toolResult.toolCallId,
		result: toolResult.result,
	} satisfies Extract<ModifiedAssistantContent, unknown[]>[number];

	return [
		...messages.slice(0, -1),
		{
			...lastMessage,
			content: [
				...lastMessage.content.slice(0, toolCallIndex),
				updatedToolCall,
				...lastMessage.content.slice(toolCallIndex + 1),
			],
		},
	];
};
