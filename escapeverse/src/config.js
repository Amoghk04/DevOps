const baseUrls = {
  development: 'http://localhost',
  production: 'http://34.100.141.204'
};

const config = {
  apiUrl: `${baseUrls[process.env.NODE_ENV || 'development']}`,
  serverPort: 3001,
  gamePort: 3002,
  clientPort: 5173
};

export default config;