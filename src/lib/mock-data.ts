export interface Product {
  id: string;
  title: string;
  status: "Active" | "Draft" | "Archived";
  inventory: number;
  variants: number;
  category: string;
  vendor: string;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  total: number;
  paymentStatus: "Paid" | "Pending" | "Refunded";
  fulfillmentStatus: "Fulfilled" | "Unfulfilled" | "Partially fulfilled";
  items: number;
  deliveryMethod: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  emailSubscription: "Subscribed" | "Not subscribed";
  location: string;
  orders: number;
  amountSpent: number;
}

export const products: Product[] = [
  { id: "p1", title: "Classic Leather Wallet", status: "Active", inventory: 34, variants: 2, category: "Accessories", vendor: "modeFirst", price: 49.0 },
  { id: "p2", title: "Minimal Canvas Tote", status: "Active", inventory: 120, variants: 3, category: "Bags", vendor: "modeFirst", price: 29.0 },
  { id: "p3", title: "Everyday Cotton Tee", status: "Active", inventory: 245, variants: 6, category: "Apparel", vendor: "Basics Co", price: 19.5 },
  { id: "p4", title: "Wool Blend Overcoat", status: "Draft", inventory: 12, variants: 4, category: "Apparel", vendor: "Northline", price: 189.0 },
  { id: "p5", title: "Trail Running Sneakers", status: "Active", inventory: 0, variants: 5, category: "Footwear", vendor: "Stride Lab", price: 129.0 },
  { id: "p6", title: "Insulated Water Bottle", status: "Active", inventory: 87, variants: 2, category: "Lifestyle", vendor: "Hydra", price: 24.0 },
  { id: "p7", title: "Slim Fit Denim Jeans", status: "Active", inventory: 64, variants: 8, category: "Apparel", vendor: "Basics Co", price: 79.0 },
  { id: "p8", title: "Ceramic Pour-Over Set", status: "Draft", inventory: 18, variants: 1, category: "Home", vendor: "Kiln & Co", price: 65.0 },
  { id: "p9", title: "Merino Wool Beanie", status: "Active", inventory: 53, variants: 3, category: "Accessories", vendor: "Northline", price: 32.0 },
  { id: "p10", title: "Bluetooth Speaker Mini", status: "Archived", inventory: 0, variants: 2, category: "Electronics", vendor: "SoundBox", price: 59.0 },
  { id: "p11", title: "Linen Throw Pillow", status: "Active", inventory: 41, variants: 4, category: "Home", vendor: "Kiln & Co", price: 38.0 },
  { id: "p12", title: "Leather Crossbody Bag", status: "Active", inventory: 26, variants: 2, category: "Bags", vendor: "modeFirst", price: 98.0 },
];

export const orders: Order[] = [
  { id: "o1", orderNumber: "#1024", date: "Jul 8, 2026 at 2:14 pm", customer: "Ava Thompson", total: 156.5, paymentStatus: "Paid", fulfillmentStatus: "Unfulfilled", items: 3, deliveryMethod: "Standard Shipping" },
  { id: "o2", orderNumber: "#1023", date: "Jul 8, 2026 at 11:02 am", customer: "Liam Rodriguez", total: 49.0, paymentStatus: "Paid", fulfillmentStatus: "Fulfilled", items: 1, deliveryMethod: "Express Shipping" },
  { id: "o3", orderNumber: "#1022", date: "Jul 7, 2026 at 6:48 pm", customer: "Sophia Chen", total: 238.0, paymentStatus: "Pending", fulfillmentStatus: "Unfulfilled", items: 4, deliveryMethod: "Standard Shipping" },
  { id: "o4", orderNumber: "#1021", date: "Jul 7, 2026 at 3:15 pm", customer: "Noah Patel", total: 89.0, paymentStatus: "Paid", fulfillmentStatus: "Partially fulfilled", items: 2, deliveryMethod: "Local Pickup" },
  { id: "o5", orderNumber: "#1020", date: "Jul 6, 2026 at 9:30 am", customer: "Emma Wilson", total: 129.0, paymentStatus: "Refunded", fulfillmentStatus: "Fulfilled", items: 1, deliveryMethod: "Standard Shipping" },
  { id: "o6", orderNumber: "#1019", date: "Jul 5, 2026 at 8:22 pm", customer: "Oliver Kim", total: 312.5, paymentStatus: "Paid", fulfillmentStatus: "Fulfilled", items: 5, deliveryMethod: "Express Shipping" },
  { id: "o7", orderNumber: "#1018", date: "Jul 5, 2026 at 1:05 pm", customer: "Isabella Garcia", total: 67.0, paymentStatus: "Pending", fulfillmentStatus: "Unfulfilled", items: 2, deliveryMethod: "Standard Shipping" },
  { id: "o8", orderNumber: "#1017", date: "Jul 4, 2026 at 4:44 pm", customer: "Mason Lee", total: 189.0, paymentStatus: "Paid", fulfillmentStatus: "Fulfilled", items: 1, deliveryMethod: "Standard Shipping" },
  { id: "o9", orderNumber: "#1016", date: "Jul 3, 2026 at 10:18 am", customer: "Mia Johnson", total: 94.5, paymentStatus: "Paid", fulfillmentStatus: "Unfulfilled", items: 3, deliveryMethod: "Local Pickup" },
  { id: "o10", orderNumber: "#1015", date: "Jul 2, 2026 at 7:56 pm", customer: "Ethan Brown", total: 45.0, paymentStatus: "Paid", fulfillmentStatus: "Fulfilled", items: 1, deliveryMethod: "Standard Shipping" },
  { id: "o11", orderNumber: "#1014", date: "Jul 2, 2026 at 12:31 pm", customer: "Charlotte Davis", total: 276.0, paymentStatus: "Pending", fulfillmentStatus: "Unfulfilled", items: 4, deliveryMethod: "Express Shipping" },
  { id: "o12", orderNumber: "#1013", date: "Jul 1, 2026 at 5:09 pm", customer: "James Martinez", total: 58.0, paymentStatus: "Paid", fulfillmentStatus: "Fulfilled", items: 2, deliveryMethod: "Standard Shipping" },
];

export const customers: Customer[] = [
  { id: "c1", name: "Ava Thompson", email: "ava.thompson@example.com", emailSubscription: "Subscribed", location: "Toronto, Canada", orders: 8, amountSpent: 1240.5 },
  { id: "c2", name: "Liam Rodriguez", email: "liam.r@example.com", emailSubscription: "Subscribed", location: "Austin, United States", orders: 3, amountSpent: 342.0 },
  { id: "c3", name: "Sophia Chen", email: "sophia.chen@example.com", emailSubscription: "Not subscribed", location: "Vancouver, Canada", orders: 12, amountSpent: 2890.75 },
  { id: "c4", name: "Noah Patel", email: "noah.patel@example.com", emailSubscription: "Subscribed", location: "London, United Kingdom", orders: 5, amountSpent: 678.0 },
  { id: "c5", name: "Emma Wilson", email: "emma.w@example.com", emailSubscription: "Not subscribed", location: "Sydney, Australia", orders: 1, amountSpent: 129.0 },
  { id: "c6", name: "Oliver Kim", email: "oliver.kim@example.com", emailSubscription: "Subscribed", location: "Seoul, South Korea", orders: 9, amountSpent: 1567.25 },
  { id: "c7", name: "Isabella Garcia", email: "isabella.g@example.com", emailSubscription: "Subscribed", location: "Madrid, Spain", orders: 4, amountSpent: 456.0 },
  { id: "c8", name: "Mason Lee", email: "mason.lee@example.com", emailSubscription: "Not subscribed", location: "New York, United States", orders: 6, amountSpent: 892.5 },
];

export const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
