import React,{ useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Popup from './Popup';
import axios from 'axios';

function StudentCourses() {
  const { ID } = useParams();
  const navigate = useNavigate();
  const [data, setdata] = useState([]);
  const [popup, setPopup] = useState(false);
  const [subDetails, setsubDetails] = useState({});
  const [subD, setsubD] = useState();

  useEffect(() => {
      const getData = async () => {
        try {
          const response = await fetch(`/api/course/student/${ID}/enrolled`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
  
          const user = await response.json();
          setdata(user.data);
          console.log(user.data);

        } catch (error) {
          setError(error.message)
        }
      };
      getData();
  },[]);

  const openpopup = async(sub)=>{ 
    setsubDetails(sub);
    await axios.get(`/api/course/${sub.coursename}`)
      .then(res => {setPopup(true);
      setsubD(res.data.data)})
  }

  const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const defaultImage = {
    "physics" : "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/8e9bf690d23d886f63466a814cfbec78187f91d2",
    "chemistry" : "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/3e546b344774eb0235acc6bf6dad7814a59d6e95",
    "biology" : "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/28ac70002ae0a676d9cfb0f298f3e453d12b5555",
    "math" : "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/61930117e428a1f0f7268f888a84145f93aa0664",
    "computer" : "https://www.figma.com/file/6b4R8evBkii6mI53IA4vSS/image/a64c93efe984ab29f1dfb9e8d8accd9ba449f272",
  }

  const viewCourseContent = (courseId) => {
    navigate(`/Student/Dashboard/${ID}/CourseContent/${courseId}`);
  };

  return (
    <>
    <div className='flex gap-10 pl-[12rem] mt-12 flex-wrap justify-center mb-2'>
        {data.map(sub => (
          <div key={sub._id} className="text-white rounded-md bg-[#042439] text-center p-4 w-[18rem] shadow-lg">
            {/* Course Thumbnail */}
            <div className='mb-4'>
              <img 
                src={sub.thumbnail || defaultImage[sub.coursename]} 
                alt={sub.coursename} 
                className="w-full h-32 object-cover rounded-md mb-3"
              />
              <h3 className="text-xl font-bold">{sub.coursename.toUpperCase()}</h3>
            </div>
            
            <p className='text-gray-300 text-sm text-center px-2 mb-3'>{sub.description}</p>

            {/* Price */}
            {sub.price && (
              <p className='text-green-400 font-bold text-lg mb-3'>₹{sub.price}</p>
            )}

            {/* Schedule */}
            {sub.schedule && (
              <div className='mb-4'>
                <p className='text-blue-400 font-bold mb-1'>Timing:</p>
                <div className='text-xs text-gray-300'>
                  {sub.schedule.map((daytime, index) => (
                    <div key={index}>
                      {daysName[daytime.day]} {Math.floor(daytime.starttime / 60)}:{daytime.starttime % 60 === 0 ? "00" : daytime.starttime % 60} - {Math.floor(daytime.endtime/60)}:{daytime.endtime % 60 === 0 ? "00" : daytime.endtime % 60}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-2 mt-4'>
              <button 
                onClick={() => viewCourseContent(sub._id)}
                className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors'
              >
                View Content
              </button>
              <button 
                onClick={() => openpopup(sub)}
                className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors'
              >
                Details
              </button>
            </div>
          </div>
        ))}
    </div>
    {popup && (
      <Popup onClose={()=> setPopup(false)} subject={subDetails} allSubject={subD}/>
    )}
    </>
  )
}

export default StudentCourses