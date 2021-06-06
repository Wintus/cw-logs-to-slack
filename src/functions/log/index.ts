import { handlerPath } from "@libs/handlerResolver";
import { FunctionEvent, FunctionConfig } from "@libs/lambda";

// accept only cloudwatchLog event
type Event = Extract<
  FunctionEvent,
  {
    cloudwatchLog: unknown;
  }
>;

export const factory = (target: string, events: Event[]): FunctionConfig => ({
  handler: `${handlerPath(__dirname)}/handler.main`,
  events,
  environment: {
    SLACK_ALERTER_ARN: target,
  },
});
