export interface Person {
  id: number;

  lastName: string;
  firstName: string;

  birthDate: string | null;
  birthPlace: string | null;

  nationality: string | null;
  sex: string | null;

  address: string | null;

  phone: string | null;
  secondaryPhone: string | null;

  email: string | null;

  photoReference: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface PersonCreateRequest {
  lastName: string;
  firstName: string;

  birthDate: string | null;
  birthPlace: string | null;

  nationality: string | null;
  sex: string | null;

  address: string | null;

  phone: string | null;
  secondaryPhone: string | null;

  email: string | null;

  photoReference: string | null;
}