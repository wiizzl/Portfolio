import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { getInitials } from "@/lib/utils";

import { config } from "@/config";

const Header = () => {
    return (
        <header className="z-50 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-x-3">
                <TooltipProvider>
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                            <Link href="/">
                                <Avatar className="size-11 animate-heart">
                                    <AvatarImage src="/me.webp" alt={config.title} />
                                    <AvatarFallback>{getInitials(config.title)}</AvatarFallback>
                                </Avatar>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Available for work!</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div>
                    <h1 className="font-semibold leading-7">{config.title}</h1>
                    <p className="line-clamp-1 text-xs font-light">{config.description}</p>
                </div>
            </div>
            <div className="hidden gap-x-2 sm:flex">
                {config.socials.map((item, index) => (
                    <Link href={item.href} target="_blank" key={index}>
                        <item.icon strokeWidth={1.8} className="size-5" />
                        <span className="sr-only">{item.name}</span>
                    </Link>
                ))}
            </div>
        </header>
    );
};

export { Header };
