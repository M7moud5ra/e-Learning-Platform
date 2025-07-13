import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PaymentRequest } from "../models/paymentRequest.model.js";
import { Student } from "../models/student.model.js";
import { Course } from "../models/course.model.js";

// Create a payment request when student wants to enroll
const createPaymentRequest = asyncHandler(async (req, res) => {
  const { courseID, courseName, amount } = req.body;
  const studentID = req.Student._id;

  if (!courseID || !courseName || !amount) {
    throw new ApiError(400, "Course ID, course name, and amount are required");
  }

  // Get student details
  const student = await Student.findById(studentID);
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Check if course exists
  const course = await Course.findById(courseID);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check if student already has a pending request for this course
  const existingRequest = await PaymentRequest.findOne({
    studentID,
    courseID,
    status: "pending"
  });

  if (existingRequest) {
    throw new ApiError(400, "You already have a pending payment request for this course");
  }

  // Create payment request
  const paymentRequest = await PaymentRequest.create({
    studentID,
    courseID,
    courseName,
    studentName: `${student.Firstname} ${student.Lastname}`,
    studentEmail: student.Email,
    studentPhone: student.Phone || "Not provided",
    amount,
    whatsappContactSent: true
  });

  return res
    .status(201)
    .json(new ApiResponse(201, paymentRequest, "Payment request created successfully. Please contact admin via WhatsApp for payment."));
});

// Get all pending payment requests (for admin)
const getPendingPaymentRequests = asyncHandler(async (req, res) => {
  const pendingRequests = await PaymentRequest.find({ status: "pending" })
    .populate("studentID", "Firstname Lastname Email Phone")
    .populate("courseID", "coursename description")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, pendingRequests, "Pending payment requests fetched successfully"));
});

// Approve payment request and enroll student (for admin)
const approvePaymentRequest = asyncHandler(async (req, res) => {
  const { requestID } = req.params;
  const { adminNotes } = req.body;

  const paymentRequest = await PaymentRequest.findById(requestID);
  if (!paymentRequest) {
    throw new ApiError(404, "Payment request not found");
  }

  if (paymentRequest.status !== "pending") {
    throw new ApiError(400, "Payment request is not pending");
  }

  // Update payment request status
  paymentRequest.status = "approved";
  paymentRequest.adminNotes = adminNotes || "";
  await paymentRequest.save();

  // Enroll student in course
  const course = await Course.findById(paymentRequest.courseID);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Check if student is already enrolled
  const isAlreadyEnrolled = course.enrolledStudent.some(
    student => student.toString() === paymentRequest.studentID.toString()
  );

  if (!isAlreadyEnrolled) {
    course.enrolledStudent.push(paymentRequest.studentID);
    await course.save();

    // Update student's enrolled courses
    const student = await Student.findById(paymentRequest.studentID);
    if (student) {
      student.enrolledCourse.push(paymentRequest.courseID);
      await student.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, paymentRequest, "Payment request approved and student enrolled successfully"));
});

// Reject payment request (for admin)
const rejectPaymentRequest = asyncHandler(async (req, res) => {
  const { requestID } = req.params;
  const { adminNotes } = req.body;

  const paymentRequest = await PaymentRequest.findById(requestID);
  if (!paymentRequest) {
    throw new ApiError(404, "Payment request not found");
  }

  if (paymentRequest.status !== "pending") {
    throw new ApiError(400, "Payment request is not pending");
  }

  // Update payment request status
  paymentRequest.status = "rejected";
  paymentRequest.adminNotes = adminNotes || "";
  await paymentRequest.save();

  return res
    .status(200)
    .json(new ApiResponse(200, paymentRequest, "Payment request rejected"));
});

// Get student's payment requests
const getStudentPaymentRequests = asyncHandler(async (req, res) => {
  const studentID = req.Student._id;

  const paymentRequests = await PaymentRequest.find({ studentID })
    .populate("courseID", "coursename description")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, paymentRequests, "Student payment requests fetched successfully"));
});

export {
  createPaymentRequest,
  getPendingPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  getStudentPaymentRequests
};