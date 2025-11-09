
export type Issue = {
  id: string;
  type: "Waste" | "Infrastructure";
  description: string;
  status: "Reported" | "In Progress" | "Resolved";
  reportedBy: string;
  date: string;
  location: string;
  photoURL?: string;
};

export type FundingProject = {
  id: string;
  title: string;
  goal: number;
  current: number;
  description: string;
};

export type UserProfile = {
  id: string; // Corresponds to Firebase Auth UID
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type SupportContact = {
  id: string;
  name: string;
  number: string;
};

export type Transaction = {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  paymentMethod: "online" | "cash";
  contributorName: string;
  contributorId: string;
};
