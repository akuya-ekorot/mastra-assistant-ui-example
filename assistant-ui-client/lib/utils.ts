import { ReasoningContentPart } from "@assistant-ui/react";
import type {
	CoreMessage,
	FilePart,
	ImagePart,
	TextPart,
	ToolCallPart,
	ToolContent,
} from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function updateTextParts(
	parts: CoreMessage["content"],
	newText: string,
): CoreMessage["content"] {
	if (typeof parts === "string") {
		return parts + newText;
	}

	const lastPart = parts[parts.length - 1];
	if (lastPart.type === "text") {
		const updatedLastPart = { ...lastPart, text: lastPart.text + newText };
		return [...parts.slice(0, -1), updatedLastPart] as CoreMessage["content"];
	}

	return [...parts, { type: "text", text: newText }] as CoreMessage["content"];
}

export function updateToolCallParts(
	parts: CoreMessage["content"],
): CoreMessage["content"] {
	return [];
}

export function updateToolResultParts(
	parts: CoreMessage["content"],
): CoreMessage["content"] {
	return [];
}

export function updateToolDataParts(
	parts: CoreMessage["content"],
): CoreMessage["content"] {
	return [];
}

export function updateFileParts(
	parts: CoreMessage["content"],
): CoreMessage["content"] {
	return [];
}

export function updateReasoningParts(
	parts: CoreMessage["content"],
): CoreMessage["content"] {
	return [];
}

export function updateRedactedReasoningParts(
	parts: CoreMessage["content"],
): CoreMessage["content"] {
	return [];
}
