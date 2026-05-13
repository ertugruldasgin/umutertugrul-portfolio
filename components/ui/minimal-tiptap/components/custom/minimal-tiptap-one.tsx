import "@/components/ui/minimal-tiptap/styles/index.css";

import type { Content, Editor } from "@tiptap/react";
import type { UseMinimalTiptapEditorProps } from "@/components/ui/minimal-tiptap/hooks/use-minimal-tiptap";
import { EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { SectionTwo } from "@/components/ui/minimal-tiptap/components/section/two";
import { LinkBubbleMenu } from "@/components/ui/minimal-tiptap/components/bubble-menu/link-bubble-menu";
import { useMinimalTiptapEditor } from "@/components/ui/minimal-tiptap/hooks/use-minimal-tiptap";
import { MeasuredContainer } from "@/components/ui/minimal-tiptap/components/measured-container";

export interface MinimalTiptapProps extends Omit<
  UseMinimalTiptapEditorProps,
  "onUpdate"
> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="bg-subtle/5 rounded-xl flex h-12 w-full shrink-0 overflow-x-auto">
    <div className="flex w-max ml-auto mr-auto items-center gap-px">
      <SectionTwo
        editor={editor}
        activeActions={["bold", "italic", "underline", "strikethrough", "code"]}
        mainActionCount={5}
      />
    </div>
  </div>
);

export const MinimalTiptapOne = ({
  value,
  onChange,
  className,
  editorContentClassName,
  ...props
}: MinimalTiptapProps) => {
  const editor = useMinimalTiptapEditor({
    value,
    onUpdate: onChange,
    ...props,
  });

  if (!editor) {
    return null;
  }

  return (
    <MeasuredContainer
      as="div"
      name="editor"
      className={cn(
        "flex h-auto min-h-72 w-full flex-col bg-subtle/5 rounded-xl p-2",
        className,
      )}
    >
      <EditorContent
        editor={editor}
        className={cn(
          "minimal-tiptap-editor py-4 px-2",
          editorContentClassName,
        )}
      />
      <Toolbar editor={editor} />
      <LinkBubbleMenu editor={editor} />
    </MeasuredContainer>
  );
};

MinimalTiptapOne.displayName = "MinimalTiptapOne";

export default MinimalTiptapOne;
