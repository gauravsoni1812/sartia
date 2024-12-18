import { Router } from "express";
import signinDetails from "../apis/auth/signIn";
import signupDetails from "../apis/auth/signup";
import createUser from "../apis/superAdmin/createUser";
import getAllBooks from "../apis/superAdmin/getAllBooks";
import updateBook from "../apis/superAdmin/update_book";
import createBooks from "../apis/admin/createBook";
import updateBookByAdmin from "../apis/admin/updateBook";
import showBooks from "../apis/user/showbooks";
import deleteAllData from "../apis/admin/delete_data";
import buyBook from "../apis/user/buyBook";
import purchasedBooks from "../apis/user/purchasedbooks";
import resetPassword, { resetPasswordHandler } from "../apis/auth/resetPassword";
 

const userRouter = Router();

// Set up routes correctly
userRouter.use("/signin", signinDetails); // Will match POST /signin
userRouter.use("/signup", signupDetails); // Will match POST /signup
userRouter.use("/resetpassword", resetPassword); // Will match POST /signup
userRouter.use("/resetpasswordhandler", resetPasswordHandler); // Will match POST /signup


 //superAdmin
userRouter.use("/createUser", createUser); 
userRouter.use("/getAllBooks", getAllBooks);
userRouter.use("/updateBook", updateBook);

//admin
userRouter.use("/createBook",createBooks)
userRouter.use("/updateBookByAdmin",updateBookByAdmin)
userRouter.use("/deleteAll",deleteAllData)


//user
userRouter.use("/showBooks",showBooks)
userRouter.use("/buyBook",buyBook)
userRouter.use("/purchased",purchasedBooks)

 
// You can add more routes here as needed

export default userRouter;
