export type Transaction = {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  return?: number;
  people: string;
  method: string;
};