import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { FormatAction } from "../../types";
import type { VariantProps } from "class-variance-authority";
import type { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { CaretDownIcon, LetterCaseCapitalizeIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarButton } from "../toolbar-button";
import { ShortcutKey } from "../shortcut-key";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
interface TextStyle extends Omit<
  FormatAction,
  "value" | "icon" | "action" | "isActive" | "canExecute"
> {
  element: keyof React.JSX.IntrinsicElements;
  level?: Level;
  className: string;
}

const formatActions: TextStyle[] = [
  {
    label: "Normal Text",
    element: "span",
    className: "",
    shortcuts: ["mod", "alt", "0"],
  },
  {
    label: "Heading 1",
    element: "h1",
    level: 1,
    className: "",
    shortcuts: ["mod", "alt", "1"],
  },
  {
    label: "Heading 2",
    element: "h2",
    level: 2,
    className: "",
    shortcuts: ["mod", "alt", "2"],
  },
  {
    label: "Heading 3",
    element: "h3",
    level: 3,
    className: "",
    shortcuts: ["mod", "alt", "3"],
  },
  {
    label: "Heading 4",
    element: "h4",
    level: 4,
    className: "",
    shortcuts: ["mod", "alt", "4"],
  },
  {
    label: "Heading 5",
    element: "h5",
    level: 5,
    className: "",
    shortcuts: ["mod", "alt", "5"],
  },
  {
    label: "Heading 6",
    element: "h6",
    level: 6,
    className: "",
    shortcuts: ["mod", "alt", "6"],
  },
];

interface SectionOneProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeLevels?: Level[];
}

export const SectionOne: React.FC<SectionOneProps> = ({
  editor,
  activeLevels = [1, 2, 3, 4, 5, 6],
  size,
  variant,
}) => {
  const filteredActions = React.useMemo(
    () =>
      formatActions.filter(
        (action) => !action.level || activeLevels.includes(action.level),
      ),
    [activeLevels],
  );

  const handleStyleChange = React.useCallback(
    (level?: Level) => {
      if (level) {
        editor.chain().focus().toggleHeading({ level }).run();
      } else {
        editor.chain().focus().setParagraph().run();
      }
    },
    [editor],
  );

  const renderMenuItem = React.useCallback(
    ({ label, element: Element, level, className, shortcuts }: TextStyle) => (
      <DropdownMenuItem
        key={label}
        onClick={() => handleStyleChange(level)}
        className={cn(
          "flex flex-row items-center justify-between gap-2 hover:cursor-pointer hover:bg-background! hover:text-primary-hover rounded-lg",
          {
            "text-primary-hover": level
              ? editor.isActive("heading", { level })
              : editor.isActive("paragraph"),
          },
        )}
        aria-label={label}
      >
        <Element className={cn("m-0 grow text-base font-semibold", className)}>
          {label}
        </Element>
        <ShortcutKey className="text-subtle text-xs" keys={shortcuts} />
      </DropdownMenuItem>
    ),
    [editor, handleStyleChange],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          isActive={editor.isActive("heading")}
          tooltip="Text styles"
          aria-label="Text styles"
          pressed={editor.isActive("heading")}
          disabled={editor.isActive("codeBlock")}
          size={size}
          variant={variant}
          className="gap-0 rounded-lg hover:cursor-pointer"
        >
          <LetterCaseCapitalizeIcon className="size-5" />
          <CaretDownIcon className="size-5" />
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-full rounded-xl bg-surface p-1"
      >
        {filteredActions.map(renderMenuItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

SectionOne.displayName = "SectionOne";

export default SectionOne;
