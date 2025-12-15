export interface LorebookSummary {
  id: string;
  name: string | null;
  description: string | null;
  spec: string;
  created_at: number;
  updated_at: number;
  cards_count?: number;
}

export interface LorebookLinkedCard {
  id: string;
  name: string | null;
}

export interface LorebookDetails {
  id: string;
  name: string | null;
  description: string | null;
  spec: string;
  created_at: number;
  updated_at: number;
  data: unknown;
  cards: LorebookLinkedCard[];
}


