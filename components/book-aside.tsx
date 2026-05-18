import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, CameraIcon, CheckIcon } from "lucide-react";
import { Star } from "lucide-react";
import Image from "next/image";

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_url: string | null;
  status: "reading" | "finished" | "dropped" | "queued";
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  tags: string[];
  total_pages: number | null;
  current_page: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS: { value: Book["status"]; label: string }[] = [
  { value: "reading", label: "reading" },
  { value: "finished", label: "finished" },
  { value: "queued", label: "queued" },
  { value: "dropped", label: "dropped" },
];

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number | null;
  onChange?: (val: number | null) => void;
  readonly?: boolean;
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const display = hoverValue ?? value ?? 0;

  const handleClick = (starIndex: number, isLeftHalf: boolean) => {
    if (readonly || !onChange) return;
    const newVal = starIndex + (isLeftHalf ? 0.5 : 1);
    onChange(value === newVal ? null : newVal);
  };

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => !readonly && setHoverValue(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = display >= i + 1;
        const halfFilled = !filled && display >= i + 0.5;

        return (
          <div key={i} className="relative size-5">
            {/* left half hitbox */}
            {!readonly && (
              <>
                <div
                  className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-pointer"
                  onMouseEnter={() => setHoverValue(i + 0.5)}
                  onClick={() => handleClick(i, true)}
                />
                <div
                  className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-pointer"
                  onMouseEnter={() => setHoverValue(i + 1)}
                  onClick={() => handleClick(i, false)}
                />
              </>
            )}

            {filled ? (
              <Star className="size-5 fill-primary text-primary" />
            ) : halfFilled ? (
              <div className="relative size-5">
                <Star className="size-5 text-subtle/20" />
                <div className="absolute inset-0 overflow-hidden w-[50%]">
                  <Star className="size-5 fill-primary text-primary" />
                </div>
              </div>
            ) : (
              <Star className="size-5 text-subtle/20" />
            )}
          </div>
        );
      })}
      {value && (
        <span className="text-sm font-mono text-primary ml-2 self-center">
          {value}
        </span>
      )}
    </div>
  );
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full rounded-md justify-start text-left font-mono text-sm h-8 px-2 bg-transparent border-border hover:bg-surface hover:cursor-pointer"
        >
          <CalendarIcon className="size-3.5 mr-1.5 text-subtle/60" />
          {date ? (
            <span className="text-foreground">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className="text-subtle/50">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-lg" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? d.toISOString().split("T")[0] : "");
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function StatusCombobox({
  value,
  onChange,
}: {
  value: Book["status"];
  onChange: (val: Book["status"]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full rounded-md justify-start font-mono text-sm h-8 px-2 bg-transparent border-border hover:bg-surface hover:cursor-pointer"
        >
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1 rounded-lg" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {STATUS_OPTIONS.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="font-mono text-sm"
                >
                  {opt.label}
                  {value === opt.value && (
                    <CheckIcon className="ml-auto size-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface BookAsideProps {
  book: Book;
  isOwner: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editAuthor: string;
  setEditAuthor: (v: string) => void;
  editStatus: Book["status"];
  setEditStatus: (v: Book["status"]) => void;
  editRating: number | null;
  setEditRating: (v: number | null) => void;
  editTags: string;
  setEditTags: (v: string) => void;
  editTotalPages: string;
  setEditTotalPages: (v: string) => void;
  editCurrentPage: string;
  setEditCurrentPage: (v: string) => void;
  editStartedAt: string;
  setEditStartedAt: (v: string) => void;
  editFinishedAt: string;
  setEditFinishedAt: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BookAside({
  book,
  isOwner,
  isEditing,
  editTitle,
  setEditTitle,
  editAuthor,
  setEditAuthor,
  editStatus,
  setEditStatus,
  editRating,
  setEditRating,
  editTags,
  setEditTags,
  editTotalPages,
  setEditTotalPages,
  editCurrentPage,
  setEditCurrentPage,
  editStartedAt,
  setEditStartedAt,
  editFinishedAt,
  setEditFinishedAt,
  fileInputRef,
  handleCoverUpload,
}: BookAsideProps) {
  const progress =
    book.total_pages && book.current_page
      ? Math.round((book.current_page / book.total_pages) * 100)
      : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <aside className="flex flex-col gap-4 lg:w-56 shrink-0 lg:sticky lg:top-20 lg:self-start">
      <div className="relative group w-24 lg:w-full">
        {book.cover_url ? (
          <Image
            width={224}
            height={336}
            src={book.cover_url}
            alt={book.title}
            className="w-24 lg:w-full aspect-2/3 object-cover rounded-md"
          />
        ) : (
          <div className="w-24 lg:w-full aspect-2/3 bg-surface rounded-md flex items-center justify-center">
            <span className="text-2xl text-subtle/30 font-serif">
              {book.title[0]}
            </span>
          </div>
        )}
        {isOwner && isEditing && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md cursor-pointer"
            >
              <CameraIcon className="size-5 text-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">title</span>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-8 text-sm font-mono bg-transparent"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">
              author
            </span>
            <Input
              value={editAuthor}
              onChange={(e) => setEditAuthor(e.target.value)}
              className="h-8 text-sm font-mono bg-transparent"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">
              status
            </span>
            <StatusCombobox value={editStatus} onChange={setEditStatus} />
          </div>

          <div className="flex gap-2">
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-sm text-foreground tracking-wide">
                page
              </span>
              <Input
                type="number"
                value={editCurrentPage}
                onChange={(e) => setEditCurrentPage(e.target.value)}
                className="h-8 text-sm font-mono bg-transparent"
              />
            </label>
            <label className="flex flex-col gap-1 flex-1">
              <span className="text-sm text-foreground tracking-wide">of</span>
              <Input
                type="number"
                value={editTotalPages}
                onChange={(e) => setEditTotalPages(e.target.value)}
                placeholder="total"
                className="h-8 text-sm font-mono bg-transparent"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">
              rating
            </span>
            <StarRating value={editRating} onChange={setEditRating} />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">#</span>
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="comma separated tags"
              className="h-8 text-sm font-mono bg-transparent"
            />
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">
              started
            </span>
            <DatePicker
              value={editStartedAt}
              onChange={setEditStartedAt}
              placeholder="started date"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">
              finished
            </span>
            <DatePicker
              value={editFinishedAt}
              onChange={setEditFinishedAt}
              placeholder="finished date"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-serif text-foreground font-medium">
            {book.title}
          </h1>
          <span className="text-sm font-mono text-subtle">{book.author}</span>

          {progress !== null && (
            <div className="flex flex-col gap-1">
              <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-subtle/60">
                {book.current_page}/{book.total_pages} ({progress}%)
              </span>
            </div>
          )}

          <StarRating value={book.rating} readonly />

          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono text-subtle/60">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-0.5 mt-1">
            {book.started_at && (
              <span className="text-xs font-mono text-subtle/40">
                started {formatDate(book.started_at)}
              </span>
            )}
            {book.finished_at && (
              <span className="text-xs font-mono text-subtle/40">
                finished {formatDate(book.finished_at)}
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
