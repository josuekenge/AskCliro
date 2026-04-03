import { ArrowRight, Stethoscope, Check, ChevronDown, Paperclip } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "./textarea";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { motion, AnimatePresence } from "motion/react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY));
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const CLIRO_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const CONTEXT_MODES = [
  { key: "general", label: "General", icon: CLIRO_ICON },
  { key: "soap", label: "SOAP Focus", icon: <Stethoscope className="w-4 h-4" /> },
  { key: "orders", label: "Draft Orders", icon: CLIRO_ICON },
];

interface CliroInputProps {
  onSend?: (message: string, mode: string) => void;
}

export function CliroInput({ onSend }: CliroInputProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 200,
  });
  const [selectedMode, setSelectedMode] = useState("general");

  const currentMode = CONTEXT_MODES.find((m) => m.key === selectedMode) || CONTEXT_MODES[0];

  const handleSend = () => {
    if (!value.trim()) return;
    onSend?.(value, selectedMode);
    setValue("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))]">
        <div className="relative flex flex-col">
          <div className="overflow-y-auto" style={{ maxHeight: "250px" }}>
            <Textarea
              value={value}
              placeholder="Ask Cliro anything about this patient..."
              className={cn(
                "w-full rounded-2xl rounded-b-none px-4 py-3 bg-white border-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                "min-h-[56px] text-[13px]"
              )}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
            />
          </div>

          <div className="h-11 bg-white rounded-b-2xl flex items-center border-t border-[hsl(var(--border))]/50">
            <div className="absolute left-3 right-3 bottom-2.5 flex items-center justify-between w-[calc(100%-24px)]">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 h-7 pl-1.5 pr-2 text-[11px] font-medium rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors focus:outline-none">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedMode}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.12 }}
                          className="flex items-center gap-1"
                        >
                          {currentMode.icon}
                          <span>{currentMode.label}</span>
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        </motion.div>
                      </AnimatePresence>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[10rem] bg-white border border-[hsl(var(--border))]">
                    {CONTEXT_MODES.map((mode) => (
                      <DropdownMenuItem
                        key={mode.key}
                        onSelect={() => setSelectedMode(mode.key)}
                        className="flex items-center justify-between gap-2 text-[12px]"
                      >
                        <div className="flex items-center gap-2">
                          {mode.icon}
                          <span>{mode.label}</span>
                        </div>
                        {selectedMode === mode.key && <Check className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-4 w-px bg-[hsl(var(--border))] mx-0.5" />

                <label
                  className="rounded-md p-1.5 cursor-pointer hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                  aria-label="Attach file"
                >
                  <input type="file" className="hidden" />
                  <Paperclip className="w-3.5 h-3.5" />
                </label>
              </div>

              <button
                type="button"
                className={cn(
                  "rounded-lg p-1.5 bg-[hsl(var(--primary))] text-white transition-all duration-200",
                  value.trim() ? "opacity-100 hover:brightness-110 shadow-sm" : "opacity-30"
                )}
                aria-label="Send message"
                disabled={!value.trim()}
                onClick={handleSend}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
