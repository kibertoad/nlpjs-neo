import { engine } from './engine.js';

/**
 * The phrase can arrive from a direct invocation, from a JSON body or from the
 * query string, depending on how the function is called.
 *
 * @param {Object} event API Gateway Lambda Proxy Input Format.
 * @returns {string} The phrase to process.
 */
function readPhrase(event) {
  if (event.phrase) {
    console.info('PARAMETER TAKEN FROM EVENT');
    return event.phrase;
  }
  if (event.body) {
    const { phrase } = JSON.parse(event.body);
    if (phrase) {
      console.info('PARAMETER TAKEN FROM BODY');
      return phrase;
    }
  }
  if (event.queryStringParameters?.phrase) {
    console.info('PARAMETER TAKEN FROM QUERY STRING');
    return event.queryStringParameters.phrase;
  }
  console.info('NO PARAMETER GIVEN, FALLING BACK TO THE DEFAULT PHRASE');
  return engine.defaultPhrase;
}

/**
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 *
 * @param {Object} event API Gateway Lambda Proxy Input Format.
 * @returns {Promise<Object>} API Gateway Lambda Proxy Output Format.
 */
export const lambdaHandler = async (event) => {
  console.info(JSON.stringify(event));
  try {
    const result = await engine.process(readPhrase(event));
    console.info(`RESULT: ${JSON.stringify(result)}`);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Could not process the phrase' }),
    };
  }
};
