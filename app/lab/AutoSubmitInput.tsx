'use client';

import { Badge } from '@/components/ui/badge';
import { GeistMono } from 'geist/font/mono';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

const digitsAmount = 5;

// Generate a random correct value
const generateCorrectValue = (length: number): string[] => {
  // Value can't be 00000
  const value = Array.from({ length }, () =>
    Math.floor(Math.random() * 10).toString(),
  );
  if (value.every((value) => value === '0')) {
    return generateCorrectValue(length);
  }
  return value;
};

export const AutoSubmitInput = () => {
  const [inputValues, setInputValues] = useState<string[]>(() =>
    Array.from({ length: digitsAmount }, () => ''),
  );
  const [correctValue, setCorrectValue] = useState<string[]>(() =>
    Array.from({ length: digitsAmount }, () => '0'),
  );
  const formRef = useRef<HTMLFormElement>(null);
  // Create refs array - safer dynamic approach
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper function to set ref for an index
  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleInputChange = (index: number, value: string) => {
    const trimmedValue = value.trim();

    // Handle pasting entire code if it matches the required length
    if (trimmedValue.length === digitsAmount && /^\d+$/.test(trimmedValue)) {
      const digits = trimmedValue.split('');
      setInputValues(digits);
      // Focus the last input after pasting
      setTimeout(() => {
        const lastInput = inputRefs.current[digitsAmount - 1];
        if (lastInput) {
          lastInput.focus();
        }
      }, 0);
      return;
    }

    // Only allow single digits (0-9)
    if (
      trimmedValue !== '' &&
      (!/^\d$/.test(trimmedValue) || parseInt(trimmedValue) > 9)
    ) {
      return; // Don't update if not a single digit 0-9
    }

    // Update the specific input value
    setInputValues((prev) => {
      const newValues = [...prev];
      newValues[index] = trimmedValue;
      return newValues;
    });

    // Focus management is handled in handleKeyDown to avoid double focus changes
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle digit keys (0-9) - move to next input after typing
    if (/^[0-9]$/.test(e.key) && index < digitsAmount - 1) {
      // Small delay to ensure input value updates first
      setTimeout(() => {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 0);
    }

    // Handle backspace - move to previous input if current is empty
    if (e.key === 'Backspace' && inputValues[index] === '' && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
      }
    }
  };

  // Generate random correct value on client side only
  useEffect(() => {
    setCorrectValue(generateCorrectValue(digitsAmount));
  }, []);

  // Update inputValues and correctValue when digitsAmount changes
  useEffect(() => {
    setInputValues(Array.from({ length: digitsAmount }, () => ''));
    setCorrectValue(generateCorrectValue(digitsAmount));
  }, [digitsAmount]);

  // Check if values are correct and show appropriate toast
  useEffect(() => {
    if (
      inputValues.length === digitsAmount &&
      inputValues.every((value) => value !== '') &&
      digitsAmount > 0
    ) {
      // Check if entered values match the correct value
      const isCorrect = inputValues.every(
        (value, index) => value === correctValue[index],
      );

      if (isCorrect) {
        toast.success(`Correct! Code submitted successfully!`);
      } else {
        toast.error(`Incorrect! Try again`);
      }
    }
  }, [inputValues, digitsAmount, correctValue]);

  return (
    <div className="flex flex-col gap-4">
      {!correctValue.every((value) => value === '0') && (
        <div className="flex flex-col items-center gap-2 text-xs">
          <Badge variant="outline" className="text-sm w-fit">
            <span className="tabular-nums">{correctValue.join('')}</span>
          </Badge>

          <button
            onClick={() => {
              setCorrectValue(generateCorrectValue(digitsAmount));
              setInputValues(Array.from({ length: digitsAmount }, () => ''));
              inputRefs.current[0]?.focus();
            }}
            className="text-muted-foreground hover:text-foreground underline"
          >
            Generate new value
          </button>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          formRef.current?.requestSubmit();
        }}
        className={`flex justify-center gap-2 ${GeistMono.className}`}
      >
        {Array.from({ length: digitsAmount }, (_, index) => (
          <div key={index} className="relative">
            <AnimatePresence mode="wait">
              <motion.span
                key={`${index}-${inputValues[index]}`}
                className="absolute inset-0 rounded-lg pointer-events-none tabular-nums text-foreground text-center items-center justify-center flex text-xl"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{
                  duration: 0.1,
                  ease: [0.455, 0.03, 0.515, 0.955],
                }}
              >
                {inputValues[index]}
              </motion.span>
            </AnimatePresence>
            <input
              key={index}
              ref={setInputRef(index)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              value={inputValues[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="text-transparent bg-muted/30 text-center w-10 h-16 text-xl py-1 border border-border hover:border-primary/50 focus:border-primary rounded-lg transition-all duration-200"
            />
          </div>
        ))}
      </form>
    </div>
  );
};
