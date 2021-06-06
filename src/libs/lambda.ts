import type { AWS } from "@serverless/typescript";
export type FunctionConfig = AWS["functions"][string];

import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";

export const middyfy = (handler) => {
  return middy(handler).use(middyJsonBodyParser());
};
