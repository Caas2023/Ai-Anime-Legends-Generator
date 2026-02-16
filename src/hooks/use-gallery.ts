"use client";

import { useState, useEffect } from "react";

export interface GalleryItem {
    id: string;
    url: string;
    character: string;
    style: string;
    prompt: string;
    date: number;
}

const STORAGE_KEY = "anime-legends-gallery";

export function useGallery() {
    const [images, setImages] = useState<GalleryItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setImages(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load gallery", e);
        }
    }, []);

    const addImage = (url: string, character: string, style: string, prompt: string) => {
        const newItem: GalleryItem = {
            id: crypto.randomUUID(),
            url,
            character,
            style,
            prompt,
            date: Date.now(),
        };

        const newImages = [newItem, ...images].slice(0, 50); // Keep max 50 items
        setImages(newImages);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
        } catch (e) {
            console.error("Failed to save gallery", e);
        }
    };

    const removeImage = (id: string) => {
        const newImages = images.filter((img) => img.id !== id);
        setImages(newImages);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
        } catch (e) {
            console.error("Failed to update gallery", e);
        }
    };

    const clearGallery = () => {
        setImages([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { images, addImage, removeImage, clearGallery };
}
