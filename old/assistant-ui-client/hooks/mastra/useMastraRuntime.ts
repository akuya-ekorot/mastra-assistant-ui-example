import {
	type AppendMessage,
	useExternalStoreRuntime,
	type AttachmentAdapter,
	type ExternalStoreThreadListAdapter,
	type FeedbackAdapter,
	type SpeechSynthesisAdapter,
	type ThreadSuggestion,
} from "@assistant-ui/react";
import { useMastraMessages } from "./useMastraMessages";
import type { UseMastraMessagesConfig } from "./useMastraMessages";
import { useCallback, useEffect, useState } from "react";
import { convertMastraMessages as convertMessage } from "./convertMastraMessages";

export interface UseMastraRuntimeParams {
	adapters:
		| {
				attachments?: AttachmentAdapter;
				feedback?: FeedbackAdapter;
				speech?: SpeechSynthesisAdapter;
				threadList?: ExternalStoreThreadListAdapter;
		  }
		| undefined;
	config: UseMastraMessagesConfig;
	onError?: (error: Error) => void;
}

export const useMastraRuntime = ({
	adapters,
	config,
	onError,
}: UseMastraRuntimeParams) => {
	const [isDisabled, setIsDisabled] = useState(false);
	const {
		isRunning,
		error,
		messages,
		cancel: onCancel,
		sendMessage,
		setMessages,
	} = useMastraMessages(config);

	console.log(messages);

	const suggestions: ThreadSuggestion[] | undefined = undefined;

	useEffect(() => {
		if (error && onError) {
			onError(error);
		}
	}, [error, onError]);

	const onNew = useCallback(
		async (appendMessage: AppendMessage) => {
			const userMessage =
				appendMessage.role === "user"
					? {
							role: appendMessage.role,
							content: appendMessage.content.filter(
								(part) =>
									part.type !== "audio" &&
									part.type !== "tool-call" &&
									part.type !== "reasoning" &&
									part.type !== "source",
							),
						}
					: undefined;

			if (userMessage) {
				await sendMessage([userMessage], config);
			}
		},
		[sendMessage, config],
	);

	return useExternalStoreRuntime({
		adapters,
		convertMessage,
		extras: undefined,
		isDisabled,
		isRunning,
		messages,
		async onAddToolResult(options) {
			console.log(options);
		},
		onCancel,
		async onEdit(message) {
			console.warn("onEdit", message);
		},
		onNew,
		async onReload(parentId, config) {
			console.warn("onReload", parentId, config);
		},
		setMessages,
		suggestions,
	});
};
