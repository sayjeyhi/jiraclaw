export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: "personal",
    name: "Personal",
    description: "For individual developers and small projects",
    priceInCents: 1200,
  },
  {
    id: "team",
    name: "Team",
    description: "For teams that need collaboration and advanced features",
    priceInCents: 3900,
  },
]
