export interface Provider {
  id: string;
  name: string;
  service: string;
  category: string;
  location: string;
  image: string;
  verified: boolean;
  rating: number;
  jobsCompleted: number;
  status: 'pending' | 'verified' | 'active';
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameNp: string;
  icon: string;
  count: number;
  description: string;
  categoryGroup: 'home' | 'delivery' | 'personal' | 'education' | 'outdoor';
}

export interface CategoryGroup {
  id: string;
  name: string;
  nameNp: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ServiceRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  description: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  status: 'submitted' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  assignedProvider?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ SERVICE CATEGORY GROUPS ============
export const categoryGroups: CategoryGroup[] = [
  { id: 'home', name: 'Home & Maintenance', nameNp: 'घर र मर्मत', icon: 'Home', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'delivery', name: 'Delivery & Transport', nameNp: 'डेलिभरी र यातायात', icon: 'Truck', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'personal', name: 'Personal & Lifestyle', nameNp: 'व्यक्तिगत र जीवनशैली', icon: 'User', color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
  { id: 'education', name: 'Education & Professional', nameNp: 'शिक्षा र पेशागत', icon: 'GraduationCap', color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'outdoor', name: 'Outdoor & Local Services', nameNp: 'बाहिरी र स्थानीय सेवा', icon: 'TreePine', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
];

// ============ EXPANDED SERVICE CATEGORIES (26 services) ============
export const categories: ServiceCategory[] = [
  // ── Home & Maintenance ──
  { id: 'plumbing', name: 'Plumbing', nameNp: 'प्लम्बिङ', icon: 'Wrench', count: 8, description: 'Pipe repair, installation, water heater', categoryGroup: 'home' },
  { id: 'electrical', name: 'Electrical', nameNp: 'बिजुली', icon: 'Zap', count: 12, description: 'Wiring, switches, electrical repair', categoryGroup: 'home' },
  { id: 'cleaning', name: 'Cleaning', nameNp: 'सफाई', icon: 'Sparkles', count: 15, description: 'Home / Office / Deep Cleaning', categoryGroup: 'home' },
  { id: 'painting', name: 'Painting', nameNp: 'रंगाई', icon: 'Paintbrush', count: 6, description: 'Interior & exterior painting', categoryGroup: 'home' },
  { id: 'carpentry', name: 'Carpentry', nameNp: 'काठको काम', icon: 'Hammer', count: 9, description: 'Furniture repair, woodwork, doors', categoryGroup: 'home' },
  { id: 'appliance', name: 'Appliance Repair', nameNp: 'उपकरण मर्मत', icon: 'Settings', count: 8, description: 'Fridge, TV, Washing Machine, AC repair', categoryGroup: 'home' },
  { id: 'water-tank', name: 'Water Tank Cleaning', nameNp: 'पानी ट्याङ्की सफाई', icon: 'Droplets', count: 3, description: 'Water tank cleaning & sanitization', categoryGroup: 'home' },
  { id: 'pest-control', name: 'Pest Control', nameNp: 'किरा नियन्त्रण', icon: 'Bug', count: 4, description: 'Pest control and fumigation', categoryGroup: 'home' },

  // ── Delivery & Transport ──
  { id: 'grocery', name: 'Grocery Delivery', nameNp: 'किराना डेलिभरी', icon: 'ShoppingBag', count: 10, description: 'Daily essentials delivered to your door', categoryGroup: 'delivery' },
  { id: 'pharmacy', name: 'Pharmacy Delivery', nameNp: 'औषधी डेलिभरी', icon: 'Pill', count: 5, description: 'Medicine delivery from verified pharmacies', categoryGroup: 'delivery' },
  { id: 'delivery', name: 'Express Delivery', nameNp: 'एक्सप्रेस डेलिभरी', icon: 'Truck', count: 14, description: 'Fast delivery across Jhapa District', categoryGroup: 'delivery' },
  { id: 'courier', name: 'Courier & Parcel', nameNp: 'कुरियर र पार्सल', icon: 'Package', count: 6, description: 'Courier and parcel delivery services', categoryGroup: 'delivery' },
  { id: 'vehicle-driver', name: 'Vehicle with Driver', nameNp: 'ड्राइभर सहित गाडी', icon: 'Car', count: 7, description: 'Pickup / delivery vehicle with driver', categoryGroup: 'delivery' },
  { id: 'house-shifting', name: 'House Shifting', nameNp: 'घर सार्ने', icon: 'Home', count: 5, description: 'House shifting and moving help', categoryGroup: 'delivery' },

  // ── Personal & Lifestyle ──
  { id: 'beauty', name: 'Beauty & Salon', nameNp: 'ब्युटी पार्लर', icon: 'Scissors', count: 7, description: 'Haircut, facial, beauty services at home', categoryGroup: 'personal' },
  { id: 'barber', name: 'Barber at Home', nameNp: 'घरमा हजाम', icon: 'Scissors', count: 5, description: 'Professional barber at your doorstep', categoryGroup: 'personal' },
  { id: 'massage', name: 'Massage & Wellness', nameNp: 'मालिस र वेलनेस', icon: 'Heart', count: 3, description: 'Home massage and wellness services', categoryGroup: 'personal' },
  { id: 'tailoring', name: 'Tailoring & Alteration', nameNp: 'सिलाई र अल्टरेसन', icon: 'Ruler', count: 4, description: 'Tailoring, stitching and alteration', categoryGroup: 'personal' },

  // ── Education & Professional ──
  { id: 'tutoring', name: 'Tutoring', nameNp: 'ट्युसन', icon: 'BookOpen', count: 11, description: 'Home / Online tuition for all grades', categoryGroup: 'education' },
  { id: 'computer-repair', name: 'Computer & Mobile Repair', nameNp: 'कम्प्युटर र मोबाइल मर्मत', icon: 'Laptop', count: 6, description: 'Computer and mobile phone repair', categoryGroup: 'education' },
  { id: 'cctv', name: 'CCTV Installation', nameNp: 'सीसीटीभी जडान', icon: 'Camera', count: 4, description: 'CCTV camera installation and setup', categoryGroup: 'education' },
  { id: 'internet', name: 'Internet & WiFi Setup', nameNp: 'इन्टरनेट र वाइफाइ', icon: 'Wifi', count: 5, description: 'Internet / WiFi installation & troubleshooting', categoryGroup: 'education' },

  // ── Outdoor & Local Services ──
  { id: 'gardening', name: 'Gardening & Landscaping', nameNp: 'बगैंचा र ल्यान्डस्केपिङ', icon: 'Flower2', count: 4, description: 'Garden maintenance, landscaping', categoryGroup: 'outdoor' },
  { id: 'daily-helper', name: 'Daily Helper', nameNp: 'दैनिक सहायक', icon: 'UserCheck', count: 8, description: 'Cleaning helper / daily household help', categoryGroup: 'outdoor' },
  { id: 'event-setup', name: 'Event Setup', nameNp: 'कार्यक्रम सेटअप', icon: 'PartyPopper', count: 3, description: 'Event setup and decoration assistance', categoryGroup: 'outdoor' },
  { id: 'hardware', name: 'Hardware & Local Shop', nameNp: 'हार्डवेयर र स्थानीय पसल', icon: 'Store', count: 5, description: 'Hardware and local shop services', categoryGroup: 'outdoor' },
];

// Helper: get categories by group
export function getCategoriesByGroup(groupId: string): ServiceCategory[] {
  return categories.filter(c => c.categoryGroup === groupId);
}

// ============ STANDARDIZED VEHICLE TYPES ============
export interface VehicleType {
  name: string;
  nameNp: string;
  description: string;
  icon: string;
  capacity: number;
  sortOrder: number;
}

export const VEHICLE_TYPES: VehicleType[] = [
  { name: 'Bicycle', nameNp: 'साइकल', description: 'Eco-friendly short-distance transport', icon: 'Bike', capacity: 1, sortOrder: 1 },
  { name: 'Motorcycle', nameNp: 'मोटरसाइकल', description: 'Fast two-wheeler for quick trips and deliveries', icon: 'Bike', capacity: 2, sortOrder: 2 },
  { name: 'Scooter', nameNp: 'स्कुटर', description: 'Light two-wheeler for short trips', icon: 'Bike', capacity: 2, sortOrder: 3 },
  { name: 'Auto Rickshaw', nameNp: 'अटो रिक्सा', description: 'Three-wheeler for short-distance passenger travel', icon: 'Car', capacity: 3, sortOrder: 4 },
  { name: 'Car (Hatchback)', nameNp: 'कार (ह्याचब्याक)', description: 'Compact car for city rides', icon: 'Car', capacity: 4, sortOrder: 5 },
  { name: 'Car (Sedan)', nameNp: 'कार (सेडान)', description: 'Standard sedan for comfortable rides', icon: 'Car', capacity: 4, sortOrder: 6 },
  { name: 'Car (SUV)', nameNp: 'कार (एसयूभी)', description: 'SUV for rough terrain and group travel', icon: 'Car', capacity: 7, sortOrder: 7 },
  { name: 'Pickup / Mini Truck', nameNp: 'पिकअप / मिनी ट्रक', description: 'Small goods transport vehicle', icon: 'Truck', capacity: 2, sortOrder: 8 },
  { name: 'Delivery Van', nameNp: 'डेलिभरी भ्यान', description: 'Enclosed van for secure deliveries', icon: 'Truck', capacity: 2, sortOrder: 9 },
  { name: 'Mini Truck (Tata Ace / Bolero Pickup)', nameNp: 'मिनी ट्रक (टाटा एस / बोलेरो पिकअप)', description: 'Light commercial vehicle for medium loads', icon: 'Truck', capacity: 2, sortOrder: 10 },
  { name: 'Truck (Medium)', nameNp: 'ट्रक (मध्यम)', description: 'Medium-duty truck for larger cargo', icon: 'Truck', capacity: 2, sortOrder: 11 },
  { name: 'Truck (Heavy)', nameNp: 'ट्रक (ठूलो)', description: 'Heavy-duty truck for bulk transport', icon: 'Truck', capacity: 2, sortOrder: 12 },
  { name: 'Tractor', nameNp: 'ट्र्याक्टर', description: 'Agricultural and heavy-duty hauling', icon: 'Truck', capacity: 2, sortOrder: 13 },
  { name: 'Electric Scooter', nameNp: 'इलेक्ट्रिक स्कुटर', description: 'Eco-friendly electric two-wheeler', icon: 'Zap', capacity: 2, sortOrder: 14 },
  { name: 'Electric Car', nameNp: 'इलेक्ट्रिक कार', description: 'Zero-emission electric vehicle', icon: 'Zap', capacity: 4, sortOrder: 15 },
];

export const VEHICLE_TYPE_NAMES: string[] = VEHICLE_TYPES.map(v => v.name);

// ============ STANDARDIZED JHAPA DISTRICT AREAS ============
export interface JhapaArea {
  name: string;
  nameNp: string;
  district: string;
  description: string;
  sortOrder: number;
}

export const JHAPA_AREAS: JhapaArea[] = [
  { name: 'Birtamode', nameNp: 'बिर्तामोड', district: 'Jhapa', description: 'Major commercial hub of Jhapa', sortOrder: 1 },
  { name: 'Damak', nameNp: 'दमक', district: 'Jhapa', description: 'Second largest city in Jhapa', sortOrder: 2 },
  { name: 'Mechinagar', nameNp: 'मेचीनगर', district: 'Jhapa', description: 'Municipality near India border', sortOrder: 3 },
  { name: 'Bhadrapur', nameNp: 'भद्रपुर', district: 'Jhapa', description: 'District headquarters of Jhapa', sortOrder: 4 },
  { name: 'Arjundhara', nameNp: 'अर्जुनधारा', district: 'Jhapa', description: 'Municipality in central Jhapa', sortOrder: 5 },
  { name: 'Kankai', nameNp: 'कन्काई', district: 'Jhapa', description: 'Municipality along Kankai river', sortOrder: 6 },
  { name: 'Shivasatakshi', nameNp: 'शिवसताक्षी', district: 'Jhapa', description: 'Municipality in Jhapa', sortOrder: 7 },
  { name: 'Gauradaha', nameNp: 'गौरादह', district: 'Jhapa', description: 'Municipality in southern Jhapa', sortOrder: 8 },
  { name: 'Gaurigunj', nameNp: 'गौरीगंज', district: 'Jhapa', description: 'Market area in Jhapa', sortOrder: 9 },
  { name: 'Haldibari', nameNp: 'हल्दीबारी', district: 'Jhapa', description: 'Rural municipality in Jhapa', sortOrder: 10 },
  { name: 'Jhapa Rural Municipality', nameNp: 'झापा गाउँपालिका', district: 'Jhapa', description: 'Rural municipality', sortOrder: 11 },
  { name: 'Kamal', nameNp: 'कमल', district: 'Jhapa', description: 'Rural municipality in Jhapa', sortOrder: 12 },
  { name: 'Barhadashi', nameNp: 'बरहदशी', district: 'Jhapa', description: 'Rural municipality in Jhapa', sortOrder: 13 },
  { name: 'Buddhashanti', nameNp: 'बुद्धशान्ति', district: 'Jhapa', description: 'Rural municipality in Jhapa', sortOrder: 14 },
  { name: 'Kachankawal', nameNp: 'कचनकवल', district: 'Jhapa', description: 'Rural municipality in Jhapa', sortOrder: 15 },
  { name: 'Charali', nameNp: 'चारआली', district: 'Jhapa', description: 'Important junction town in Jhapa', sortOrder: 16 },
  { name: 'Sanischare', nameNp: 'सनिश्चरे', district: 'Jhapa', description: 'Town in Jhapa district', sortOrder: 17 },
  { name: 'Surunga', nameNp: 'सुरुङ्गा', district: 'Jhapa', description: 'Town in Jhapa district', sortOrder: 18 },
  { name: 'Dudhe', nameNp: 'दुधे', district: 'Jhapa', description: 'Area in Jhapa district', sortOrder: 19 },
  { name: 'Prithvinagar', nameNp: 'पृथ्वीनगर', district: 'Jhapa', description: 'Area in Jhapa district', sortOrder: 20 },
  { name: 'Rajgadh', nameNp: 'राजगढ', district: 'Jhapa', description: 'Area in Jhapa district', sortOrder: 21 },
  { name: 'Taganduba', nameNp: 'टागानडुबा', district: 'Jhapa', description: 'Area in Jhapa district', sortOrder: 22 },
];

export const JHAPA_AREA_NAMES: string[] = JHAPA_AREAS.map(a => a.name);

export function formatLocation(areaName: string): string {
  if (!areaName) return '';
  if (areaName.startsWith('Jhapa,') || areaName.startsWith('Jhapa District')) return areaName;
  return `Jhapa, ${areaName}`;
}

export function extractAreaName(location: string): string {
  if (!location) return '';
  return location.replace(/^Jhapa,\s*/, '').replace(/^Jhapa District,\s*/, '').trim();
}

export function isValidJhapaArea(areaName: string): boolean {
  const normalized = extractAreaName(areaName).toLowerCase();
  return JHAPA_AREAS.some(a => a.name.toLowerCase() === normalized);
}

export function isValidVehicleType(vehicleName: string): boolean {
  return VEHICLE_TYPES.some(v => v.name.toLowerCase() === vehicleName.toLowerCase());
}



// ============ HARDCODED PROVIDERS (fallback) ============
export const providers: Provider[] = [
  { id: 'p1', name: 'Ram Bahadur Tamang', service: 'Master Plumber', category: 'plumbing', location: 'Jhapa, Birtamode', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565806909_a7c0f2bf.jpg', verified: true, rating: 4.8, jobsCompleted: 45, status: 'active' },
  { id: 'p2', name: 'Sita Sharma', service: 'Electrician', category: 'electrical', location: 'Jhapa, Damak', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565925841_d010e44a.jpg', verified: true, rating: 4.9, jobsCompleted: 62, status: 'active' },
  { id: 'p3', name: 'Bikash Gurung', service: 'House Cleaner', category: 'cleaning', location: 'Jhapa, Bhadrapur', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565804545_7992866e.jpg', verified: true, rating: 4.7, jobsCompleted: 38, status: 'active' },
  { id: 'p4', name: 'Anita Rai', service: 'Painter', category: 'painting', location: 'Jhapa, Birtamode', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565934966_e89ffc90.jpg', verified: true, rating: 4.6, jobsCompleted: 29, status: 'active' },
  { id: 'p5', name: 'Deepak Shrestha', service: 'Carpenter', category: 'carpentry', location: 'Jhapa, Mechinagar', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565800028_ddc42d33.jpg', verified: true, rating: 4.9, jobsCompleted: 51, status: 'active' },
  { id: 'p6', name: 'Kamala Thapa', service: 'Beauty Expert', category: 'beauty', location: 'Jhapa, Damak', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565927578_46144b7f.jpg', verified: true, rating: 4.8, jobsCompleted: 73, status: 'active' },
  { id: 'p7', name: 'Sunil Maharjan', service: 'Delivery Rider', category: 'delivery', location: 'Jhapa, Birtamode', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565889111_86a81abc.png', verified: true, rating: 4.7, jobsCompleted: 120, status: 'active' },
  { id: 'p8', name: 'Prabha Adhikari', service: 'Home Tutor', category: 'tutoring', location: 'Jhapa, Kankai', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565948946_8812de55.png', verified: true, rating: 5.0, jobsCompleted: 34, status: 'active' },
  { id: 'p9', name: 'Hari Prasad Koirala', service: 'AC Technician', category: 'appliance', location: 'Jhapa, Arjundhara', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565897585_c9d60157.png', verified: true, rating: 4.5, jobsCompleted: 27, status: 'active' },
  { id: 'p10', name: 'Maya Lama', service: 'Grocery Store', category: 'grocery', location: 'Jhapa, Gauradaha', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565935344_df15a23c.jpg', verified: true, rating: 4.8, jobsCompleted: 89, status: 'active' },
  { id: 'p11', name: 'Rajesh Karki', service: 'Gardener', category: 'gardening', location: 'Jhapa, Shivasatakshi', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565912726_18ca6b50.png', verified: true, rating: 4.6, jobsCompleted: 18, status: 'active' },
  { id: 'p12', name: 'Sunita Basnet', service: 'Pharmacy', category: 'pharmacy', location: 'Jhapa, Birtamode', image: 'https://d64gsuwffb70l.cloudfront.net/6988b02d335c01cabe88cbd3_1770565937674_d010ae46.jpg', verified: true, rating: 4.9, jobsCompleted: 56, status: 'active' },
];

export const sampleRequests: ServiceRequest[] = [];

export const stats = {
  verifiedProviders: 47,
  completedJobs: 312,
  happyClients: 289,
  activeRiders: 14,
};

export const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  assigned: 'bg-purple-100 text-purple-800 border-purple-300',
  'in-progress': 'bg-orange-100 text-orange-800 border-orange-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export const statusLabels: Record<string, string> = {
  submitted: 'Request Submitted',
  confirmed: 'Details Confirmed',
  assigned: 'Provider Assigned',
  'in-progress': 'Work In Progress',
  completed: 'Job Completed',
  cancelled: 'Cancelled',
};
