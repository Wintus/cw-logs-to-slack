import { handlerPath } from "@libs/handlerResolver";
import { FunctionConfig } from "@libs/lambda";

export const logHandler: FunctionConfig = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      // TODO: setup filter by DI
      cloudwatchLog: {
        logGroup: "",
        filter: "",
      },
    },
  ],
};
