export interface User {
  [x: string]: any;
  userName: string;
  password: string;
  isAdmin:boolean
  Id: string;
}

export interface UserDocument extends User, Document {}
