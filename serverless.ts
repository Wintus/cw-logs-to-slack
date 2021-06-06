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
    region: "ap-northeast-1",
    runtime: "nodejs14.x",
    memorySize: 128, // = min
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
    logHandler: logHandler(
      [
        {
          cloudwatchLog: {
            logGroup: "CloudTrail/DefaultLogGroup",
            filter:
              '{ ($.errorCode = "*UnauthorizedOperation") || ($.errorCode = "AccessDenied*") }',
          },
        },
      ],
      process.env.SLACK_WEBHOOK_URL!
    ),
  },
};

module.exports = serverlessConfiguration;
