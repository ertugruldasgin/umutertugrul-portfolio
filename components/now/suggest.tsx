import { SectionDivider } from "@/components/section-divider";
import { SuggestItem } from "./suggest-item";

export function Suggest() {
  return (
    <div className="flex flex-col flex-1">
      <SectionDivider title="if you are still curious" />
      <div className="grid grid-cols-1 sm:grid-cols-2 py-4 gap-4">
        <SuggestItem
          href="/blog"
          title="blog"
          description="things i think about"
        />
        <SuggestItem
          href="/uses"
          title="uses"
          description="what i reach for, when i sit down"
        />
        <SuggestItem
          href="/reading"
          title="reading"
          description="digital bookshelf"
        />
        <SuggestItem
          href="/whoami"
          title="whoami"
          description="the long answer"
        />
      </div>
    </div>
  );
}
