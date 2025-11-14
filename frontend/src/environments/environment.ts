export const environment = {
  production: (window as any).env?.production || false,
  apiUrl: (window as any).env?.apiUrl || 'http://localhost:8080',
  oauth: {
    clientId: 'myclientid',
    clientSecret: 'myclientsecret',
    scope: 'read write'
  }
};
