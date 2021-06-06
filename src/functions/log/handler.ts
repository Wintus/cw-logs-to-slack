import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import type { CloudWatchLogsEvent, Handler } from "aws-lambda";
import "source-map-support/register";
import { promisify } from "util";
import { unzip } from "zlib";

const unzipAsync = promisify(unzip);

const decode = async (data: string) => {
  const buffer = Buffer.from(data, "base64");
  return unzipAsync(buffer);
};

const client = new LambdaClient({});
const command = (json: Buffer) =>
  new InvokeCommand({
    InvocationType: "Event", // = async
    FunctionName: process.env.SLACK_ALERTER_ARN!,
    Payload: json, // FIXME: lib bug?
  });

const logHandler: Handler<CloudWatchLogsEvent> = async ({
  awslogs: { data },
}) => {
  const decodedData = await decode(data);
  const response = await client.send(command(decodedData));
  console.debug(response);
};

// noinspection JSUnusedGlobalSymbols
export const main = logHandler;
