"use client";

import { useThreadList } from "@assistant-ui/react";

export const ScratchComponent = () => {
	const threadList = useThreadList((s) => s.threads);

	return <pre>{JSON.stringify(threadList, null, 2)}</pre>;
};
