import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {student, studentdocs} from "../models/student.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Teacher } from "../models/teacher.model.js";
// Sendmail import removed - email verification disabled



// Email verification removed - server not deployed yet

const generateAccessAndRefreshTokens = async (stdID) =>{ 
    try {
        
        const std = await student.findById(stdID)
        
        const Accesstoken = std.generateAccessToken()
        const Refreshtoken = std.generateRefreshToken()

        std.Refreshtoken = Refreshtoken
        await std.save({validateBeforeSave:false})

        return{Accesstoken, Refreshtoken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const signup = asyncHandler(async (req, res) =>{
    
    const{Firstname, Lastname, Email, Password} = req.body;

    
    if(
        [Firstname, Lastname, Email, Password].some((field)=> 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    
    const existedStudent = await student.findOne({ Email: req.body.Email });
    if(existedStudent){
        throw new ApiError(400, "Student already exist")
    }


    const cheakTeach=await Teacher.findOne({Email:req.body.Email});

    if(cheakTeach){
        throw new ApiError(400, "Email Belong to Teacher");
    }

    

    
    const newStudent = await student.create({
        Email,
        Firstname,
        Lastname,
        Password,
        Studentdetails:null,
        Isverified: true, // Auto-verify since email verification is disabled

    })

    const createdStudent = await student.findById(newStudent._id).select(
        "-Password "
    ) 
    
    if(!createdStudent){
        throw new ApiError(501, "Student registration failed")
    }
    
    return res.status(200).json(
        new ApiResponse(200, createdStudent, "Signup successful - Email verification disabled")
    )

})

// mailVerified function removed - email verification disabled


const login = asyncHandler(async(req,res) => {

    const Email = req.user.Email
    const Password = req.user.Password


    if([Email, Password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const StdLogin = await student.findOne({
        Email
    })

    if(!StdLogin){
        throw new ApiError(400, "Student does not exist")
    }

    // Email verification check removed - auto-verified during signup

    const StdPassCheck = await StdLogin.isPasswordCorrect(Password)

    if(!StdPassCheck){
        throw new ApiError(403,"Password is incorrect",)
    }

    const tempStd = StdLogin._id

    
    const {Accesstoken, Refreshtoken} =  await generateAccessAndRefreshTokens(tempStd)

    const loggedInStd = await student.findById(tempStd).select("-Password -Refreshtoken")

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("Accesstoken", Accesstoken, options)
    .cookie("Refreshtoken", Refreshtoken, options)
    .json(
        new ApiResponse(
            200,{
            user:loggedInStd
            }, "logged in"
            )
    )

})

const logout = asyncHandler(async(req,res)=>{
    await student.findByIdAndUpdate(
        req.Student._id,
        {
            $set:{
                Refreshtoken:undefined,
            }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .clearCookie("Accesstoken", options)
    .clearCookie("Refreshtoken",  options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const getStudent = asyncHandler(async(req,res)=>{
    const user = req.Student
    const id = req.params.id
    if(req.Student._id != id){
        throw new ApiError(400, "unauthroized access")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, user, "Student is logged in"))
})
const addStudentDetails = asyncHandler(async(req, res)=>{

    const id = req.params.id
    if(req.Student._id != id){
        throw new ApiError(400,"not authorized ")
    }

    const {Phone, Address, Highesteducation, SecondarySchool, HigherSchool, SecondaryMarks, HigherMarks}  = req.body

    if ([Phone, Address, Highesteducation, SecondarySchool, HigherSchool, SecondaryMarks, HigherMarks].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const alreadyExist = await studentdocs.findOne({Phone})

    if(alreadyExist){
        throw new ApiError(400, "phone number already exists")
    }

    const AadhaarLocalPath = req.files?.Aadhaar?.[0]?.path;

    const SecondaryLocalPath = req.files?.Secondary?.[0]?.path;

    const HigherLocalPath = req.files?.Higher?.[0]?.path

    if(!AadhaarLocalPath){
        throw new ApiError(400, "Aadhaar is required")
    }

    if(!SecondaryLocalPath){
        throw new ApiError(400, "Secondary marksheet is required")
    }

    if(!HigherLocalPath){
        throw new ApiError(400, "Higher marksheet is required")
    }

    const Aadhaar = await uploadOnCloudinary(AadhaarLocalPath)
    const Secondary = await uploadOnCloudinary(SecondaryLocalPath)

    const Higher = await uploadOnCloudinary(HigherLocalPath)

    const studentdetails = await studentdocs.create({
        Phone,
        Address,
        Highesteducation,
        SecondarySchool,
        HigherSchool,
        SecondaryMarks,
        HigherMarks,
        Aadhaar: Aadhaar.url,
        Secondary: Secondary.url,
        Higher: Higher.url,
    })


    //const loggedstd = await student.findByIdAndUpdate(id, {})

    const theStudent = await student.findOneAndUpdate({_id: id}, {$set: {Isapproved:"pending", Studentdetails: studentdetails._id}},  { new: true }).select("-Password -Refreshtoken")
    
    
    if(!theStudent){
        throw new ApiError(400,"faild to approve or reject || student not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, theStudent, "documents uploaded successfully"))

})




const forgetPassword=asyncHandler(async(req,res)=>{

   const { Email } =  req.body

   if(!Email){
    throw new ApiError(400, "Email is required")
    }
   
    const User=await student.findOne({Email});

    if(!User){
       throw new ApiError(404,"email not found!!");
    }

   await User.generateResetToken();

   await User.save();

   const resetToken=`${process.env.FRONTEND_URL}/student/forgetpassword/${User.forgetPasswordToken}`
  
   const subject='RESET PASSWORD'

   const message=` <p>Dear ${User.Firstname}${User.Lastname},</p>
   <p>We have received a request to reset your password. To proceed, please click on the following link: <a href="${resetToken}" target="_blank">reset your password</a>.</p>
   <p>If the link does not work for any reason, you can copy and paste the following URL into your browser's address bar:</p>
   <p>${resetToken}</p>
   <p>Thank you for being a valued member of the Shiksharthee community. If you have any questions or need further assistance, please do not hesitate to contact our support team.</p>
   <p>Best regards,</p>
   <p>The Shiksharthee Team</p>`

   // Email sending removed - email verification disabled
   // Password reset would require manual intervention or alternative method
   
   res.status(200).json({
       success: true,
       message: "Password reset functionality disabled - email verification not available"
   })


})



const  resetPassword= asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password,confirmPassword} = req.body;

    if(password != confirmPassword){
        throw new ApiError(400,"password does not match")
    }
        

    try {
        const user = await student.findOne({
            forgetPasswordToken:token,
            forgetPasswordExpiry: { $gt: Date.now() }
        });
         console.log("flag2",user);

        if (!user) {
            throw new ApiError(400, 'Token is invalid or expired. Please try again.');
        }

   

        user.Password = password; 
        user.forgetPasswordExpiry = undefined;
        user.forgetPasswordToken = undefined;

        await user.save(); 

        res.status(200).json({
            success: true,
            message: 'Password changed successfully!'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        throw new ApiError(500, 'Internal server error!!!');
    }
});



export{
    signup,
     mailVerified,
      login, 
      logout, 
      addStudentDetails,
       getStudent, 
       forgetPassword,
       resetPassword
}
