import { makeAssistantToolUI } from "@assistant-ui/react";

type WeatherToolArgs = {
	location: string;
};

type WeatherToolResult = string;

export const WeatherToolUI = makeAssistantToolUI<
	WeatherToolArgs,
	WeatherToolResult
>({
	toolName: "getWeather",
	render: ({ args, argsText, status, result }) => {
		let innerPart: React.ReactNode = null;
		switch (status.type) {
			case "running":
				innerPart = <div>Running with args: {argsText}</div>;
				break;
			case "complete":
				innerPart = <div>{result}</div>;
				break;
			case "requires-action":
				innerPart = <div>Requires action</div>;
				break;
			case "incomplete":
				switch (status.reason) {
					case "cancelled":
						innerPart = <div>Cancelled</div>;
						break;
					case "length":
						innerPart = <div>Length</div>;
						break;
					case "content-filter":
						innerPart = <div>Content filter</div>;
						break;
					case "other":
						innerPart = <div>Other</div>;
						break;
					case "error":
						innerPart = <div>{}</div>;
						break;
				}
		}
		return (
			<div className="flex flex-col gap-2 border rounded p-2">
				<div className="flex items-center gap-2">
					<div className="flex flex-col gap-0.5">
						<div className="font-semibold">Weather</div>
						<div className="text-xs text-muted-foreground">{args.location}</div>
					</div>
				</div>
				<hr />
				{innerPart}
			</div>
		);
	},
});
