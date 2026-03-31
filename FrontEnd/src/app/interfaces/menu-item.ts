export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  imageURL?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
