export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  birthDate: string;
  gender: string;
  address: {
    city: string;
    state: string;
  };
  company: {
    name: string;
    title: string;
  };
}

// DummyJSON wraps its user list in this response object
export interface UserApiResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}
