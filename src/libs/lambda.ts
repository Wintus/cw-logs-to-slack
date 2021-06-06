import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import type { AWS } from "@serverless/typescript";
import type { Handler } from "aws-lambda";

export type FunctionConfig = NonNullable<AWS["functions"]>[string];
export type FunctionEvent = NonNullable<FunctionConfig["events"]>[number];

export const middyfy = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());
