import { useCallback, useEffect, useRef } from 'react';

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

/*
 * A short UI sound for taps. Web Audio rather than `new Audio()`: a decoded
 * buffer starts immediately, where an <audio> element on iOS lags the tap
 * noticeably and drops overlapping plays.
 *
 * The file is fetched up front on touch devices only (with a mouse, tiles are
 * hovered, never tapped). The AudioContext waits for the first tap, since
 * mobile browsers only let it start from a user gesture.
 */
export function useTapSound(src: string) {
  const bytesRef = useRef<Promise<ArrayBuffer> | null>(null);
  const bufferRef = useRef<Promise<AudioBuffer> | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    bytesRef.current ??= fetch(src).then((response) => {
      if (!response.ok) throw new Error(`tap sound: ${response.status}`);
      return response.arrayBuffer();
    });
    bytesRef.current.catch(() => {});
  }, [src]);

  useEffect(
    () => () => {
      void contextRef.current?.close();
      contextRef.current = null;
    },
    [],
  );

  return useCallback(() => {
    const bytes = bytesRef.current;
    if (!bytes) return;

    // iOS: mix with music already playing and respect the silent switch, like system UI sounds
    const session = (navigator as AudioSessionNavigator).audioSession;
    if (session) session.type = 'ambient';

    const context = (contextRef.current ??= new AudioContext());
    if (context.state === 'suspended') void context.resume();

    // Decoded once; an AudioBuffer isn't tied to the context that decoded it
    bufferRef.current ??= bytes.then((data) => context.decodeAudioData(data));
    bufferRef.current
      .then((buffer) => {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start();
      })
      .catch(() => {
        // Sound is a nicety: a failed fetch or decode stays silent
      });
  }, []);
}
