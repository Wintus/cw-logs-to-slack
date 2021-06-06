import { middyfy } from "@libs/lambda";
import { IncomingWebhook } from "@slack/webhook";
import type {
  CloudWatchLogsDecodedData,
  CloudWatchLogsEvent,
  Handler,
} from "aws-lambda";
import "source-map-support/register";
import { promisify } from "util";
import { unzip } from "zlib";

const unzipAsync = promisify(unzip);

const decode = async (data: string) => {
  const buffer = Buffer.from(data, "base64");
  const decoded = await unzipAsync(buffer);
  const json = decoded.toString("ascii");
  return JSON.parse(json) as CloudWatchLogsDecodedData;
};

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
if (!slackWebhookUrl) {
  throw new Error("Missing Webhook URL");
}
const webhook = new IncomingWebhook(slackWebhookUrl);

const codeBlockSep = "```";

const logHandler: Handler<CloudWatchLogsEvent> = async ({
  awslogs: { data },
}) => {
  const { logGroup, logStream, logEvents } = await decode(data);
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
${message}
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
            text: "*Log Group*",
          },
          {
            type: "mrkdwn",
            text: "*Log Stream*",
          },
          {
            type: "plain_text",
            text: logGroup,
          },
          {
            type: "plain_text",
            text: logStream,
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
export const main = middyfy(logHandler);
