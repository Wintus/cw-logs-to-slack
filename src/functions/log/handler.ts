import { middyfy } from "@libs/lambda";
import type {
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

const logHandler: Handler<CloudWatchLogsEvent> = async ({
  awslogs: { data },
}) => {
  const decoded = await decode(data);
  const log = decoded.toString("ascii");
  console.debug(log);
  return;
};

// noinspection JSUnusedGlobalSymbols
export const main = middyfy(logHandler);
