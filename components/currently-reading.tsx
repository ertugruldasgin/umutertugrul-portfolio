import Link from "next/link";
import Image from "next/image";

interface Book {
  slug: string;
  title: string;
  author: string;
  cover_url: string | null;
  current_page: number;
  total_pages: number | null;
}

export function CurrentlyReading({ books }: { books: Book[] }) {
  if (!books || books.length === 0) {
    return (
      <p className="text-xs font-mono text-subtle/60 py-2">
        not reading anything right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {books.map((book) => (
        <Link
          key={book.slug}
          href={`/reading/${book.slug}`}
          className="group flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-surface transition-colors"
        >
          {book.cover_url ? (
            <Image
              width={32}
              height={48}
              src={book.cover_url}
              alt={book.title}
              className="w-8 h-12 object-cover rounded-sm shrink-0"
            />
          ) : (
            <div className="w-8 h-12 bg-surface rounded-sm shrink-0 flex items-center justify-center">
              <span className="text-xs text-subtle/40 font-mono">
                {book.title[0]}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span
              className={`font-mono text-sm sm:text-base text-foreground group-hover:text-secondary transition-colors truncate`}
            >
              {book.title}
            </span>
            <span className="text-xs text-subtle/60 font-mono truncate">
              {book.author}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
