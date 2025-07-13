import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Popup from './Popup';

function TeacherCourses() {
  const { ID } = useParams();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [subject, setSubject] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
  }, [ID]);

  const fetchTeacherCourses = async () => {
    try {
      const response = await fetch(`/api/course/teacher/${ID}/enrolled`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = (sub) => {
    setShowPopup(true);
    setSubject(sub);
  };

  const manageCourse = (courseId) => {
    navigate(`/Teacher/Dashboard/${ID}/CourseManagement/${courseId}`);
  };

  const onCourseCreated = () => {
    setShowPopup(false);
    fetchTeacherCourses(); // Refresh the courses list
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 ml-52">
        <div className="text-xl">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="ml-52 p-6">
      {/* Existing Courses Section */}
      {courses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow-md p-4">
                {/* Course Thumbnail */}
                <div className="mb-4">
                  <img 
                    src={course.thumbnail || `https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/8e9bf690d23d886f63466a814cfbec78187f91d2`} 
                    alt={course.coursename}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
                
                {/* Course Info */}
                <h3 className="text-xl font-bold capitalize mb-2">{course.coursename}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                
                {/* Course Details */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-green-600 font-bold text-lg">₹{course.price || 0}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    course.isapproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.isapproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                
                {/* Enrolled Students */}
                <div className="text-sm text-gray-500 mb-4">
                  Students: {course.enrolledStudent?.length || 0}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => manageCourse(course._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                  >
                    Manage Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Create New Course Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
        <div className='flex gap-10 flex-wrap justify-center'>
            <div className="subject cursor-pointer" onClick={()=>createCourse("Physics")}>
              <img src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/8e9bf690d23d886f63466a814cfbec78187f91d2" alt="Physics" />
              <p>Physics</p>
            </div>
            <div className="subject cursor-pointer" onClick={()=>createCourse("Chemistry")}>
              <img src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/3e546b344774eb0235acc6bf6dad7814a59d6e95" alt="Chemistry" />
              <p>Chemistry</p>
            </div>
            <div className="subject cursor-pointer" onClick={()=>createCourse("Biology")}>
              <img src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/28ac70002ae0a676d9cfb0f298f3e453d12b5555" alt="Zoology" />
              <p>Biology</p>
            </div>
            <div className="subject cursor-pointer" onClick={()=>createCourse("Math")}>
              <img src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/61930117e428a1f0f7268f888a84145f93aa0664" alt="Math" />
              <p>Math</p>
            </div>
            <div className="subject cursor-pointer" onClick={()=>createCourse("Computer")}>
              <img src="https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/a64c93efe984ab29f1dfb9e8d8accd9ba449f272" alt="Computer" />
              <p>Computer</p>
            </div>
        </div>
      </div>
      
      {showPopup && (
        <Popup onClose={onCourseCreated} subject={subject}/>
      )}
    </div>

)}

export default TeacherCourses