"use client";

import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useBlogEditor } from "@/hooks/use-blog-editor";
import { BlogEditorBar } from "@/components/blog/blog-editor-bar";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { estimateReadingTime } from "@/components/blog/types";
import type { BlogPost } from "@/components/blog/types";

interface BlogPostContentProps {
  initialPost: BlogPost;
  isOwner: boolean;
}

export function BlogPostContent({
  initialPost,
  isOwner,
}: BlogPostContentProps) {
  const editor = useBlogEditor(initialPost);

  return (
    <>
      <BlogEditorBar
        isOwner={isOwner}
        isEditing={editor.isEditing}
        saving={editor.saving}
        hasChanges={editor.hasChanges}
        onEdit={editor.handleEdit}
        onSave={editor.handleSave}
        onCancel={editor.confirmCancel}
        onBackClick={(e) => {
          const guarded = editor.guardNavigation(() => {
            window.location.href = "/blog";
          });
          if (guarded) e.preventDefault();
        }}
      />

      <div className="flex gap-12">
        <BlogSidebar
          post={editor.post}
          isEditing={editor.isEditing}
          toc={editor.toc}
          activeHeading={editor.activeHeading}
          editTitle={editor.editTitle}
          editTags={editor.editTags}
          editPublished={editor.editPublished}
          onTitleChange={editor.handleTitleChange}
          onTagsChange={editor.handleTagsChange}
          onPublishedChange={editor.handlePublishedChange}
        />

        <article className="flex-1 min-w-0">
          {!editor.isEditing && (
            <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground font-medium mb-2 lg:mb-6">
                {editor.post.title}
              </h1>
              <div className="flex flex-col items-baseline lg:hidden mb-6">
                {editor.post.tags.length > 0 && (
                  <div className="flex flex-row gap-2">
                    {editor.post.tags.map((tag) => (
                      <span key={tag} className="text-xs font-mono text-subtle">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {editor.post.content && (
                  <span className="text-xs font-mono text-subtle">
                    ~{estimateReadingTime(editor.post.content)} min
                  </span>
                )}
              </div>
            </>
          )}

          <MinimalTiptapThree
            key={editor.isEditing ? "edit" : "view"}
            value={editor.post.content}
            onChange={editor.handleContentChange}
            className="w-full"
            editorContentClassName="-mt-4"
            output="html"
            placeholder="start writing..."
            autofocus={editor.isEditing}
            editable={editor.isEditing}
            editorClassName=""
          />
        </article>
      </div>

      <ConfirmDialog
        open={editor.unsavedOpen}
        title="$ discard"
        description="you have unsaved changes. leave anyway?"
        onConfirm={editor.handleConfirmDiscard}
        onCancel={editor.handleCancelDiscard}
      />
    </>
  );
}
