import { NextRequest, NextResponse } from "next/server";
import { imageStore } from "@/lib/image-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const imageData = imageStore.get(id);
  
  if (!imageData) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
  
  // Extract base64 data and mime type
  const matches = imageData.match(/^data:(.+);base64,(.+)$/);
  
  if (!matches) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 500 });
  }
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");
  
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=300",
    },
  });
}
