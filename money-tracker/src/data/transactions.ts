import type {Transaction} from "../types/transaction";

export const transactions: Transaction[] = [
  {
    id: 1,
    date: "2023-10-12",
    description: "Artisan Roast Coffee",
    category: "Lifestyle",
    amount: 12.5,
    people: "Me",
    method: "Amex Gold",
  },
  {
    id: 2,
    date: "2023-10-11",
    description: "Skyline Airlines - Paris",
    category: "Travel",
    amount: 1450,
    return: 5,
    people: "Sara",
    method: "Wire",
  },
  {
    id: 3,
    date: "2023-10-10",
    description: "Luxury Goods Co.",
    category: "Shopping",
    amount: 245.99,
    people: "Me",
    method: "Apple Pay",
  },
  {
    id: 4,
    date: "2023-10-09",
    description: "Monthly Rent - Highland Pk",
    category: "Housing",
    amount: 2200,
    people: "Me, AL",
    method: "Debit",
  },
];