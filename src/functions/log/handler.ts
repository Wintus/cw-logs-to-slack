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
  return unzipAsync(buffer);
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
  const decoded = await decode(data);
  const json = decoded.toString("ascii");
  const log = JSON.parse(json) as CloudWatchLogsDecodedData;
  console.dir(log);

  const { logGroup, logStream, logEvents } = log;
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
    // fallback text
    text: `${codeBlockSep}
${json}
${codeBlockSep}`,
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
