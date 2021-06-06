import "source-map-support/register";
import type { Handler } from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";
import { schema } from "./schema";
import { promisify } from "util";
import { unzip } from "zlib";
import { middyfy } from "@libs/lambda";

type Schema = FromSchema<typeof schema>;

const unzipAsync = promisify(unzip);

const decode = async (data: string) => {
  const buffer = Buffer.from(data, "base64");
  return unzipAsync(buffer);
};

const logHandler: Handler<Schema> = async ({ awslogs: { data } }) => {
  const decoded = await decode(data);
  const log = decoded.toString("ascii");
  console.debug(log);
  return;
};

// noinspection JSUnusedGlobalSymbols
export const main = middyfy(logHandler);
