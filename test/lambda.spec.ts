import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { handler } from '../src/lambda';
import { LambdaEvent } from '../src/types';

let accountSid: string | undefined;
let authToken: string | undefined;
let options: { [name: string]: any } | undefined;
const createMessageMock = jest.fn();

jest.mock('twilio', () => ({
  Twilio: jest.fn((username, password, config) => {
    accountSid = username;
    authToken = password;
    options = config;

    return {
      messages: {
        create: createMessageMock
      }
    };
  })
}));

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();

describe('Given I want to send a message on a cron', () => {
  describe('When the handler function is called', () => {
    let spiedGetParameter: jest.SpyInstance;

    // Ideally this should be a before all but jest clears the mocks down before each test and I don't want to disable that functionality
    beforeEach(async () => {
      process.env.TWILIO_ACCOUNT_SID = 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      process.env.TWILIO_AUTH_TOKEN_PARAMETER_NAME = '/twilio/authToken';
      process.env.TWILIO_FROM_PHONE_NUMBER = '+447987654321';

      const event: LambdaEvent = {
        to: '+447123456789',
        message: 'This is a test message'
      };

      spiedGetParameter = jest.spyOn(SSMClient.prototype, 'send').mockImplementation(() =>
        Promise.resolve({
          Parameter: {
            Value: 'abc1234'
          }
        })
      );

      createMessageMock.mockImplementation(() => ({ sid: 'SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }));

      await handler(event);
    });

    test('Then the get parameter command should have been called once', () => {
      expect(spiedGetParameter).toHaveBeenCalledWith(expect.any(GetParameterCommand));
      expect(spiedGetParameter).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Name: '/twilio/authToken',
            WithDecryption: true
          }
        })
      );
    });

    test('Then the Twilio client should have been configured', () => {
      expect(accountSid).toEqual('ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(authToken).toEqual('abc1234');
      expect(options).toBeUndefined();
    });

    test('Then a message should have been created', () => {
      expect(createMessageMock).toHaveBeenCalledWith({
        to: '+447123456789',
        from: '+447987654321',
        body: 'This is a test message'
      });
    });
  });

  describe('When the auth token cannot be fetched', () => {
    let testSubject: () => Promise<void>;

    beforeEach(async () => {
      process.env.TWILIO_ACCOUNT_SID = 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      process.env.TWILIO_AUTH_TOKEN_PARAMETER_NAME = '/twilio/authToken';
      process.env.TWILIO_FROM_PHONE_NUMBER = '+447987654321';

      const event: LambdaEvent = {
        to: '+447123456789',
        message: 'This is a test message'
      };

      jest.spyOn(SSMClient.prototype, 'send').mockImplementation(() => Promise.reject('An error occurred'));

      testSubject = async () => handler(event);
    });

    test('Then an error should have been thrown', async () => {
      await expect(testSubject).rejects.toThrow(new Error('An error occurred fetching the auth token'));
    });
  });

  describe('When the auth token is null', () => {
    let testSubject: () => Promise<void>;

    beforeEach(async () => {
      process.env.TWILIO_ACCOUNT_SID = 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      process.env.TWILIO_AUTH_TOKEN_PARAMETER_NAME = '/twilio/authToken';
      process.env.TWILIO_FROM_PHONE_NUMBER = '+447987654321';

      const event: LambdaEvent = {
        to: '+447123456789',
        message: 'This is a test message'
      };

      jest.spyOn(SSMClient.prototype, 'send').mockImplementation(() =>
        Promise.resolve({
          Parameter: null
        })
      );

      testSubject = async () => handler(event);
    });

    test('Then an error should have been thrown', async () => {
      await expect(testSubject).rejects.toThrow(new Error('An auth token is required to send an SMS'));
    });
  });

  describe('When the message fails to send', () => {
    let testSubject: () => Promise<void>;

    beforeEach(async () => {
      process.env.TWILIO_ACCOUNT_SID = 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      process.env.TWILIO_AUTH_TOKEN_PARAMETER_NAME = '/twilio/authToken';
      process.env.TWILIO_FROM_PHONE_NUMBER = '+447987654321';

      const event: LambdaEvent = {
        to: '+447123456789',
        message: 'This is a test message'
      };

      jest.spyOn(SSMClient.prototype, 'send').mockImplementation(() => ({
        Parameter: {
          Value: 'abc1234'
        }
      }));

      createMessageMock.mockImplementation(() => Promise.reject('An error occurred'));

      testSubject = async () => handler(event);
    });

    test('Then an error should have been thrown', async () => {
      await expect(testSubject).rejects.toThrow(new Error('An error occurred sending an SMS'));
    });
  });
});
