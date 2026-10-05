export const getApiBaseUrl = () => {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3333"
  );
};
