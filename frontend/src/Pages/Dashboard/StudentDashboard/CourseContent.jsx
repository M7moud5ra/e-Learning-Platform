import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function CourseContent() {
  const { ID, courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const response = await fetch(`/api/course/${courseId}/content`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch course content');
        }

        const data = await response.json();
        setCourseData(data.data);
        
        // Set first video as selected by default
        if (data.data.sections && data.data.sections.length > 0 && data.data.sections[0].videos.length > 0) {
          setSelectedVideo(data.data.sections[0].videos[0]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading course content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">No course data found</div>
      </div>
    );
  }

  return (
    <div className="ml-52 p-6 bg-gray-50 min-h-screen">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-6">
          {courseData.thumbnail && (
            <img 
              src={courseData.thumbnail} 
              alt={courseData.coursename}
              className="w-32 h-24 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 capitalize mb-2">
              {courseData.coursename}
            </h1>
            <p className="text-gray-600 mb-4">{courseData.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-green-600">
                ${courseData.price}
              </span>
              <span className="text-sm text-gray-500">
                Instructor: {courseData.enrolledteacher?.Firstname} {courseData.enrolledteacher?.Lastname}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Course Sections Sidebar */}
        <div className="w-1/3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Course Content</h2>
          
          {courseData.sections && courseData.sections.length > 0 ? (
            <div className="space-y-4">
              {courseData.sections
                .sort((a, b) => a.order - b.order)
                .map((section, sectionIndex) => (
                <div key={section._id} className="border rounded-lg">
                  <div className="bg-gray-100 p-3 font-semibold">
                    Section {sectionIndex + 1}: {section.title}
                  </div>
                  {section.description && (
                    <div className="p-3 text-sm text-gray-600 border-b">
                      {section.description}
                    </div>
                  )}
                  
                  {section.videos && section.videos.length > 0 && (
                    <div className="p-2">
                      {section.videos
                        .sort((a, b) => a.order - b.order)
                        .map((video, videoIndex) => (
                        <div 
                          key={video._id}
                          onClick={() => setSelectedVideo(video)}
                          className={`p-3 cursor-pointer rounded mb-2 transition-colors ${
                            selectedVideo?._id === video._id 
                              ? 'bg-blue-100 border-blue-300' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {videoIndex + 1}. {video.title}
                          </div>
                          {video.duration > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Duration: {formatDuration(video.duration)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No course content available yet.
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          {selectedVideo ? (
            <div>
              <h3 className="text-2xl font-bold mb-4">{selectedVideo.title}</h3>
              
              {/* Video Player */}
              <div className="mb-4">
                {selectedVideo.videoUrl.includes('youtube.com') || selectedVideo.videoUrl.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="400"
                    src={selectedVideo.videoUrl.replace('watch?v=', 'embed/')}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                ) : (
                  <video
                    width="100%"
                    height="400"
                    controls
                    className="rounded-lg"
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              {/* Video Description */}
              {selectedVideo.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Description:</h4>
                  <p className="text-gray-700">{selectedVideo.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <div className="text-6xl text-gray-300 mb-4">📹</div>
                <div className="text-xl text-gray-500">Select a video to start learning</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseContent;