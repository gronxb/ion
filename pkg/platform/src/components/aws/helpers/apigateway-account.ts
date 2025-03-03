import * as aws from "@pulumi/aws";

export function setupApiGatewayAccount(namePrefix: string) {
  const account = aws.apigateway.Account.get(
    `${namePrefix}APIGatewayAccount`,
    "APIGatewayAccount",
  );

  return account.cloudwatchRoleArn.apply((arn) => {
    if (arn) return account;

    const role = new aws.iam.Role(
      `APIGatewayPushToCloudWatchLogsRole`,
      {
        assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "apigateway.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        }),
        managedPolicyArns: [
          "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs",
        ],
      },
      { retainOnDelete: true },
    );

    return new aws.apigateway.Account(`${namePrefix}APIGatewayAccountSetup`, {
      cloudwatchRoleArn: role.arn,
    });
  });
}
