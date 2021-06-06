import type { AWS } from "@serverless/typescript";
import type { Handler } from "aws-lambda";

export type FunctionConfig = NonNullable<AWS["functions"]>[string];

import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";

export const middyfy = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());
