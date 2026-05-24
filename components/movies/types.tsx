export interface Movie {
  id: string;
  title: string;
  director: string | null;
  year: number | null;
  poster_url: string | null;
  country_code: string;
  type: "movie" | "series";
  rating: number | null;
  rank_in_country: number | null;
  tags: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
}
