import { Button } from "@/kit/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/shadcn/dropdown-menu";
import { Theme } from "@/provider/theme";
import { ThemeMessage } from "@/type";
import { LaptopIcon, Moon, MoonIcon, Sun, SunIcon } from "lucide-react";

/**
 * Mode switcher component, used in the navbar
 *  @param messages:  the messages for each theme option
 *  @param setTheme: function to set the theme
 */
export function ModeSwitcher({
  messages,
  setTheme,
}: {
  messages: ThemeMessage;
  setTheme: (theme: Theme) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{messages.toggle}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setTheme("light");
          }}
          className="cursor-pointer"
        >
          <SunIcon className="mr-2 size-4" />
          <span>{messages.light}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark");
          }}
          className="cursor-pointer"
        >
          <MoonIcon className="mr-2 size-4" />
          <span>{messages.dark}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("system");
          }}
          className="cursor-pointer"
        >
          <LaptopIcon className="mr-2 size-4" />
          <span>{messages.system}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
