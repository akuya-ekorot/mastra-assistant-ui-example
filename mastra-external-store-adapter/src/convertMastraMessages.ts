import type {
	useExternalMessageConverter,
	ThreadMessage,
	ThreadMessageLike,
	ExternalStoreMessageConverter,
} from "@assistant-ui/react";
import type { CoreMessage } from "@mastra/core";

export type ReadonlyJSONArray = readonly ReadonlyJSONValue[];
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

const previousToolCallId = new Map<string, ReadonlyJSONObject>();

const contentToParts = (content: CoreMessage["content"]) => {
	if (typeof content === "string") {
		return [{ type: "text" as const, text: content }];
	}

	return content
		.map((part): ThreadMessage["content"][number] | null => {
			switch (part.type) {
				case "text":
					return { type: "text", text: part.text ?? "" };
				case "image":
					return { type: "image", image: (part.image ?? "").toString() };
				case "reasoning":
					return { type: "reasoning", text: part.text ?? "" };
				case "redacted-reasoning":
					return { type: "reasoning", text: part.data ?? "" };
				case "file":
					return {
						type: "file",
						mimeType: part.mimeType ?? "",
						data: (part.data ?? "").toString(),
					};
				case "tool-call":
					previousToolCallId.set(
						part.toolCallId,
						part.args as ReadonlyJSONObject,
					);
					return {
						type: "tool-call",
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						args: part.args as ReadonlyJSONObject,
						argsText: JSON.stringify(part.args),
						result: undefined,
					};
				case "tool-result":
					return {
						type: "tool-call",
						toolCallId: part.toolCallId,
						toolName: part.toolName,
						args: previousToolCallId.get(part.toolCallId) ?? {},
						argsText: JSON.stringify(previousToolCallId.get(part.toolCallId)),
						result: part.result,
					};
				default:
					return null;
			}
		})
		.filter((part) => part != null);
};

export const convertMastraMessages: ExternalStoreMessageConverter<
	CoreMessage
> = (message): ThreadMessageLike => {
	switch (message.role) {
		case "system":
			return {
				role: "system",
				content: [
					{
						type: "text",
						text: typeof message.content === "string" ? message.content : "",
					},
				],
			};

		case "user":
			return {
				role: "user",
				content: contentToParts(message.content),
			};
		case "assistant":
			return {
				role: "assistant",
				content: contentToParts(message.content),
			};
		case "tool":
			return {
				role: "assistant",
				content: contentToParts(message.content),
			};
		default:
			throw new Error(`Unknown message role: ${message}`);
	}
};
