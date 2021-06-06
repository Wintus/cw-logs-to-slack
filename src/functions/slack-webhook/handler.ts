import "source-map-support/register";
import { IncomingWebhook } from "@slack/webhook";
import type { CloudWatchLogsDecodedData, Handler } from "aws-lambda";
// @ts-ignore
import { format } from "json-string-formatter";

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
if (!slackWebhookUrl) {
  throw new Error("Missing Webhook URL");
}
const webhook = new IncomingWebhook(slackWebhookUrl);

const codeBlockSep = "```";

const slackAlerter: Handler<CloudWatchLogsDecodedData> = async ({
  logGroup,
  logStream,
  subscriptionFilters,
  logEvents,
}) => {
  const filters = subscriptionFilters.map((s) => `* ${s}`).join("\n");
  const eventBlocks = logEvents.map(({ id, message, timestamp }) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `
id = \`${id}\`
timestamp = \`${timestamp}\`
happened at = \`${new Date(timestamp)}\`
message:
${codeBlockSep}
${format(message)}
${codeBlockSep}`,
    },
  }));

  const sent = await webhook.send({
    text: "Unexpected block fallback happened",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":rotating_light: Alert from CloudWatch Logs",
        },
      },
      {
        type: "section",
        // 2 columns
        fields: [
          {
            type: "mrkdwn",
            text: `*Log Group*
${logGroup}`,
          },
          {
            type: "mrkdwn",
            text: `*Log Stream*
${logStream}`,
          },
          {
            type: "mrkdwn",
            text: `*Subscription Filters*
${filters}`,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Log Events*",
        },
      },
      ...eventBlocks,
    ],
  });
  console.debug(sent);
};

// noinspection JSUnusedGlobalSymbols
export const main = slackAlerter;
