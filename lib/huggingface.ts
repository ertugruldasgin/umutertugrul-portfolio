const HF_API = "https://huggingface.co/api";
const HF_USERNAME = process.env.HUGGINGFACE_USERNAME || "";

if (!HF_USERNAME) {
  throw new Error("HUGGINGFACE_USERNAME is not set");
}

export interface HFDataset {
  id: string;
  name: string;
  downloads: number;
  downloadsAllTime: number;
  lastModified: string;
  likes: number;
  tags: string[];
  url: string;
}

export interface HFStats {
  totalDatasets: number;
  totalLikes: number;
  totalDownloads: number;
  totalDownloadsAllTime: number;
  datasets: HFDataset[];
}

interface HFRawDataset {
  id: string;
  _id?: string;
  downloads?: number;
  downloadsAllTime?: number;
  likes?: number;
  lastModified?: string;
  tags?: string[];
}

export async function fetchHFDatasets(): Promise<HFStats> {
  const params = new URLSearchParams();
  params.append("author", HF_USERNAME);
  params.append("expand[]", "downloads");
  params.append("expand[]", "downloadsAllTime");
  params.append("expand[]", "likes");
  params.append("expand[]", "lastModified");
  params.append("expand[]", "tags");

  const res = await fetch(`${HF_API}/datasets?${params.toString()}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`HuggingFace API failed: ${res.status}`);
  }

  const rawData: HFRawDataset[] = await res.json();

  const datasets: HFDataset[] = rawData.map((item) => ({
    id: item.id,
    name: item.id.split("/")[1] ?? item.id,
    downloads: item.downloads ?? 0,
    downloadsAllTime: item.downloadsAllTime ?? 0,
    lastModified: item.lastModified ?? "",
    likes: item.likes ?? 0,
    tags: item.tags ?? [],
    url: `https://huggingface.co/datasets/${item.id}`,
  }));

  datasets.sort((a, b) => b.downloadsAllTime - a.downloadsAllTime);

  return {
    totalDatasets: datasets.length,
    totalDownloads: datasets.reduce((sum, ds) => sum + ds.downloads, 0),
    totalLikes: datasets.reduce((sum, ds) => sum + ds.likes, 0),
    totalDownloadsAllTime: datasets.reduce(
      (sum, ds) => sum + ds.downloadsAllTime,
      0,
    ),
    datasets,
  };
}
