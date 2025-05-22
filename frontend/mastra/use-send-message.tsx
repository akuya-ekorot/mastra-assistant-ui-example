import { useCallback, useState } from "react";
import { useMastraClient } from "./use-mastra-client";
import type {
	CoreAssistantMessage,
	CoreMessage,
	ToolCallPart,
	ToolResultPart,
} from "ai";
import { useContentPartRuntime, type AppendMessage } from "@assistant-ui/react";
import { appendMessageToCoreMessage } from "./converters";
import {
	handleOnTextPart,
	handleOnToolCallPart,
	handleOnToolResultPart,
} from "./stream-processors";

interface UseSendMessageArgs {
	config: {
		agentId: string;
		resourceId: string;
		threadId: string;
	};
}

export type ModifiedAssistantContent =
	| string
	| (
			| Extract<
					Extract<CoreAssistantMessage["content"], unknown[]>[number],
					{ type: "text" | "reasoning" | "redacted-reasoning" | "file" }
			  >
			| (Omit<ToolCallPart & Omit<ToolResultPart, "type">, "result"> &
					Partial<Pick<ToolResultPart, "result">>)
	  )[];

type ModifiedCoreAssistantMessage = Omit<
	Extract<CoreMessage, { role: "assistant" }>,
	"content"
> & {
	content: ModifiedAssistantContent;
};
export type ModifiedCoreMessage =
	| Extract<CoreMessage, { role: "user" | "system" | "tool" }>
	| ModifiedCoreAssistantMessage;

export const useSendMessage = (args: UseSendMessageArgs) => {
	const [messages, setMessages] = useState<ModifiedCoreMessage[]>([]);

	const client = useMastraClient();
	const agent = client.getAgent(args.config.agentId);

	const sendMessage = useCallback(
		async (message: AppendMessage) => {
			const userMessage = appendMessageToCoreMessage(message);

			setMessages((prev) => [...prev, userMessage]);

			const stream = await agent.stream({
				messages: [userMessage],
				resourceId: args.config.resourceId,
				threadId: args.config.threadId,
			});

			stream.processDataStream({
				onDataPart(streamPart) {
					console.warn("onDataPart not implemented", streamPart);
				},
				onErrorPart(streamPart) {
					console.warn("onErrorPart not implemented", streamPart);
				},
				onFilePart(streamPart) {
					console.warn("onFilePart not implemented", streamPart);
				},
				onFinishMessagePart(streamPart) {
					console.warn("onFinishMessagePart not implemented", streamPart);
				},
				onFinishStepPart(streamPart) {
					console.warn("onFinishStepPart not implemented", streamPart);
				},
				onMessageAnnotationsPart(streamPart) {
					console.warn("onMessageAnnotationsPart not implemented", streamPart);
				},
				onReasoningPart(streamPart) {
					console.warn("onReasoningPart not implemented", streamPart);
				},
				onReasoningSignaturePart(streamPart) {
					console.warn("onReasoningSignaturePart not implemented", streamPart);
				},
				onRedactedReasoningPart(streamPart) {
					console.warn("onRedactedReasoningPart not implemented", streamPart);
				},
				onSourcePart(streamPart) {
					console.warn("onSourcePart not implemented", streamPart);
				},
				onStartStepPart(streamPart) {
					console.warn("onStartStepPart not implemented", streamPart);
				},
				onTextPart(text) {
					setMessages((messages) => handleOnTextPart(text, messages));
				},
				onToolCallDeltaPart(streamPart) {
					console.warn("onToolCallDeltaPart not implemented", streamPart);
				},
				onToolCallPart(toolCall) {
					setMessages((messages) => handleOnToolCallPart(toolCall, messages));
				},
				onToolCallStreamingStartPart(streamPart) {
					console.warn(
						"onToolCallStreamingStartPart not implemented",
						streamPart,
					);
				},
				onToolResultPart(toolResult) {
					setMessages((messages) =>
						handleOnToolResultPart(toolResult, messages),
					);
				},
			});
		},
		[agent.stream, args.config.resourceId, args.config.threadId],
	);

	return {
		messages,
		setMessages,
		sendMessage,
	};
};
