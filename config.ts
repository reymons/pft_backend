export default () => ({
  nodeEnv: process.env.APP_ENV ?? 'development',
  httpServerPort: parseInt(process.env.HTTP_SERVER_PORT ?? '3000', 10),
});
