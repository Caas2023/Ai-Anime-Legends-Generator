"use client";

import { useCallback, useRef, useEffect } from "react";

// Cyberpunk Interface Sounds
// Using data URIs for small bleeps to avoid external dependencies or file loading issues.

// 1. Hover Sound (Short High Tech Blip)
const HOVER_SFX = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Placeholder: This is incomplete/invalid.
// Realistically, for a "Cyberpunk" feel, we want a very short 20ms sine wave or noise burst.
// Since I cannot generate binary audio files easily here, I will implement a Web Audio API synthesizer.

type SoundType = "hover" | "click" | "success" | "error";

export function useSound() {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext lazily on user interaction usually, but here on mount
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext();
        }
    }, []);

    const play = useCallback((type: SoundType) => {
        if (!audioContextRef.current) return;

        // Resume context if suspended (browser policy)
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;

        // Master Gain
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);

        const osc = ctx.createOscillator();
        osc.connect(gainNode);

        const now = ctx.currentTime;

        switch (type) {
            case "hover":
                // High pitched short blip
                osc.type = "sine";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                gainNode.gain.setValueAtTime(0.05, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;

            case "click":
                // Lower pitched "thud" or "mechanical" click
                osc.type = "square";
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case "success":
                // Rising magical chime (Arpeggio)
                const t = now;
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
                notes.forEach((note, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = "sine";
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.frequency.value = note;
                    g.gain.setValueAtTime(0.05, t + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
                    o.start(t + i * 0.1);
                    o.stop(t + i * 0.1 + 0.3);
                });
                break;

            case "error":
                // Low buzzy error
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
        }

    }, []);

    return { play };
}
