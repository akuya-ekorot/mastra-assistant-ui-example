import type {
	AppendMessage,
	FileContentPart,
	ImageContentPart,
	ReasoningContentPart,
	TextContentPart,
	ThreadMessageLike,
	ToolCallContentPart,
} from "@assistant-ui/react";
import type {
	CoreAssistantMessage,
	CoreMessage,
	CoreSystemMessage,
	CoreUserMessage,
	FilePart,
	ImagePart,
	TextPart,
	ToolCallPart,
} from "ai";
import type { ModifiedCoreMessage } from "./use-send-message";

export type ReadonlyJSONValue =
	| null
	| string
	| number
	| boolean
	| ReadonlyJSONObject
	| ReadonlyJSONArray;

export type ReadonlyJSONObject = {
	readonly [key: string]: ReadonlyJSONValue;
};

export type ReadonlyJSONArray = readonly ReadonlyJSONValue[];

type AppendMessagePartsToCoreMessagePartsResult = Extract<
	CoreMessage["content"],
	unknown[]
>;

const appendMessagePartsToCoreMessageParts = (
	parts: AppendMessage["content"],
): AppendMessagePartsToCoreMessagePartsResult => {
	return parts.map((part) => {
		switch (part.type) {
			case "text":
				return { type: part.type, text: part.text } satisfies TextPart;
			case "image":
				return { type: part.type, image: part.image } satisfies ImagePart;
			case "file":
				return {
					type: part.type,
					mimeType: part.mimeType,
					data: part.data,
				} satisfies FilePart;
			case "reasoning":
				return { type: part.type, text: part.text };
			case "tool-call":
				return {
					type: "tool-call",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					args: part.args,
				} satisfies ToolCallPart;
			default:
				throw new Error(`Unsupported part type: ${part.type}`);
		}
	});
};

export const appendMessageToCoreMessage = (
	message: AppendMessage,
): ModifiedCoreMessage => {
	switch (message.role) {
		case "system": {
			const content = message.content
				.filter((p) => p.type === "text")
				.map((p) => p.text)
				.join("\n");

			const systemMessage: CoreSystemMessage = {
				role: "system",
				content,
			};

			return systemMessage;
		}
		case "user": {
			return {
				role: "user",
				content: appendMessagePartsToCoreMessageParts(message.content),
			} as CoreUserMessage;
		}
		case "assistant":
			return {
				role: "assistant",
				content: appendMessagePartsToCoreMessageParts(message.content),
			} as CoreAssistantMessage;
	}
};

const coreMessagePartsToThreadMessageLikeParts = (
	parts: CoreMessage["content"],
): ThreadMessageLike["content"] => {
	if (typeof parts === "string") {
		return [{ type: "text", text: parts }];
	}

	const toolCallsArgsMap = new Map<string, ReadonlyJSONObject>();

	return parts.map((part) => {
		switch (part.type) {
			case "reasoning":
				return {
					type: "reasoning",
					text: part.text,
				} satisfies ReasoningContentPart;
			case "image":
				return {
					type: part.type,
					image: part.image.toString(),
				} satisfies ImageContentPart;
			case "text":
				return {
					type: part.type,
					text: part.text,
				} satisfies TextContentPart;
			case "file":
				return {
					type: part.type,
					data: part.data.toString(),
					mimeType: part.mimeType,
				} satisfies FileContentPart;
			case "redacted-reasoning":
				return {
					type: "reasoning",
					text: part.data,
				} satisfies ReasoningContentPart;
			case "tool-call": {
				toolCallsArgsMap.set(part.toolCallId, part.args as ReadonlyJSONObject);
				return {
					type: part.type,
					args: part.args as ReadonlyJSONObject,
					argsText: JSON.stringify(part.args),
					toolCallId: part.toolCallId,
					toolName: part.toolName,
				} satisfies ToolCallContentPart;
			}
			case "tool-result": {
				const args = toolCallsArgsMap.get(part.toolCallId) ?? {};

				return {
					type: "tool-call",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					args,
					argsText: JSON.stringify(args),
					result: part.result,
					isError: part.isError,
				} satisfies ToolCallContentPart;
			}
		}
	});
};

export const coreMessageToThreadMessageLike = (
	message: CoreMessage,
): ThreadMessageLike => {
	switch (message.role) {
		case "system":
			return {
				role: "system",
				content: coreMessagePartsToThreadMessageLikeParts(message.content),
			};
		case "user":
			return {
				role: "user",
				content: coreMessagePartsToThreadMessageLikeParts(message.content),
			};
		case "tool":
		case "assistant":
			return {
				role: "assistant",
				content: coreMessagePartsToThreadMessageLikeParts(message.content),
			};
	}
};
