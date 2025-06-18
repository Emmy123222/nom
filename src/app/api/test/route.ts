// File: app/api/test/route.ts
export async function GET(req: Request) {
  return new Response(JSON.stringify({ message: "Test route works" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}