import { useExternalStoreRuntime } from "@assistant-ui/react";
import { useSendMessage } from "./use-send-message";
import { coreMessageToThreadMessageLike } from "./converters";
import { useMastraThreadList } from "./use-mastra-threadlist";

export const useMastraRuntime = () => {
	const { messages, setMessages, sendMessage, isRunning, isDisabled } =
		useSendMessage({
			config: {
				agentId: "mastraAgent",
				resourceId: "new-default-resource",
				threadId: "new-default-thread",
			},
		});

	const threadList = useMastraThreadList({
		agentId: "mastraAgent",
		threadId: "new-default-thread",
		resourceId: "new-default-resource",
	});

	return useExternalStoreRuntime({
		messages,
		setMessages,
		onNew: sendMessage,
		convertMessage: coreMessageToThreadMessageLike,
		isRunning,
		isDisabled,
		adapters: {
			threadList,
		},
	});
};
