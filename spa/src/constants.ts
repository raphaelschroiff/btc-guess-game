const baseUrl = import.meta.env.DEV ?
  import.meta.env.VITE_BASE_URL + '/api/' : '/api/';
export { baseUrl };
