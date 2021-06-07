import { handlerPath } from "@libs/handlerResolver";
import { FunctionConfig } from "@libs/lambda";

export const factory = (slackWebhookUrl: string): FunctionConfig => ({
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    SLACK_WEBHOOK_URL: slackWebhookUrl,
  },
});
