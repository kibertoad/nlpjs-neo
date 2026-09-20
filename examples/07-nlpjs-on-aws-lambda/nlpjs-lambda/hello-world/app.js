/**
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 *
 * @param {Object} event API Gateway Lambda Proxy Input Format.
 * @returns {Promise<Object>} API Gateway Lambda Proxy Output Format.
 */
export const lambdaHandler = async () => ({
  statusCode: 200,
  body: JSON.stringify({ message: 'hello world' }),
});
