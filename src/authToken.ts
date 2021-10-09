import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

export const fetch = async (parameterName: string): Promise<string | undefined> => {
  const client = new SSMClient({});
  const response = await client.send(
    new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true
    })
  );
  return response.Parameter?.Value;
};
