import { gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function resolvePaddlePrice(priceId: string, environment: PaddleEnv): Promise<string> {
  const response = await gatewayFetch(
    environment,
    `/prices?external_id=${encodeURIComponent(priceId)}`
  );
  const data = await response.json();
  if (!data?.data?.length) throw new Error(`Price not found: ${priceId}`);
  return data.data[0].id as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, environment } = await req.json();
    if (!priceId || !environment) {
      return new Response(
        JSON.stringify({ error: 'priceId and environment are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const env = environment === 'live' ? 'live' : 'sandbox';
    const paddleId = await resolvePaddlePrice(priceId, env as PaddleEnv);
    return new Response(JSON.stringify({ paddleId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('get-paddle-price error:', e);
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
