import "@/components/ui/minimal-tiptap/styles/index.css";

import type { Content, Editor } from "@tiptap/react";
import type { UseMinimalTiptapEditorProps } from "@/components/ui/minimal-tiptap/hooks/use-minimal-tiptap";
import { EditorContent } from "@tiptap/react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SectionOne } from "@/components/ui/minimal-tiptap/components/section/one";
import { SectionTwo } from "@/components/ui/minimal-tiptap/components/section/two";
import { SectionThree } from "@/components/ui/minimal-tiptap/components/section/three";
import { SectionFour } from "@/components/ui/minimal-tiptap/components/section/four";
import { SectionFive } from "@/components/ui/minimal-tiptap/components/section/five";
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
  <div className="bg-muted/60 backdrop-blur-md z-10 rounded-xl flex h-12 w-full ml-auto mr-auto shrink-0 overflow-x-auto p-2 sticky top-0 scrollbar-hide">
    <div className="flex w-max items-center gap-px ml-auto mr-auto">
      <SectionOne editor={editor} activeLevels={[1, 2, 3, 4, 5, 6]} />

      <SectionTwo
        editor={editor}
        activeActions={[
          "bold",
          "italic",
          "underline",
          "code",
          "strikethrough",
          "clearFormatting",
        ]}
        mainActionCount={6}
      />

      <Separator orientation="vertical" className="mx-1" />

      <SectionThree editor={editor} />

      <Separator orientation="vertical" className="mx-1" />

      <SectionFour
        editor={editor}
        activeActions={["bulletList", "orderedList"]}
        mainActionCount={2}
      />

      <Separator orientation="vertical" className="mx-1" />

      <SectionFive
        editor={editor}
        activeActions={["blockquote", "codeBlock", "horizontalRule"]}
        mainActionCount={3}
      />
    </div>
  </div>
);

export const MinimalTiptapThree = ({
  value,
  onChange,
  className,
  editorContentClassName,
  editable = true,
  ...props
}: MinimalTiptapProps) => {
  const editor = useMinimalTiptapEditor({
    value,
    onUpdate: onChange,
    editable,
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
        "min-data-[orientation=vertical]:h-72 flex h-auto w-full flex-col",
        className,
      )}
    >
      {editable && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className={cn("minimal-tiptap-editor pt-12", editorContentClassName)}
      />
      {editable && <LinkBubbleMenu editor={editor} />}
    </MeasuredContainer>
  );
};

MinimalTiptapThree.displayName = "MinimalTiptapThree";

export default MinimalTiptapThree;
