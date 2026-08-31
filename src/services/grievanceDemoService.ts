import type { Grievance } from '../types/grievance';
import { DEMO_GRIEVANCES } from '../data/grievanceDemoData';

export const getStorageKey = (userId: string) => `farmer_grievances_${userId}`;

export const grievanceDemoService = {
  getGrievances: async (userId: string): Promise<Grievance[]> => {
    try {
      // Small artificial delay for realism
      await new Promise(resolve => setTimeout(resolve, 300));

      const localData = localStorage.getItem(getStorageKey(userId));
      const localGrievances: Grievance[] = localData ? JSON.parse(localData) : [];
      
      // Merge demo data and local data
      const merged = [...localGrievances, ...DEMO_GRIEVANCES];
      
      // Sort by creation date, newest first
      return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error("Failed to fetch demo grievances:", error);
      return DEMO_GRIEVANCES;
    }
  },

  getGrievanceById: async (id: string, userId: string): Promise<Grievance | undefined> => {
    const all = await grievanceDemoService.getGrievances(userId);
    return all.find(g => g.id === id);
  },

  createGrievance: async (grievance: Omit<Grievance, 'id'>, userId: string): Promise<Grievance> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network

      // Generate a demo ID
      const newId = `KM-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
      
      const newGrievance: Grievance = {
        ...grievance,
        id: newId,
        farmerId: userId,
      };

      const localData = localStorage.getItem(getStorageKey(userId));
      const localGrievances: Grievance[] = localData ? JSON.parse(localData) : [];
      
      localGrievances.push(newGrievance);
      
      localStorage.setItem(getStorageKey(userId), JSON.stringify(localGrievances));
      return newGrievance;
    } catch (error) {
      console.error("Failed to create demo grievance:", error);
      throw error;
    }
  }
};
