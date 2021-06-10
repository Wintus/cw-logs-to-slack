import type { AWS } from "@serverless/typescript";
import { factory as logHandler } from "@functions/log";
import { factory as slackAlerter } from "@functions/slack-webhook";

const alerterName = "SlackAlerter";
const alerterArn = {
  "Fn::GetAtt": [`${alerterName}LambdaFunction`, "Arn"] as const,
};

const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL!;

const serverlessConfiguration: AWS = {
  service: "CwLogsToSlack",
  frameworkVersion: "2",
  package: {
    individually: true,
  },
  plugins: ["serverless-webpack", "serverless-prune-plugin"],
  custom: {
    webpack: {
      packager: "yarn",
    },
    prune: {
      automatic: true,
      number: 3,
    },
  },
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
            Resource: "*", // TODO: narrow
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
    [alerterName]: slackAlerter(slackWebhookUrl),
  },
  configValidationMode: "error",
};

module.exports = serverlessConfiguration;
