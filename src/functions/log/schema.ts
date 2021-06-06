export const schema = {
  type: "object",
  properties: {
    awslogs: {
      type: "object",
      properties: {
        data: {
          type: "string",
          contentEncoding: "base64",
          contentMediaType: "text/plain",
          description: "Base64 encoded GZIP compressed log",
        },
      },
      required: ["data"],
    },
  },
  required: ["awslogs"],
} as const;
