// import React, { useState } from 'react'
// import { useParams } from 'react-router-dom';

// function Popup({onClose, subject}) {
//   const [desc, setDesc] = useState('');
//   const { ID } = useParams();
//   const dateGap = 3;

//   const [day, setDay] = useState({
//       "sun": false,
//       "mon": false,
//       "tue": false,
//       "wed": false,
//       "thu": false,
//       "fri": false,
//       "sat": false,
//   });

//   const [dayValue, setDayValue] = useState({
//       "sun": "",
//       "mon": "",
//       "tue": "",
//       "wed": "",
//       "thu": "",
//       "fri": "",
//       "sat": "",
//   });

//   const dayIndex = {
//       "sun": 0,
//       "mon": 1,
//       "tue": 2,
//       "wed": 3,
//       "thu": 4,
//       "fri": 5,
//       "sat": 6,
//   };

//   const handleCheckboxChange = (dayName) => {
//     setDay(prevDay => ({ ...prevDay, [dayName]: !prevDay[dayName] }));
//   };

//   const addCourse = async()=>{
//     const selectedDays = Object.keys(day)
//         .filter(d => day[d])
//         .map(d => ({
//             "Day": dayIndex[d],
//             "Start Time": dayValue[d] ? dayValue[d] * 60 : null,
//             "End Time": dayValue[d] ? (parseInt(dayValue[d], 10) + dateGap) * 60 : null,
//           }));

//     const hasMissingTime = selectedDays.some(d => d["Start Time"] === null);

//     if (hasMissingTime) {
//       alert("Please fill in the time for all selected days.");
//       return;
//     }

//     ///////////////////////
//     if(desc == ''){
//       alert('Fill The Description');
//     }else{
//       onClose();

//       const data = {
//         coursename: subject.toLowerCase(),
//         description: desc,
//         time: selectedDays,
//       }

//       //call api 

//       const response = await fetch(`/api/course/${subject}/create/${ID}`, {
//         method: 'POST',
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       });

//       const responesData = await response.json();

//       console.log(responesData);
//       alert(responesData.message);

//     }
//   }

//   return (
//     <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center'>
//         <div className='bg-[#008280] w-[30rem] h-fit py-4 mt-1 rounded-md'>
//           <div className=' absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2' onClick={onClose}>✖️</div>
//           <div className=' text-center my-10 text-white text-3xl font-semibold'>
//             <p>{subject}</p>
//           </div>
//           <div className='m-5 flex flex-col gap-4 text-white text-xl'>
//             <div>
//               <label htmlFor="">Coursename : </label>
//               <input 
//                 type="text" 
//                 className="bg-[#32B0AE] p-2 rounded-md w-52 border-0 outline-0"
//                 value={subject}
//                 readOnly
//               />
//             </div>
            
//             <label>Timing : </label>
//             {Object.keys(day).map((d) => (
//                 <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"}}>
//                     <input type="checkbox" checked={day[d]} onChange={() => handleCheckboxChange(d)} />
//                     <label>{d.charAt(0).toUpperCase() + d.slice(1)}</label>
//                     <input className='w-[7rem] rounded-sm text-black placeholder:text-gray pl-2' type="time" rounded-sme="text" placeholder='Start Time' value={dayValue[d]} onChange={(e) => setDayValue({ ...dayValue, [d]: e.target.value })} />
//                     <input className='w-[7rem] rounded-sm text-black placeholder:text-gray pl-2' type="time"  placeholder="End Time" value={(parseInt(dayValue[d], 10) + dateGap)} />
//                 </div>
//             ))}

//             <div>
//               <label htmlFor="">Description : </label>
//               <input type="text"
//               value={desc}
//               onChange={(e) => setDesc(e.target.value)}
//               className="bg-[#32B0AE] p-2 rounded-md w-52 ml-3 border-0 outline-0" 
//               />
//             </div>
//           </div>

//           <div className='flex items-center justify-center mt-7'>
//             <span onClick={addCourse} className='bg-[#335699] text-white px-10 py-3 rounded-md text-xl cursor-pointer'>
//               Create Course
//             </span>
//           </div>
//         </div>
//     </div>
//   )
// }

// export default Popup
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function Popup({ onClose, subject }) {
  const [desc, setDesc] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [price, setPrice] = useState(0);
  const [sections, setSections] = useState([]);
  const { ID } = useParams();
  const dateGap = 3; // 3 hours

  const [day, setDay] = useState({
    sun: false,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
  });

  const [dayValue, setDayValue] = useState({
    sun: '',
    mon: '',
    tue: '',
    wed: '',
    thu: '',
    fri: '',
    sat: '',
  });

  const dayIndex = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const handleCheckboxChange = (dayName) => {
    setDay((prevDay) => ({ ...prevDay, [dayName]: !prevDay[dayName] }));
  };

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      description: '',
      videos: [],
      order: sections.length
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId, field, value) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const removeSection = (sectionId) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addVideoToSection = (sectionId) => {
    const newVideo = {
      id: Date.now(),
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: 0
    };
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, videos: [...section.videos, { ...newVideo, order: section.videos.length }] }
        : section
    ));
  };

  const updateVideo = (sectionId, videoId, field, value) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section, 
            videos: section.videos.map(video => 
              video.id === videoId ? { ...video, [field]: value } : video
            )
          }
        : section
    ));
  };

  const removeVideo = (sectionId, videoId) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, videos: section.videos.filter(video => video.id !== videoId) }
        : section
    ));
  };

  const addCourse = async () => {
    const selectedDays = Object.keys(day)
      .filter((d) => day[d])
      .map((d) => ({
        day: dayIndex[d],
        starttime: dayValue[d] ? convertTimeToMinutes(dayValue[d]) : null,
        endtime: dayValue[d] ? convertTimeToMinutes(dayValue[d]) + dateGap * 60 : null,
      }));

    const hasMissingTime = selectedDays.some((d) => d.starttime === null);

    if (hasMissingTime) {
      alert('Please fill in the time for all selected days.');
      return;
    }

    const invalidTimeRange = selectedDays.some((d) => {
      const startTime = d.starttime;
      const endTime = d.endtime;
      if (startTime >= endTime) {
        alert('Start time must be earlier than end time.');
        return true;
      }
      if ((endTime - startTime) > 3 * 60) {
        alert('End time should not be more than 3 hours after start time.');
        return true;
      }
      return false;
    });

    if (invalidTimeRange) {
      return;
    }

    if (desc === '') {
      alert('Fill the description.');
      return;
    }

    if(selectedDays.length === 0){
      alert('pls! select any day and time.');
      return;
    }

    onClose();

    // Prepare sections data (remove temporary IDs)
    const sectionsData = sections.map(section => ({
      title: section.title,
      description: section.description,
      videos: section.videos.map(video => ({
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        duration: parseInt(video.duration) || 0,
        order: video.order
      })),
      order: section.order
    }));

    const data = {
      coursename: subject.toLowerCase(),
      description: desc,
      schedule: selectedDays,
      thumbnail: thumbnail || null,
      price: parseFloat(price) || 0,
      sections: sectionsData,
    };

    console.log(data);

    // Call API
    const response = await fetch(`/api/course/${subject}/create/${ID}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log(responseData);
    alert(responseData.message);
  };

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const convertMinutesToTime = (minutes) => {
    const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mins = String(minutes % 60).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center overflow-y-auto'>
      <div className='bg-[#008280] w-[50rem] h-fit py-4 mt-1 mb-4 rounded-md max-h-[90vh] overflow-y-auto'>
        <div
          className='absolute w-9 h-9 bg-white rounded-xl cursor-pointer flex items-center justify-center m-2'
          onClick={onClose}
        >
          ✖️
        </div>
        <div className='text-center my-10 text-white text-3xl font-semibold'>
          <p>{subject}</p>
        </div>
        <div className='m-5 flex flex-col gap-4 text-white text-xl'>
          <div>
            <label htmlFor=''>Coursename: </label>
            <input
              type='text'
              className='bg-[#32B0AE] p-2 rounded-md w-52 border-0 outline-0'
              value={subject}
              readOnly
            />
          </div>

          <label>Timing: </label>
          {Object.keys(day).map((d) => (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              <input
                type='checkbox'
                checked={day[d]}
                onChange={() => handleCheckboxChange(d)}
              />
              <label>{d.charAt(0).toUpperCase() + d.slice(1)}</label>
              <input
                className='w-[7rem] rounded-sm text-black placeholder:text-gray pl-2'
                type='time'
                placeholder='Start Time'
                value={dayValue[d]}
                onChange={(e) =>
                  setDayValue({ ...dayValue, [d]: e.target.value })
                }
              />
              <input
                className='w-[7rem] rounded-sm text-black placeholder:text-gray pl-2'
                type='time'
                readOnly
                placeholder='End Time'
                value={dayValue[d] ? convertMinutesToTime(convertTimeToMinutes(dayValue[d]) + dateGap * 60) : ''}
              />
            </div>
          ))}

          <div>
            <label htmlFor=''>Description: </label>
            <input
              type='text'
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className='bg-[#32B0AE] p-2 rounded-md w-52 ml-3 border-0 outline-0'
            />
          </div>

          <div>
            <label htmlFor=''>Thumbnail URL: </label>
            <input
              type='text'
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder='Enter image URL'
              className='bg-[#32B0AE] p-2 rounded-md w-52 ml-3 border-0 outline-0'
            />
          </div>

          <div>
            <label htmlFor=''>Price ($): </label>
            <input
              type='number'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min='0'
              step='0.01'
              className='bg-[#32B0AE] p-2 rounded-md w-52 ml-3 border-0 outline-0'
            />
          </div>

          {/* Sections Management */}
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <label className='text-xl'>Course Sections:</label>
              <button
                type='button'
                onClick={addSection}
                className='bg-[#335699] text-white px-4 py-2 rounded-md text-sm'
              >
                Add Section
              </button>
            </div>

            {sections.map((section, sectionIndex) => (
              <div key={section.id} className='bg-[#32B0AE] p-4 rounded-md mb-4'>
                <div className='flex justify-between items-center mb-2'>
                  <h4 className='text-lg font-semibold'>Section {sectionIndex + 1}</h4>
                  <button
                    type='button'
                    onClick={() => removeSection(section.id)}
                    className='bg-red-500 text-white px-2 py-1 rounded text-xs'
                  >
                    Remove
                  </button>
                </div>
                
                <div className='mb-2'>
                  <input
                    type='text'
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder='Section Title'
                    className='bg-white p-2 rounded w-full text-black'
                  />
                </div>
                
                <div className='mb-4'>
                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                    placeholder='Section Description'
                    className='bg-white p-2 rounded w-full text-black h-20 resize-none'
                  />
                </div>

                {/* Videos in Section */}
                <div className='mb-2'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='font-medium'>Videos:</span>
                    <button
                      type='button'
                      onClick={() => addVideoToSection(section.id)}
                      className='bg-[#335699] text-white px-3 py-1 rounded text-xs'
                    >
                      Add Video
                    </button>
                  </div>
                  
                  {section.videos.map((video, videoIndex) => (
                    <div key={video.id} className='bg-white p-3 rounded mb-2 text-black'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-medium text-sm'>Video {videoIndex + 1}</span>
                        <button
                          type='button'
                          onClick={() => removeVideo(section.id, video.id)}
                          className='bg-red-500 text-white px-2 py-1 rounded text-xs'
                        >
                          Remove
                        </button>
                      </div>
                      
                      <input
                        type='text'
                        value={video.title}
                        onChange={(e) => updateVideo(section.id, video.id, 'title', e.target.value)}
                        placeholder='Video Title'
                        className='w-full p-1 border rounded mb-2 text-sm'
                      />
                      
                      <input
                        type='text'
                        value={video.videoUrl}
                        onChange={(e) => updateVideo(section.id, video.id, 'videoUrl', e.target.value)}
                        placeholder='Video URL'
                        className='w-full p-1 border rounded mb-2 text-sm'
                      />
                      
                      <div className='flex gap-2'>
                        <input
                          type='number'
                          value={video.duration}
                          onChange={(e) => updateVideo(section.id, video.id, 'duration', e.target.value)}
                          placeholder='Duration (seconds)'
                          className='flex-1 p-1 border rounded text-sm'
                        />
                        <textarea
                          value={video.description}
                          onChange={(e) => updateVideo(section.id, video.id, 'description', e.target.value)}
                          placeholder='Video Description'
                          className='flex-2 p-1 border rounded text-sm h-8 resize-none'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center justify-center mt-7'>
          <span
            onClick={addCourse}
            className='bg-[#335699] text-white px-10 py-3 rounded-md text-xl cursor-pointer'
          >
            Create Course
          </span>
        </div>
      </div>
    </div>
  );
}

export default Popup;

