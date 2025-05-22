import { useExternalStoreRuntime } from "@assistant-ui/react";
import { useSendMessage } from "./use-send-message";
import { coreMessageToThreadMessageLike } from "./converters";

export const useMastraRuntime = () => {
	const { messages, setMessages, sendMessage } = useSendMessage({
		config: {
			agentId: "mastraAgent",
			resourceId: "new-default-resource",
			threadId: "new-default-thread",
		},
	});

	return useExternalStoreRuntime({
		messages,
		setMessages,
		onNew: sendMessage,
		convertMessage: coreMessageToThreadMessageLike,
	});
};
