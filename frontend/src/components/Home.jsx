/* eslint-disable no-constant-condition */
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [role, setRole] = useState(null);
  const navigate = useNavigate()
 
  useEffect(() => {
    const token = Cookies.get("authToken");
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role); // Assuming "role" is present in the token
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }else{
        navigate("/sign-in")
    }
  }, []);
  
  if(role === "user"){
    navigate("/user")
  }
  if(role === "admin"){
    navigate("/admin")
  }
 
  return (
    <>
    </>
  );
};

export default Home