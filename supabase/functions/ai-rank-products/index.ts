import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { products, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use AI to intelligently rank products based on context
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a product recommendation expert. Rank products intelligently based on popularity, recency, pricing, and user context. Return ONLY a JSON array of product IDs in recommended order. Format: [\"id1\", \"id2\", \"id3\"]" 
          },
          { 
            role: "user", 
            content: `Context: ${context}\n\nProducts to rank:\n${JSON.stringify(products.map((p: any) => ({ 
              id: p.id, 
              name: p.name, 
              price_retail: p.price_retail,
              discount_price: p.discount_price,
              is_popular: p.is_popular,
              is_new_arrival: p.is_new_arrival,
              created_at: p.created_at
            })))}\n\nReturn only the array of product IDs ranked by best recommendation.` 
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const rankedIdsText = aiResponse.choices[0].message.content;
    
    const jsonMatch = rankedIdsText.match(/\[.*\]/s);
    const rankedIds = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    const rankedProducts = rankedIds
      .map((id: string) => products.find((p: any) => p.id === id))
      .filter(Boolean);

    return new Response(JSON.stringify({ products: rankedProducts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-rank-products:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
