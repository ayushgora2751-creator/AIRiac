export interface IndianCity {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
}

export const INDIAN_CITIES: IndianCity[] = [
  { id: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh UT', center: [30.7333, 76.7794], zoom: 12 },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi', center: [28.6139, 77.2090], zoom: 11 },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra', center: [19.0760, 72.8777], zoom: 11 },
  { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', center: [12.9716, 77.5946], zoom: 11 },
  { id: 'kolkata', name: 'Kolkata', state: 'West Bengal', center: [22.5726, 88.3639], zoom: 11 },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana', center: [17.3850, 78.4867], zoom: 11 },
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu', center: [13.0827, 80.2707], zoom: 11 },
  { id: 'pune', name: 'Pune', state: 'Maharashtra', center: [18.5204, 73.8567], zoom: 11 },
  { id: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', center: [26.8467, 80.9462], zoom: 11 },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', center: [26.9124, 75.7873], zoom: 11 },
  { id: 'patna', name: 'Patna', state: 'Bihar', center: [25.5941, 85.1376], zoom: 11 },
  { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', center: [23.0225, 72.5714], zoom: 11 },
  { id: 'jalandhar', name: 'Jalandhar', state: 'Punjab', center: [31.3260, 75.5762], zoom: 12 },
  { id: 'ludhiana', name: 'Ludhiana', state: 'Punjab', center: [30.9010, 75.8573], zoom: 12 },
  { id: 'amritsar', name: 'Amritsar', state: 'Punjab', center: [31.6340, 74.8723], zoom: 12 },
];
