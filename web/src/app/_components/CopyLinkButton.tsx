"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, X } from "lucide-react";

interface CopyLinkButtonProps {
  link?: string;
  label?: string;
}

export function CopyLinkButton({
  link,
  label = "Copy link",
}: CopyLinkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const url =
    link ?? (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
      setIsSelected(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(true);
    setIsSelected(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSelected(false);
  };

  const handleInputFocus = () => {
    inputRef.current?.select();
    setIsSelected(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200 text-secondary hover:text-text-main h-9 min-w-[100px] group hover:shadow-lg"
      >
        {isSelected ? (
          <Check className="h-3.5 w-3.5 text-emerald-400 group-hover:text-emerald-300" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-secondary/70 group-hover:text-text-main" />
        )}
        <span className="font-mono tracking-wider uppercase">
          {isSelected ? "Selected" : label}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-link-title"
          aria-describedby="share-link-description"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="share-link-title"
                  className="text-sm font-semibold text-white"
                >
                  Share link
                </h2>
                <p
                  id="share-link-description"
                  className="mt-1 text-xs text-secondary"
                >
                  Copy this link manually.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close share dialog"
                className="rounded-md p-1 text-secondary hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              ref={inputRef}
              type="text"
              readOnly
              value={url}
              onFocus={handleInputFocus}
              onClick={handleInputFocus}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
            />

            <p className="mt-3 text-xs text-secondary">
              Press Ctrl+C after the link is selected.
            </p>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
