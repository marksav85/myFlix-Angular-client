export interface User {
  _id: string;
  Username: string;
  Email: string;
  Birthday?: string | null;
  FavoriteMovies: string[];
}

export interface LoginPayload {
  Username: string;
  Password: string;
}

export interface RegistrationPayload extends LoginPayload {
  Email: string;
  Birthday: string;
}

export type ProfileUpdatePayload = RegistrationPayload;

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Director {
  Name: string;
  Bio: string;
}

export interface Genre {
  Name: string;
  Description: string;
}

export interface Movie {
  _id: string;
  Title: string;
  Description: string;
  Genre: Genre;
  Director: Director;
  ImagePath?: string;
  Featured?: boolean;
}
