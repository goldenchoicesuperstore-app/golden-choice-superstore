import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, category, brand, description, imageUrl } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const promptText = `You are a helpful shopping assistant for Golden Choice Superstore, a premium Nigerian e-commerce store. Here is information about a product: Name: ${name || 'Unknown'}, Category: ${category || 'Unknown'}, Brand: ${brand || 'Unknown'}, Description: ${description || 'None'}. Based on this information and the product image if provided, write a short friendly 3-4 sentence summary about what this product is, what it is used for, key benefits, and why a Nigerian shopper might want to buy it. Keep it concise, warm, and helpful.`;

    const parts: any[] = [{ text: promptText }];

    // If we have an image URL, we need to fetch it and convert to base64 for Gemini multimodal input
    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Data = buffer.toString('base64');
          const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
          
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data
            }
          });
        }
      } catch (err) {
        console.warn("Failed to fetch image for Gemini API, proceeding with text only", err);
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts
        }]
      })
    });

    const data = await geminiRes.json();
    
    if (!geminiRes.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary available.";

    return NextResponse.json({ summary: textResponse });
  } catch (error) {
    console.error("Error in product-ai-info API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
