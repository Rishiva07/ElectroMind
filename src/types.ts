export type Category = 'Mobile' | 'Laptop' | 'PC' | 'Monitor' | 'TV' | 'Appliances' | 'Audio';

export interface UserInput {
  category: Category;
  query: string;
  budget: number;
  currency?: string;
  expectedLifespan: number;
  usageType: 'Basic' | 'Office' | 'Heavy' | 'Gaming' | 'Travel';
  dailyUsageHours: number;
  productALinks: string[];
  productBLinks: string[];
  priorities: {
    battery: number;
    performance: number;
    durability: number;
    portability: number;
  };
}

export interface HardwareComponent {
  name: string; // e.g., "CPU", "Battery", "Chassis"
  details: string; // e.g., "Intel Core i7-13700H, 14 cores"
  tier: 'High' | 'Mid' | 'Low' | 'Enterprise';
  healthImpact: 'Critical' | 'Moderate' | 'Low';
}

export interface Product {
  id?: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  specs: Record<string, string>;
  components?: HardwareComponent[];
  durabilityScore: number;
  performanceScore: number;
  batteryScore: number;
  brandReliability: number;
  repairabilityScore: number;
  estimatedLifespan: number;
  trueCost: number;
  hiddenWarnings: string[];
  componentAnalysis: string;
  failureProbability?: string;
  confidenceScore?: number;
  ecoScore: number;
  carbonFootprint: {
    manufacturing: number;
    usage: number;
    logistics: number;
    total: number;
  };
}

export interface Recommendation {
  id?: string;
  userId: string;
  userInput: UserInput;
  winnerId: 'A' | 'B';
  productA: Product;
  productB: Product;
  productData?: Product; // For backward compatibility
  matchScore: number;
  comparisonSummary?: string;
  createdAt: number;
  feedback?: string;
}
