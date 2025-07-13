import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Teacher, Teacherdocs } from "../models/teacher.model.js"; 
import { ApiResponse } from "../utils/ApiResponse.js";
// Sendmail import removed - email verification disabled
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { student } from "../models/student.model.js";

// Email verification removed - server not deployed yet

const generateAccessAndRefreshTokens = async (teacherId) => { 
    try {
        const teacher = await Teacher.findById(teacherId);
        const Accesstoken = teacher.generateAccessToken();
        const Refreshtoken = teacher.generateRefreshToken();

        teacher.Refreshtoken = Refreshtoken;
        await teacher.save({ validateBeforeSave: false });

        return { Accesstoken, Refreshtoken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

const signup = asyncHandler(async (req, res) => {
    const { Firstname, Lastname, Email, Password } = req.body;

    if ([Firstname, Lastname, Email, Password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedTeacher = await Teacher.findOne({ Email });

    if (existedTeacher) {
        throw new ApiError(400, "Teacher already exists");
    }
    const existedStudent = await student.findOne({ Email: req.body.Email });
    if(existedStudent){
        throw new ApiError(400, "Email Belong to Student")
    }

    const newTeacher = await Teacher.create({
        Email,
        Firstname,
        Lastname,
        Password,
        Teacherdetails:null,
        Isverified: true, // Auto-verify since email verification is disabled
    });

    const createdTeacher = await Teacher.findById(newTeacher._id).select("-Password");

    if (!createdTeacher) {
        throw new ApiError(501, "Teacher registration failed");
    }

    return res.status(200).json(
        new ApiResponse(200, createdTeacher, "Signup successful - Email verification disabled")
    );
});

// mailVerified function removed - email verification disabled

const login = asyncHandler(async (req, res) => {

    const Email = req.user.Email
    const Password = req.user.Password

    if (!Email) {
        throw new ApiError(400, "E-mail is required");
    }
    if (!Password) {
        throw new ApiError(400, "Password is required");
    }

    const teacher = await Teacher.findOne({ Email });

    if (!teacher) {
        throw new ApiError(403, "Teacher does not exist");
    }

    // Email verification check removed - auto-verified during signup
    
    const isPasswordCorrect = await teacher.isPasswordCorrect(Password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { Accesstoken, Refreshtoken } = await generateAccessAndRefreshTokens(teacher._id);

    const loggedInTeacher = await Teacher.findById(teacher._id).select("-Password -Refreshtoken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("Accesstoken", Accesstoken, options)
        .cookie("Refreshtoken", Refreshtoken, options)
        .json(new ApiResponse(200, { user: loggedInTeacher }, "Logged in"));
});

const logout = asyncHandler(async(req, res)=>{
    await Teacher.findByIdAndUpdate(req.teacher?._id,
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

const getTeacher = asyncHandler(async(req,res) =>{
    const user = req.teacher

    const id = req.params.id
    if(req.teacher._id != id){
        throw new ApiError(400, "unauthroized access")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Teacher is logged in"))
})

const addTeacherDetails = asyncHandler(async(req,res)=>{

    const id = req.params.id
    if(req.teacher._id != id){
        throw new ApiError(400, "unauthroized access")
    }

    const{Phone, Address, Experience, SecondarySchool, HigherSchool,UGcollege, PGcollege, SecondaryMarks, HigherMarks, UGmarks, PGmarks} = req.body

    if([Phone, Address, Experience, SecondarySchool, HigherSchool,UGcollege, PGcollege, SecondaryMarks, HigherMarks, UGmarks, PGmarks].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const alreadyExist = await Teacherdocs.findOne({Phone})

    if(alreadyExist){
        throw new ApiError(400, "Phone number already exist")
    }

    const AadhaarLocalPath = req.files?.Aadhaar?.[0]?.path;

    const SecondaryLocalPath = req.files?.Secondary?.[0]?.path;

    const HigherLocalPath = req.files?.Higher?.[0]?.path

    const UGLocalPath = req.files?.UG?.[0]?.path

    const PGLocalPath = req.files?.PG?.[0]?.path


    if(!AadhaarLocalPath){
        throw new ApiError(400, "Aadhaar is required")
    }
    if(!SecondaryLocalPath){
        throw new ApiError(400, "Secondary marksheet is required")
    }
    if(!HigherLocalPath){
        throw new ApiError(400, "Higher marksheet is required")
    }
    if(!UGLocalPath){
        throw new ApiError(400, "UG marksheet is required")
    }
    if(!PGLocalPath){
        throw new ApiError(400, "PG marksheet is required")
    }


    const Aadhaar = await uploadOnCloudinary(AadhaarLocalPath)
    const Secondary = await uploadOnCloudinary(SecondaryLocalPath)
    const Higher = await uploadOnCloudinary(HigherLocalPath)
    const UG = await uploadOnCloudinary(UGLocalPath)
    const PG = await uploadOnCloudinary(PGLocalPath)

    const teacherdetails = await Teacherdocs.create({
        Phone,
        Address,
        Experience,
        SecondarySchool,
        HigherSchool,
        UGcollege,
        PGcollege,
        SecondaryMarks,
        HigherMarks,
        UGmarks,
        PGmarks,
        Aadhaar: Aadhaar.url,
        Secondary: Secondary.url,
        Higher: Higher.url,
        UG:UG.url,
        PG:PG.url,
    })

    const theTeacher = await Teacher.findOneAndUpdate({_id: id}, {$set: {Isapproved:"pending", Teacherdetails: teacherdetails._id}},  { new: true }).select("-Password -Refreshtoken")
    
    if(!theTeacher){
        throw new ApiError(400,"faild to approve or reject || student not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {teacher:theTeacher}, "documents uploaded successfully"))

})

const teacherdocuments = asyncHandler(async(req, res)=>{
    const teacherID = req.body.teacherID;

    const teacherDocs = await Teacherdocs.findById(teacherID);

    if(!teacherDocs){
        throw new ApiError(400, 'no teacher found');
    }

    return res 
    .status(200)
    .json(new ApiResponse(200, teacherDocs, "teacher documents fetched"))
})

const ForgetPassword=asyncHandler(async(req,res)=>{

    const { Email } =  req.body
 
    if(!Email){
     throw new ApiError(400, "Email is required")
     }
    
     const User=await Teacher.findOne({Email});
 
     if(!User){
        throw new ApiError(404,"email not found!!");
     }
 
    await User.generateResetToken();
 
    await User.save();
 
    const resetToken=`${process.env.FRONTEND_URL}/teacher/forgetpassword/${User.forgetPasswordToken}`
   
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
 
 
 
 const  ResetPassword= asyncHandler(async (req, res) => {
     const { token } = req.params;
     const { password,confirmPassword} = req.body;

     if(password != confirmPassword){
         throw new ApiError(400,"password does not match")
     }
         
     console.log("flag",token,password);
 
     try {
         const user = await Teacher.findOne({
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

export { signup, mailVerified, login, logout, addTeacherDetails, getTeacher, teacherdocuments,ForgetPassword,ResetPassword};
