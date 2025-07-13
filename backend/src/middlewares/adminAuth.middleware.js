import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { admin } from "../models/admin.model.js";

const authAdmin = asyncHandler(async(req,_,next) =>{

    const { username, password } = req.body;

    if(!username || !password) {
        throw new ApiError(401, "Username and password are required")
    }

    const Admin = await admin.findOne({ username });

    if(!Admin){
        throw new ApiError(401, "Invalid username or password")
    }

    const isPasswordValid = await Admin.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid username or password")
    }

    req.Admin = Admin
    next()

    
})

export { authAdmin }