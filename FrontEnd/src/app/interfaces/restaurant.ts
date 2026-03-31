export interface OpeningHoursEntry {
  day: number;
  opening_time: string | null;
  closing_time: string | null;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string;
  image_url?: string | null;
  phone: string | null;
  is_active: boolean;
  is_open: boolean;
  opening_hours: OpeningHoursEntry[];
  images: string[];
}