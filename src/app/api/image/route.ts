import { NextRequest, NextResponse } from "next/server";
import { imageStore } from "@/lib/image-store";

// POST - Store an image and return its ID
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }
    
    const id = Math.random().toString(36).substring(2, 15);
    imageStore.set(id, image);
    
    // Build the URL for this image
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const imageUrl = `${protocol}://${host}/api/image/${id}`;
    
    return NextResponse.json({ id, url: imageUrl });
  } catch {
    return NextResponse.json({ error: "Failed to store image" }, { status: 500 });
  }
}
