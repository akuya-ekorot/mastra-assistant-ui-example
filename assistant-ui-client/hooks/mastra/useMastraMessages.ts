import { MastraClient } from "@mastra/client-js";
import type { CoreMessage, OutputType } from "@mastra/core";
import { useCallback, useMemo, useRef, useState } from "react";
import { useMastraClient } from "./useMastraClient";
import {
	type MessagePart,
	processTextPart,
	type StreamingMessage,
} from "./MessagePartProcessor";

export interface UseMastraMessagesConfig {
	agentId: string;
	threadId: string;
	resourceId: string;
	/**
	 * @default process.env.NEXT_PUBLIC_MASTRA_BASE_URL or "http://localhost:4111"
	 */
	baseUrl?: string;
	maxSteps?: number;
	temperature?: number;
	instructions?: string;
	output?: OutputType;
	abortSignal?: AbortSignal;
}

export const useMastraMessages = (config: UseMastraMessagesConfig) => {
	const [messages, setMessages] = useState<StreamingMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	const mastraClient = useMastraClient(config.baseUrl);
	const agent = mastraClient.getAgent(config.agentId);

	const sendMessage = useCallback(
		async (messages: CoreMessage[], config: UseMastraMessagesConfig) => {
			const messagesWithIds = messages.map(
				(message) =>
					({
						...message,
						isComplete: false,
						parts: [],
						content:
							typeof message.content === "string"
								? [
										{
											type: "text",
											text: message.content,
											id: crypto.randomUUID(),
											order: 1,
										},
									]
								: message.content.map(
										(p, i) =>
											({
												...p,
												isComplete: false,
												id: crypto.randomUUID(),
												order: i,
											}) satisfies MessagePart,
									),
						id: crypto.randomUUID(),
					}) satisfies StreamingMessage,
			);

			setMessages((prev) => [...prev, ...messagesWithIds]);
			setIsRunning(true);
			setError(null);

			const abortController = new AbortController();
			abortControllerRef.current = abortController;

			try {
				const stream = await agent.stream({
					messages,
					threadId: config.threadId,
					resourceId: config.resourceId,
					maxSteps: config.maxSteps,
					temperature: config.temperature,
					instructions: config.instructions,
					output: config.output,
					// abortSignal: abortController.signal,
				});

				console.log(stream);

				stream.processDataStream({
					onDataPart(streamPart) {},
					onErrorPart(streamPart) {
						console.log(streamPart);
					},
					onFilePart(streamPart) {},
					onFinishMessagePart(streamPart) {},
					onFinishStepPart(streamPart) {},
					onMessageAnnotationsPart(streamPart) {},
					onReasoningPart(streamPart) {},
					onReasoningSignaturePart(streamPart) {},
					onRedactedReasoningPart(streamPart) {},
					onSourcePart(streamPart) {},
					onStartStepPart(streamPart) {},
					onTextPart(streamPart) {
						console.log({ streamPart });
						setMessages(processTextPart(messagesWithIds, streamPart));
					},
					onToolCallDeltaPart(streamPart) {},
					onToolCallPart(streamPart) {},
					onToolCallStreamingStartPart(streamPart) {},
					onToolResultPart(streamPart) {},
				});
			} catch (err) {
				setError(
					err instanceof Error ? err : new Error("Unknown error occurred"),
				);
			} finally {
				setIsRunning(false);
				abortControllerRef.current = null;
			}
		},
		[agent.stream],
	);

	const cancel = useCallback(async () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			setIsRunning(false);
		}
	}, []);

	return {
		isRunning,
		error,
		messages,
		cancel,
		sendMessage,
		setMessages,
	};
};
