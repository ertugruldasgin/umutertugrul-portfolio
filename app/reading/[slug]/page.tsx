import BookDetailPage from "../book-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookDetailPage slug={slug} />;
}
