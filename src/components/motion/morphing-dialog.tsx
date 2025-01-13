"use client";

import { XIcon } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, Transition, Variant } from "motion/react";
import React, { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { useClickOutside } from "@/hooks/click-outside";

type MorphingDialogContextType = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    uniqueId: string;
    triggerRef: React.RefObject<HTMLDivElement>;
};

const MorphingDialogContext = React.createContext<MorphingDialogContextType | null>(null);

const useMorphingDialog = () => {
    const context = useContext(MorphingDialogContext);
    if (!context) {
        throw new Error("useMorphingDialog must be used within a MorphingDialogProvider");
    }
    return context;
};

type MorphingDialogProviderProps = {
    children: React.ReactNode;
    transition?: Transition;
};

const MorphingDialogProvider = ({ children, transition }: MorphingDialogProviderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const uniqueId = useId();
    const triggerRef = useRef<HTMLDivElement>(null!);

    const contextValue = useMemo(
        () => ({
            isOpen,
            setIsOpen,
            uniqueId,
            triggerRef,
        }),
        [isOpen, uniqueId]
    );

    return (
        <MorphingDialogContext.Provider value={contextValue}>
            <MotionConfig transition={transition}>{children}</MotionConfig>
        </MorphingDialogContext.Provider>
    );
};

type MorphingDialogProps = {
    children: React.ReactNode;
    transition?: Transition;
};

const MorphingDialog = ({ children, transition }: MorphingDialogProps) => {
    return (
        <MorphingDialogProvider>
            <MotionConfig transition={transition}>{children}</MotionConfig>
        </MorphingDialogProvider>
    );
};

type MorphingDialogTriggerProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    triggerRef?: React.RefObject<HTMLDivElement>;
};

const MorphingDialogTrigger = ({ children, className, style, triggerRef }: MorphingDialogTriggerProps) => {
    const { setIsOpen, isOpen, uniqueId } = useMorphingDialog();

    const handleClick = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen, setIsOpen]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsOpen(!isOpen);
            }
        },
        [isOpen, setIsOpen]
    );

    return (
        <motion.div
            ref={triggerRef}
            layoutId={`dialog-${uniqueId}`}
            className={cn("relative cursor-pointer", className)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            style={style}
            role="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={`motion-ui-morphing-dialog-content-${uniqueId}`}
            aria-label={`Open dialog ${uniqueId}`}
        >
            {children}
        </motion.div>
    );
};

type MorphingDialogContentProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

const MorphingDialogContent = (props: MorphingDialogContentProps) => {
    const { setIsOpen, isOpen, uniqueId, triggerRef } = useMorphingDialog();
    const containerRef = useRef<HTMLDivElement>(null!);
    const [firstFocusableElement, setFirstFocusableElement] = useState<HTMLElement | null>(null);
    const [lastFocusableElement, setLastFocusableElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
            if (event.key === "Tab") {
                if (!firstFocusableElement || !lastFocusableElement) return;

                if (event.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        event.preventDefault();
                        lastFocusableElement.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        event.preventDefault();
                        firstFocusableElement.focus();
                    }
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setIsOpen, firstFocusableElement, lastFocusableElement]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("overflow-hidden");
            const focusableElements = containerRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
                setFirstFocusableElement(focusableElements[0] as HTMLElement);
                setLastFocusableElement(focusableElements[focusableElements.length - 1] as HTMLElement);
                (focusableElements[0] as HTMLElement).focus();
            }
        } else {
            document.body.classList.remove("overflow-hidden");
            triggerRef.current?.focus();
        }
    }, [isOpen, triggerRef]);

    useClickOutside(containerRef, () => {
        if (isOpen) {
            setIsOpen(false);
        }
    });

    return (
        <motion.div
            ref={containerRef}
            layoutId={`dialog-${uniqueId}`}
            className={cn("overflow-hidden", props.className)}
            style={props.style}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`motion-ui-morphing-dialog-title-${uniqueId}`}
            aria-describedby={`motion-ui-morphing-dialog-description-${uniqueId}`}
        >
            {props.children}
        </motion.div>
    );
};

type MorphingDialogContainerProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

const MorphingDialogContainer = (props: MorphingDialogContainerProps) => {
    const { isOpen, uniqueId } = useMorphingDialog();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence initial={false} mode="sync">
            {isOpen && (
                <>
                    <motion.div
                        key={`backdrop-${uniqueId}`}
                        className="fixed inset-0 size-full bg-white/40 backdrop-blur-sm dark:bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center">{props.children}</div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

type MorphingDialogTitleProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

const MorphingDialogTitle = (props: MorphingDialogTitleProps) => {
    const { uniqueId } = useMorphingDialog();

    return (
        <motion.div
            layoutId={`dialog-title-container-${uniqueId}`}
            className={props.className}
            style={props.style}
            layout
        >
            {props.children}
        </motion.div>
    );
};

type MorphingDialogSubtitleProps = {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
};

const MorphingDialogSubtitle = (props: MorphingDialogSubtitleProps) => {
    const { uniqueId } = useMorphingDialog();

    return (
        <motion.div layoutId={`dialog-subtitle-container-${uniqueId}`} className={props.className} style={props.style}>
            {props.children}
        </motion.div>
    );
};

type MorphingDialogDescriptionProps = {
    children: React.ReactNode;
    className?: string;
    disableLayoutAnimation?: boolean;
    variants?: {
        initial: Variant;
        animate: Variant;
        exit: Variant;
    };
};

const MorphingDialogDescription = (props: MorphingDialogDescriptionProps) => {
    const { uniqueId } = useMorphingDialog();

    return (
        <motion.div
            key={`dialog-description-${uniqueId}`}
            layoutId={props.disableLayoutAnimation ? undefined : `dialog-description-content-${uniqueId}`}
            variants={props.variants}
            className={props.className}
            initial="initial"
            animate="animate"
            exit="exit"
            id={`dialog-description-${uniqueId}`}
        >
            {props.children}
        </motion.div>
    );
};

type MorphingDialogImageProps = {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
};

const MorphingDialogImage = ({ src, alt, className, style }: MorphingDialogImageProps) => {
    const { uniqueId } = useMorphingDialog();

    return (
        <motion.img src={src} alt={alt} className={cn(className)} layoutId={`dialog-img-${uniqueId}`} style={style} />
    );
};

type MorphingDialogCloseProps = {
    children?: React.ReactNode;
    className?: string;
    variants?: {
        initial: Variant;
        animate: Variant;
        exit: Variant;
    };
};

const MorphingDialogClose = ({ children, className, variants }: MorphingDialogCloseProps) => {
    const { setIsOpen, uniqueId } = useMorphingDialog();

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    return (
        <motion.button
            onClick={handleClose}
            type="button"
            aria-label="Close dialog"
            key={`dialog-close-${uniqueId}`}
            className={cn("absolute right-6 top-6", className)}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
        >
            {children || <XIcon size={24} />}
        </motion.button>
    );
};

export {
    MorphingDialog,
    MorphingDialogClose,
    MorphingDialogContainer,
    MorphingDialogContent,
    MorphingDialogDescription,
    MorphingDialogImage,
    MorphingDialogSubtitle,
    MorphingDialogTitle,
    MorphingDialogTrigger,
};
