import type { AWS } from "@serverless/typescript";
import { factory as logHandler } from "@functions/log";
import { factory as slackAlerter } from "@functions/slack-webhook";

const alerterName = "slackAlerter";
const alerterArn = `!GetAtt ${alerterName}.Arn`;

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
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Resource: alerterArn,
            Action: "lambda:InvokeFunction",
          },
        ],
      },
    },
  },
  functions: {
    logHandler: logHandler(alerterArn, [
      {
        cloudwatchLog: {
          logGroup: "CloudTrail/DefaultLogGroup",
          filter:
            '{ ($.errorCode = "*UnauthorizedOperation") || ($.errorCode = "AccessDenied*") }',
        },
      },
    ]),
    [alerterName]: slackAlerter(process.env.SLACK_WEBHOOK_URL!),
  },
  configValidationMode: "error",
};

module.exports = serverlessConfiguration;
