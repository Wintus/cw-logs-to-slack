import type { AWS } from "@serverless/typescript";
import { factory as logHandler } from "@functions/log";

const serverlessConfiguration: AWS = {
  service: "CwLogsToSlack",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    lambdaHashingVersion: "20201221",
  },
  functions: {
    logHandler: logHandler([
      {
        // TODO: setup filter
        cloudwatchLog: {
          logGroup: "",
          filter: "",
        },
      },
    ]),
  },
};

module.exports = serverlessConfiguration;
