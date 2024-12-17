import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SignIn from "./components/signIn";
import SignupForm from "./components/signUp";
import CreateBook from "./components/createBook";
import Admin from "./components/admin/admin";
import SuperAdmin from "./components/superAdmin";
import User from "./components/user";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignupForm />} />
        <Route path="/create-book" element={<CreateBook />} />
        <Route path="/user" element={<User />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}
