// No live backend configured. Development uses an isolated, in-memory local server.
export const endpoint = new URLSearchParams(location.search).has('dev') ? '/simkit-api' : '';
