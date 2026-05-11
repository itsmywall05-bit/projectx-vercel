"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
    meta?: string;
};

type SelectSize = "sm" | "md";

type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    size?: SelectSize;
    disabled?: boolean;
    className?: string;
};

export default function Select({
    value,
    onChange,
    options,
    placeholder,
    size = "md",
    disabled = false,
    className = "",
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selectedIndex = useMemo(
        () => options.findIndex((opt) => opt.value === value),
        [options, value]
    );

    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
    const label = selected?.label ?? placeholder ?? "Select";

    useEffect(() => {
        if (selectedIndex >= 0) setActiveIndex(selectedIndex);
        else setActiveIndex(0);
    }, [selectedIndex]);

    useEffect(() => {
        if (!open) return;
        function onPointerDown(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    function commitIndex(index: number) {
        const option = options[index];
        if (!option || option.disabled) return;
        onChange(option.value);
        setOpen(false);
        buttonRef.current?.focus();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (disabled) return;
        const max = options.length - 1;

        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen(true);
            return;
        }

        if (!open) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((i) => (i >= max ? 0 : i + 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((i) => (i <= 0 ? max : i - 1));
                break;
            case "Home":
                e.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                e.preventDefault();
                setActiveIndex(max);
                break;
            case "Enter":
                e.preventDefault();
                commitIndex(activeIndex);
                break;
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
            default:
                break;
        }
    }

    const triggerClass = [
        "px-select-trigger",
        size === "sm" ? "px-select-trigger-sm" : "px-select-trigger-md",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div ref={rootRef} className="px-select">
            <button
                ref={buttonRef}
                type="button"
                className={triggerClass}
                onClick={() => !disabled && setOpen((o) => !o)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={disabled}
            >
                <span className={selected ? "px-select-value" : "px-select-placeholder"}>{label}</span>
                <svg
                    className={open ? "px-select-chevron px-select-chevron-open" : "px-select-chevron"}
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        d="M6 8l4 4 4-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {open && (
                <div className="px-select-menu" role="listbox">
                    {options.map((option, index) => {
                        const selectedOption = option.value === value;
                        const active = index === activeIndex;
                        return (
                            <div
                                key={`${option.value}-${index}`}
                                role="option"
                                aria-selected={selectedOption}
                                className={
                                    [
                                        "px-select-option",
                                        active ? "px-select-option-active" : "",
                                        selectedOption ? "px-select-option-selected" : "",
                                        option.disabled ? "px-select-option-disabled" : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                                }
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => commitIndex(index)}
                            >
                                <span className="px-select-option-label">{option.label}</span>
                                {option.meta && <span className="px-select-option-meta">{option.meta}</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
