export interface Category {
  _id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  _id?: string;
  name: string;
  abbreviation: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}
