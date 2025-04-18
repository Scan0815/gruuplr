
export interface GroupMember{
  userId: string;
  role: "user"| "admin";
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}