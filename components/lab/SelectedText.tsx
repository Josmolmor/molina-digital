'use client';

import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Copy } from 'lucide-react';

const TextSelectionComponent = () => {
  const [selectedText, setSelectedText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSelection = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      setSelectedText(selection);
    }
  };

  useEffect(() => {
    console.log(selectedText, isOpen);
    if (selectedText && !isOpen) {
      console.log('opening');
      handleOpen();
    }
  }, [selectedText]);

  return (
    <div
      onMouseUp={handleSelection} // Detect text selection with mouse
      onKeyUp={handleSelection} // Detect text selection with keyboard
      tabIndex={0} // Make the div focusable to capture keyboard events
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <p>
            This is a sample paragraph. Try selecting some words from this text.
            Just click and drag your mouse over any part of it.
          </p>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold mb-2">Selected text</h1>
            <p className="text-sm text-muted-foreground mb-4">{selectedText}</p>
            <Button size="sm" onClick={handleClose} className="self-end">
              <Copy />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TextSelectionComponent;
