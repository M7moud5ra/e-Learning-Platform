import {course} from "../models/course.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"; 
import {ApiResponse} from "../utils/ApiResponse.js";
import { Teacher } from "../models/teacher.model.js";
import { student } from "../models/student.model.js";
// Sendmail import removed - email verification disabled


const getCourse = asyncHandler(async(req,res)=>{

    const courses = await course.find(
      {isapproved:true}
    );

    return res
    .status(200)
    .json(new ApiResponse(200, courses, "All courses"))

})

const getcourseTeacher = asyncHandler(async(req,res)=>{

    const coursename = req.params.coursename;

    if(!coursename){
        throw new ApiError(400, "Choose a course")
    }

    const courseTeachers = await course.find({ coursename, isapproved:true }).populate('enrolledteacher');



    if (!courseTeachers || courseTeachers.length === 0) {
        throw new ApiError(400, "No teachers found for the specified course");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, courseTeachers, "details fetched"))
    
})


const addCourseTeacher = asyncHandler(async(req,res)=>{
    const loggedTeacher = req.teacher

    const teacherParams = req.params.id

    if(!teacherParams){
      throw new ApiError(400,"Invalid user")
    }
 
    if(loggedTeacher._id != teacherParams){
      throw new ApiError(400,"not authorized")
    }

    

    const{coursename, description, schedule, thumbnail, price, sections} = req.body

    console.log(schedule)


    if(!schedule){
      throw new ApiError(400, "Schedule of the course is required.")
    }

    if ([coursename,description].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    // Validate price
    if(price !== undefined && (isNaN(price) || price < 0)){
      throw new ApiError(400, "Price must be a valid positive number");
    }

    // Validate sections if provided
    if(sections && sections.length > 0){
      for(let section of sections){
        if(!section.title || section.title.trim() === ""){
          throw new ApiError(400, "Section title is required");
        }
        if(section.videos && section.videos.length > 0){
          for(let video of section.videos){
            if(!video.title || video.title.trim() === "" || !video.videoUrl || video.videoUrl.trim() === ""){
              throw new ApiError(400, "Video title and URL are required");
            }
          }
        }
      }
    }

    const schedules = await course.aggregate([
      {
        $match:{
          enrolledteacher:loggedTeacher._id
        }
      },
      {
        '$unwind': '$schedule'
      }, {
        '$project': {
          'schedule': 1, 
          '_id': 0
        }
      }
    ])

    let isconflict = false;
    for (let i = 0; i < schedule.length; i++) {
      for (const sch of schedules) {
        if (sch.schedule.day === schedule[i].day) {
          if (
            (schedule[i].starttime >= sch.schedule.starttime && schedule[i].starttime < sch.schedule.endtime) ||
            (schedule[i].endtime > sch.schedule.starttime && schedule[i].endtime <= sch.schedule.endtime) ||
            (schedule[i].starttime <= sch.schedule.starttime && schedule[i].endtime >= sch.schedule.endtime)
          ) {
            isconflict = true;
          }
        }
      }
    }
    
    if(isconflict){
      throw new ApiError(400, "Already enrolled in a course with the same timing.")
    }


    const newCourse = await course.create({
      coursename,
      description,
      schedule,
      thumbnail: thumbnail || null,
      price: price || 0,
      sections: sections || [],
      enrolledteacher: loggedTeacher._id,
    })

    console.log(newCourse)

    if(!newCourse){
      throw new ApiError(400, "couldnt create course")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {newCourse, loggedTeacher}, "new course created"))
    
})


const addCourseStudent = asyncHandler(async(req,res)=>{
 
  const loggedStudent = req.Student

  const studentParams = req.params.id

  if(!studentParams){
    throw new ApiError(400, "no params found")
  }

  if(loggedStudent._id != studentParams){
    throw new ApiError(400, "not authorized")
  }

  const courseID = req.params.courseID
  
  if(!courseID){
    throw new ApiError(400, "select a course")
  }

  const thecourse = await course.findById(courseID) //

  const EC = thecourse.schedule

  const schedules = await course.aggregate([
    {
      $match:{
        enrolledStudent:loggedStudent._id
      }
    },
    {
      '$unwind': '$schedule'
    }, {
      '$project': {
        'schedule': 1, 
        '_id': 0
      }
    }
  ])

  let isconflict = false;
  for (let i = 0; i < EC.length; i++) {
    for (const schedule of schedules) {
      if (schedule.schedule.day === EC[i].day) {
        if (
          (EC[i].starttime >= schedule.schedule.starttime && EC[i].starttime < schedule.schedule.endtime) ||
          (EC[i].endtime > schedule.schedule.starttime && EC[i].endtime <= schedule.schedule.endtime) ||
          (EC[i].starttime <= schedule.schedule.starttime && EC[i].endtime >= schedule.schedule.endtime)
        ) {
          isconflict = true;
        }
      }
    }
  }

  
  if(isconflict){
    throw new ApiError(400, "Already enrolled in a course with the same timing.")
  }

  const alreadyEnrolled = await course.findOne({
    _id: courseID,
    enrolledStudent: loggedStudent._id
  });
  if(alreadyEnrolled){
    throw new ApiError(400,"already enrolled in this course")
  }

  const selectedCourse = await course.findByIdAndUpdate(courseID, 
    {
      $push: {
        enrolledStudent:loggedStudent._id
      }
    }, {
      new: true
    })

  if(!selectedCourse){
    throw new ApiError(400, "failed to add student in course schema")
  }

  const teacherID = selectedCourse.enrolledteacher

  const teacher = await Teacher.findByIdAndUpdate(teacherID,
    {
      $push: {
        enrolledStudent:loggedStudent._id
      }
    }, {
      new: true
  })

  // Payment confirmation email removed - email verification disabled
  // await Sendmail(loggedStudent.Email, `Payment Confirmation for Course Purchase`, ...)

  return res
  .status(200)
  .json( new ApiResponse(200, {teacher, selectedCourse, loggedStudent}, "successfully opted in course"))
})

const enrolledcourseSTD = asyncHandler(async(req,res)=>{
  const stdID = req.params.id

  if(!stdID){
    throw new ApiError(400, "authorization failed")
  }

  if(stdID != req.Student._id){
    throw new ApiError(400, "params and logged student id doesnt match")
  }

  const Student = await course.find({ enrolledStudent: stdID }).select( "-enrolledStudent -liveClasses -enrolledteacher")

  if (!Student) {
      throw new ApiError(404, "Student not found");
  }

  return res
  .status(200)
  .json( new ApiResponse(200,Student, "student and enrolled course"))

})


const enrolledcourseTeacher = asyncHandler(async(req,res)=>{
  const teacherID = req.params.id

  if(!teacherID){
    throw new ApiError(400, "authorization failed")
  }

  if(teacherID != req.teacher._id){
    throw new ApiError(400, "params and logged teacher id doesnt match")
  }

  const teacher = await course.find({ enrolledteacher: teacherID }).select( "-enrolledStudent -liveClasses -enrolledteacher")

  if (!teacher) {
      throw new ApiError(404, "teacher not found");
  }

  return res
  .status(200)
  .json( new ApiResponse(200,teacher, "teacher and enrolled course"))
})

const addClass = asyncHandler(async(req,res) => {
  const {title, date, timing, link, status } = req.body

  const loggedTeacher = req.teacher

  if(!timing || !date){
    throw new ApiError(400, "All fields are required");
  }

  if ([title, link, status].some((field) => field?.trim() === "")) {
  throw new ApiError(400, "All fields are required");
  }

  const {courseId, teacherId } = req.params
  const dateObject = new Date(date);

  const enrolledTeacher = await course.findOne({
  _id: courseId,
  enrolledteacher: teacherId,
  isapproved:true,
  })
  

  if(!enrolledTeacher){
  throw new ApiError(400, "not authorized")
  }

  const cst = timing - 60;
  const cet = timing + 60;

  const conflictClass = await course.aggregate([
    {
      '$match': {
        'enrolledteacher': loggedTeacher._id,
      },
    },
    {
      '$unwind': '$liveClasses',
    },
    {
      '$match': {
        'liveClasses.date': dateObject,
        'liveClasses.timing': {
          '$gte': cst,
          '$lte': cet,
        },
      },
    },
    {
      '$project': {
        '_id': 0,
        'courseName': '$courseName',
        'liveClasses': 1,
      },
    },
  ]);


  if(conflictClass.length>0){
    throw new ApiError(400, "You already have another class for similar timing.")
  }

  const enrolledCourse = await course.findOneAndUpdate(
  { _id: courseId }, 
  { $push: { liveClasses: {title, date, timing, link, status } } },
  { new: true }  
  );
  
  if(!enrolledCourse){
  throw new ApiError(400, "error occured while adding the class")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, {enrolledCourse, loggedTeacher}, "class added successfully"))
})



const stdEnrolledCoursesClasses = asyncHandler(async(req,res)=>{
  const Student = req.Student

  

  const classes = await course.aggregate([
    {
      $match: {
        enrolledStudent: Student._id
      }
    },
    {
      $unwind: "$liveClasses"
    },
    {
      $sort: {
        "liveClasses.date": 1,
        "liveClasses.timing": 1
      }
    },
    {
      $group: {
        _id: "classes",
        liveClasses: { 
          $push: {
            coursename: "$coursename",
            title: "$liveClasses.title",
            timing: "$liveClasses.timing",
            link: "$liveClasses.link",
            status: "$liveClasses.status",
            date: "$liveClasses.date"
          }
        }
      }
    }
  ]);


  if(!classes){
    throw new ApiError(400, "couldn't fetch the classes")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, {Student, classes}, "fetched classes successfully"))
})

const teacherEnrolledCoursesClasses = asyncHandler(async(req,res)=>{
  const teacher = req.teacher

  const classes = await course.aggregate([
    {
      $match: {
        enrolledteacher: teacher._id
      }
    },
    {
      $unwind: "$liveClasses"
    },
    {
      $sort: {
        "liveClasses.date": 1,
        "liveClasses.timing": 1
      }
    },
    {
      $group: {
        _id: "classes",
        liveClasses: { 
          $push: {
            coursename: "$coursename",
            title: "$liveClasses.title",
            timing: "$liveClasses.timing",
            link: "$liveClasses.link",
            status: "$liveClasses.status",
            date: "$liveClasses.date"
          }
        }
      }
    }
  ]);

  if(!classes){
   throw new ApiError(400, "couldn't fetch the classes")
  }

  return res
  .status(200)
  .json(new ApiResponse(200, {teacher, classes}, "fetched classes successfully"))
})


const canStudentEnroll = asyncHandler(async(req,res)=>{
  const loggedStudent = req.Student

  const studentParams = req.params.id

  if(!studentParams){
    throw new ApiError(400, "no params found")
  }

  if(loggedStudent._id != studentParams){
    throw new ApiError(400, "not authorized")
  }

  const courseID = req.params.courseID
  
  if(!courseID){
    throw new ApiError(400, "select a course")
  }

  const thecourse = await course.findById(courseID) //

  const EC = thecourse.schedule

  const schedules = await course.aggregate([
    {
      $match:{
        enrolledStudent:loggedStudent._id
      }
    },
    {
      '$unwind': '$schedule'
    }, {
      '$project': {
        'schedule': 1, 
        '_id': 0
      }
    }
  ])

  let isconflict = false;
  for (let i = 0; i < EC.length; i++) {
    for (const schedule of schedules) {
      if (schedule.schedule.day === EC[i].day) {
        if (
          (EC[i].starttime >= schedule.schedule.starttime && EC[i].starttime < schedule.schedule.endtime) ||
          (EC[i].endtime > schedule.schedule.starttime && EC[i].endtime <= schedule.schedule.endtime) ||
          (EC[i].starttime <= schedule.schedule.starttime && EC[i].endtime >= schedule.schedule.endtime)
        ) {
          isconflict = true;
        }
      }
    }
  }

  
  if(isconflict){
    throw new ApiError(400, "Already enrolled in a course with the same timing.")
  }

  const alreadyEnrolled = await course.findOne({
    _id: courseID,
    enrolledStudent: loggedStudent._id
  });
  if(alreadyEnrolled){
    throw new ApiError(400,"already enrolled in this course")
  }
  return res.status(200).json(new ApiResponse(200, {}, "student can enroll"))
})

// Add section to course
const addSection = asyncHandler(async(req, res) => {
  const { courseId } = req.params;
  const { title, description, order } = req.body;
  const loggedTeacher = req.teacher;

  if(!title || title.trim() === ""){
    throw new ApiError(400, "Section title is required");
  }

  const courseData = await course.findById(courseId);
  if(!courseData){
    throw new ApiError(404, "Course not found");
  }

  if(courseData.enrolledteacher.toString() !== loggedTeacher._id.toString()){
    throw new ApiError(403, "Not authorized to modify this course");
  }

  const newSection = {
    title,
    description: description || '',
    videos: [],
    order: order || courseData.sections.length
  };

  const updatedCourse = await course.findByIdAndUpdate(
    courseId,
    { $push: { sections: newSection } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedCourse, "Section added successfully"));
});

// Add video to section
const addVideoToSection = asyncHandler(async(req, res) => {
  const { courseId, sectionId } = req.params;
  const { title, description, videoUrl, duration, order } = req.body;
  const loggedTeacher = req.teacher;

  if(!title || title.trim() === "" || !videoUrl || videoUrl.trim() === ""){
    throw new ApiError(400, "Video title and URL are required");
  }

  const courseData = await course.findById(courseId);
  if(!courseData){
    throw new ApiError(404, "Course not found");
  }

  if(courseData.enrolledteacher.toString() !== loggedTeacher._id.toString()){
    throw new ApiError(403, "Not authorized to modify this course");
  }

  const sectionIndex = courseData.sections.findIndex(section => section._id.toString() === sectionId);
  if(sectionIndex === -1){
    throw new ApiError(404, "Section not found");
  }

  const newVideo = {
    title,
    description: description || '',
    videoUrl,
    duration: duration || 0,
    order: order || courseData.sections[sectionIndex].videos.length
  };

  const updatedCourse = await course.findOneAndUpdate(
    { _id: courseId, "sections._id": sectionId },
    { $push: { "sections.$.videos": newVideo } },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedCourse, "Video added successfully"));
});

// Get course with sections and videos (for enrolled students)
const getCourseContent = asyncHandler(async(req, res) => {
  const { courseId } = req.params;
  const loggedStudent = req.Student;

  const courseData = await course.findById(courseId).populate('enrolledteacher', 'Firstname Lastname');
  if(!courseData){
    throw new ApiError(404, "Course not found");
  }

  if(!courseData.isapproved){
    throw new ApiError(403, "Course is not approved yet");
  }

  // Check if student is enrolled
  const isEnrolled = courseData.enrolledStudent.includes(loggedStudent._id);
  if(!isEnrolled){
    throw new ApiError(403, "You are not enrolled in this course");
  }

  return res.status(200).json(new ApiResponse(200, courseData, "Course content retrieved successfully"));
});

// Get course with sections and videos (for course owner teacher)
const getCourseContentTeacher = asyncHandler(async(req, res) => {
  const { courseId } = req.params;
  const loggedTeacher = req.teacher;

  const courseData = await course.findById(courseId).populate('enrolledteacher', 'Firstname Lastname');
  if(!courseData){
    throw new ApiError(404, "Course not found");
  }

  // Check if teacher owns this course
  if(courseData.enrolledteacher._id.toString() !== loggedTeacher._id.toString()){
    throw new ApiError(403, "You are not authorized to access this course");
  }

  return res.status(200).json(new ApiResponse(200, courseData, "Course content retrieved successfully"));
});

// Update course thumbnail and price
const updateCourseDetails = asyncHandler(async(req, res) => {
  const { courseId } = req.params;
  const { thumbnail, price } = req.body;
  const loggedTeacher = req.teacher;

  const courseData = await course.findById(courseId);
  if(!courseData){
    throw new ApiError(404, "Course not found");
  }

  if(courseData.enrolledteacher.toString() !== loggedTeacher._id.toString()){
    throw new ApiError(403, "Not authorized to modify this course");
  }

  const updateData = {};
  if(thumbnail !== undefined) updateData.thumbnail = thumbnail;
  if(price !== undefined) {
    if(isNaN(price) || price < 0){
      throw new ApiError(400, "Price must be a valid positive number");
    }
    updateData.price = price;
  }

  const updatedCourse = await course.findByIdAndUpdate(
    courseId,
    updateData,
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

export {getCourse, getcourseTeacher, addCourseTeacher, addCourseStudent, enrolledcourseSTD, enrolledcourseTeacher, addClass, stdEnrolledCoursesClasses, teacherEnrolledCoursesClasses, canStudentEnroll, addSection, addVideoToSection, getCourseContent, getCourseContentTeacher, updateCourseDetails}






