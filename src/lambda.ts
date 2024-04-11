import { Twilio } from 'twilio';
import { fetch as fetchAuthToken } from './authToken';
import { LambdaEvent } from './types';

export const handler = async ({ to, message }: LambdaEvent): Promise<void> => {
  let authToken: string | undefined;

  try {
    authToken = await fetchAuthToken(process.env.TWILIO_AUTH_TOKEN_PARAMETER_NAME!);
  } catch (error) {
    // Catch and log error, then rethrow generic error to prevent any sensitive data from being exposed
    console.error('An error occurred fetching the Auth Token. Error was %s', error);
    throw new Error('An error occurred fetching the auth token');
  }

  if (!authToken) {
    console.error('Auth token is not defined, unable to call the Twilio API');
    throw new Error('An auth token is required to send an SMS');
  }

  const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, authToken);

  try {
    const { sid } = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_FROM_PHONE_NUMBER,
      body: message
    });
    console.log(`Message (${sid}) has been successfully created`);
  } catch (error) {
    // Catch and log error, then rethrow generic error to prevent any sensitive data from being exposed
    console.error('An error occurred sending an SMS. Error was %s', error);
    throw new Error('An error occurred sending an SMS');
  }
};
