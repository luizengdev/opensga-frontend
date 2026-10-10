const MOCK_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3334";

export const resetMockApi = async () => {
  await fetch(`${MOCK_API_URL}/__e2e/reset`, {method: "POST"});
};
