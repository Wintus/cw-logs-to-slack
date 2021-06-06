import { handlerPath } from "@libs/handlerResolver";
import { FunctionEvent, FunctionConfig } from "@libs/lambda";

// accept only cloudwatchLog event
type Event = Extract<
  FunctionEvent,
  {
    cloudwatchLog: unknown;
  }
>;

export const factory = (
  events: Event[],
  slackWebhookUrl: string
): FunctionConfig => ({
  handler: `${handlerPath(__dirname)}/handler.main`,
  events,
  environment: {
    SLACK_WEBHOOK_URL: slackWebhookUrl,
  },
});
