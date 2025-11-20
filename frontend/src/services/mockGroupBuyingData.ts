// frontend/src/services/mockGroupBuyingData.ts

export interface GroupParticipant {
  name: string;
  avatar: string;
  distance?: string;
  pincode?: string;
}

export interface GroupSavings {
  cost: number;
  co2: number;
  percentage: number;
}

export interface GroupBuyOption {
  id: string;
  name: string;
  matchingProducts: string[];
  participants: GroupParticipant[];
  savings: GroupSavings;
  minParticipants: number;
  currentParticipants: number;
  spotsLeft?: number;
  deadline: string;
  estimatedDelivery: string;
  status: 'available' | 'almost-full' | 'full';
  avgDistance?: number;
  commonCategories?: string[];
  trustScore?: number;
  successfulOrders?: number;
  neighborhood?: string;
  isPremium?: boolean;
}

export class MockGroupBuyingService {
  private static calculateSavings(cartTotal: number, percentage: number) {
    return {
      cost: Math.round(cartTotal * (percentage / 100)),
      co2: Math.round((percentage / 3) * 10) / 10, // Mock CO2 calculation
      percentage: percentage
    };
  }

  private static getRandomParticipants(pincode: string): GroupParticipant[] {
    const names = [
      { name: 'Priya S.', avatar: '👩' },
      { name: 'Rahul M.', avatar: '👨' },
      { name: 'Sneha P.', avatar: '👱‍♀️' },
      { name: 'Arjun D.', avatar: '🧑' },
      { name: 'Amit K.', avatar: '👨‍💼' },
      { name: 'Neha S.', avatar: '👩‍🦰' },
      { name: 'Vikram R.', avatar: '🧔' },
      { name: 'Pooja V.', avatar: '👩‍💻' },
      { name: 'Karan J.', avatar: '👨‍🎓' },
      { name: 'Anjali N.', avatar: '👩‍🏫' }
    ];

    const distances = ['0.5 km', '0.8 km', '1.2 km', '1.5 km', '1.8 km', '2.1 km', '2.5 km'];

    // Randomly select 2-4 participants
    const count = Math.floor(Math.random() * 3) + 2;
    const selected = names.sort(() => 0.5 - Math.random()).slice(0, count);

    return selected.map((person, index) => ({
      ...person,
      distance: distances[index],
      pincode: pincode
    }));
  }

  public static async getMockGroups(pincode: string, cartItems: any[]): Promise<{
    success: boolean;
    suggestions: GroupBuyOption[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Calculate cart total
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get product names for matching
    const productNames = cartItems.slice(0, 3).map(item => item.name || 'Eco Product');

    // Generate mock groups based on pincode
    const groups: GroupBuyOption[] = [];

    // Group 1: Best Match - Almost Full
    const participants1 = this.getRandomParticipants(pincode);
    groups.push({
      id: `gb_eco_${pincode}_1`,
      name: 'Mumbai Green Collective',
      matchingProducts: productNames,
      participants: participants1,
      savings: this.calculateSavings(cartTotal, 15),
      minParticipants: participants1.length + 1,
      currentParticipants: participants1.length,
      spotsLeft: 1,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'almost-full',
      trustScore: 4.8,
      successfulOrders: 23,
      neighborhood: this.getNeighborhood(pincode),
      avgDistance: 1.4,
      commonCategories: ['kitchen', 'home', 'electronics']
    });

    // Group 2: Good savings - Available
    const participants2 = this.getRandomParticipants(pincode).slice(0, 2);
    groups.push({
      id: `gb_eco_${pincode}_2`,
      name: 'Sustainable Shoppers Alliance',
      matchingProducts: productNames.slice(0, 2),
      participants: participants2,
      savings: this.calculateSavings(cartTotal, 18),
      minParticipants: 4,
      currentParticipants: participants2.length,
      spotsLeft: 4 - participants2.length,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      status: 'available',
      trustScore: 4.6,
      successfulOrders: 18,
      neighborhood: this.getNeighborhood(pincode),
      avgDistance: 1.0,
      commonCategories: ['kitchen', 'beauty']
    });

    // Group 3: Premium - Best savings
    if (Math.random() > 0.3) { // 70% chance to show premium group
      const participants3 = this.getRandomParticipants(pincode).slice(0, 3);
      groups.push({
        id: `gb_premium_${pincode}_3`,
        name: 'EcoElite Premium Group',
        matchingProducts: productNames,
        participants: participants3,
        savings: this.calculateSavings(cartTotal, 22),
        minParticipants: 3,
        currentParticipants: 3,
        spotsLeft: 0,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'full',
        trustScore: 4.9,
        successfulOrders: 42,
        neighborhood: this.getNeighborhood(pincode),
        isPremium: true,
        avgDistance: 2.2,
        commonCategories: ['electronics', 'home', 'clothing']
      });
    }

    return {
      success: true,
      suggestions: groups
    };
  }

  private static getNeighborhood(pincode: string): string {
    const neighborhoods: { [key: string]: string } = {
      '400701': 'Bandra West',
      '400702': 'Bandra East',
      '400703': 'Andheri West',
      '400704': 'Andheri East',
      '400705': 'Goregaon',
      '400706': 'Malad',
      '400707': 'Kandivali',
      '400708': 'Borivali'
    };

    return neighborhoods[pincode] || 'Mumbai Suburbs';
  }
}