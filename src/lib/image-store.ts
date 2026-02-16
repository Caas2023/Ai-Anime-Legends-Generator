// Shared image store for temporary image hosting
// This is a simple in-memory solution

interface StoredImage {
  data: string;
  timestamp: number;
}

class ImageStore {
  private store = new Map<string, StoredImage>();
  private maxAge = 5 * 60 * 1000; // 5 minutes

  set(id: string, data: string): void {
    this.cleanup();
    this.store.set(id, { data, timestamp: Date.now() });
  }

  get(id: string): string | null {
    const image = this.store.get(id);
    if (!image) return null;
    
    // Check if expired
    if (Date.now() - image.timestamp > this.maxAge) {
      this.store.delete(id);
      return null;
    }
    
    return image.data;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, image] of this.store.entries()) {
      if (now - image.timestamp > this.maxAge) {
        this.store.delete(id);
      }
    }
  }
}

// Singleton instance
export const imageStore = new ImageStore();
