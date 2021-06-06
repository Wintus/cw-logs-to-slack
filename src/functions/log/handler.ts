import "source-map-support/register";

import { middyfy } from "@libs/lambda";
import type { Handler } from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

import { schema } from "./schema";

type Schema = FromSchema<typeof schema>;

const logHandler: Handler<Schema> = async (event) => {
  const data = event.awslogs.data;
  console.debug(data);
  return;
};

// noinspection JSUnusedGlobalSymbols
export const main = middyfy(logHandler);
