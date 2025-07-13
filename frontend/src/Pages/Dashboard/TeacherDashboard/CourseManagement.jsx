import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function CourseManagement() {
  const { ID, courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [newVideo, setNewVideo] = useState({ title: '', description: '', videoUrl: '', duration: 0 });
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [courseDetails, setCourseDetails] = useState({ thumbnail: '', price: 0 });
  const [showUpdateDetails, setShowUpdateDetails] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/course/${courseId}/content/teacher`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }

      const data = await response.json();
      setCourseData(data.data);
      setCourseDetails({
        thumbnail: data.data.thumbnail || '',
        price: data.data.price || 0
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!newSection.title.trim()) {
      alert('Section title is required');
      return;
    }

    try {
      const response = await fetch(`/api/course/${courseId}/sections`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSection),
      });

      if (!response.ok) {
        throw new Error('Failed to add section');
      }

      setNewSection({ title: '', description: '' });
      setShowAddSection(false);
      fetchCourseData();
      alert('Section added successfully!');
    } catch (error) {
      alert('Error adding section: ' + error.message);
    }
  };

  const addVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.videoUrl.trim() || !selectedSectionId) {
      alert('Video title, URL, and section selection are required');
      return;
    }

    try {
      const response = await fetch(`/api/course/${courseId}/sections/${selectedSectionId}/videos`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVideo),
      });

      if (!response.ok) {
        throw new Error('Failed to add video');
      }

      setNewVideo({ title: '', description: '', videoUrl: '', duration: 0 });
      setSelectedSectionId('');
      setShowAddVideo(false);
      fetchCourseData();
      alert('Video added successfully!');
    } catch (error) {
      alert('Error adding video: ' + error.message);
    }
  };

  const updateCourseDetails = async () => {
    if (!courseDetails.thumbnail.trim() || courseDetails.price <= 0) {
      alert('Thumbnail URL and valid price are required');
      return;
    }

    try {
      const response = await fetch(`/api/course/${courseId}/details`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to update course details');
      }

      setShowUpdateDetails(false);
      fetchCourseData();
      alert('Course details updated successfully!');
    } catch (error) {
      alert('Error updating course details: ' + error.message);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading course data...</div>
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
        <div className="flex items-start justify-between">
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
                  Sections: {courseData.sections?.length || 0}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowUpdateDetails(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
          >
            Update Details
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowAddSection(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium"
        >
          Add Section
        </button>
        <button
          onClick={() => setShowAddVideo(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium"
        >
          Add Video
        </button>
      </div>

      {/* Course Sections */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
        
        {courseData.sections && courseData.sections.length > 0 ? (
          <div className="space-y-4">
            {courseData.sections
              .sort((a, b) => a.order - b.order)
              .map((section, sectionIndex) => (
              <div key={section._id} className="border rounded-lg p-4">
                <div className="bg-gray-100 p-3 rounded mb-3">
                  <h3 className="font-bold text-lg">
                    Section {sectionIndex + 1}: {section.title}
                  </h3>
                  {section.description && (
                    <p className="text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>
                
                {section.videos && section.videos.length > 0 ? (
                  <div className="ml-4">
                    <h4 className="font-semibold mb-2">Videos ({section.videos.length}):</h4>
                    {section.videos
                      .sort((a, b) => a.order - b.order)
                      .map((video, videoIndex) => (
                      <div key={video._id} className="bg-gray-50 p-3 rounded mb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium">
                              {videoIndex + 1}. {video.title}
                            </h5>
                            {video.description && (
                              <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>Duration: {formatDuration(video.duration)}</span>
                              <a 
                                href={video.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Video
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-4 text-gray-500 italic">No videos in this section yet.</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No sections created yet. Add your first section to get started!
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Section Title *</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter section title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newSection.description}
                  onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="Enter section description"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addSection}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium"
              >
                Add Section
              </button>
              <button
                onClick={() => setShowAddSection(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Video</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Section *</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Choose a section</option>
                  {courseData.sections?.map((section, index) => (
                    <option key={section._id} value={section._id}>
                      Section {index + 1}: {section.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video Title *</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video URL *</label>
                <input
                  type="url"
                  value={newVideo.videoUrl}
                  onChange={(e) => setNewVideo({...newVideo, videoUrl: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter video URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={newVideo.duration}
                  onChange={(e) => setNewVideo({...newVideo, duration: parseInt(e.target.value) || 0})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter duration in seconds"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 h-20"
                  placeholder="Enter video description"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addVideo}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium"
              >
                Add Video
              </button>
              <button
                onClick={() => setShowAddVideo(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Course Details Modal */}
      {showUpdateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Update Course Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail URL *</label>
                <input
                  type="url"
                  value={courseDetails.thumbnail}
                  onChange={(e) => setCourseDetails({...courseDetails, thumbnail: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter thumbnail URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  value={courseDetails.price}
                  onChange={(e) => setCourseDetails({...courseDetails, price: parseFloat(e.target.value) || 0})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter course price"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={updateCourseDetails}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium"
              >
                Update Details
              </button>
              <button
                onClick={() => setShowUpdateDetails(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseManagement;