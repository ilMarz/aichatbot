"use client";

import { COLOR_THEMES, useColorTheme } from "./color-theme-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ColorThemePicker() {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      {COLOR_THEMES.map((theme) => (
        <Tooltip key={theme.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={theme.label}
              onClick={() => setColorTheme(theme.id)}
              className="size-5 rounded-full ring-offset-background transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{
                backgroundColor: theme.color,
                boxShadow:
                  colorTheme === theme.id
                    ? `0 0 0 2px var(--background), 0 0 0 4px ${theme.color}`
                    : undefined,
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="top">{theme.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
