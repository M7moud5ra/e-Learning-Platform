import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PaymentRequests() {
  const { data } = useParams();
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-request/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.statusCode === 200) {
        setPaymentRequests(result.data);
      } else {
        setError(result.message || 'Failed to fetch payment requests');
      }
    } catch (err) {
      setError('Error fetching payment requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes('');
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      const endpoint = actionType === 'approve' 
        ? `/api/payment-request/approve/${selectedRequest._id}`
        : `/api/payment-request/reject/${selectedRequest._id}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes }),
      });

      const result = await response.json();
      if (result.statusCode === 200) {
        // Remove the processed request from the list
        setPaymentRequests(prev => 
          prev.filter(req => req._id !== selectedRequest._id)
        );
        setShowModal(false);
        setSelectedRequest(null);
        alert(`Payment request ${actionType}d successfully!`);
      } else {
        alert(result.message || `Failed to ${actionType} payment request`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error ${actionType}ing payment request`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading payment requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment Requests Management</h2>
      
      {paymentRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No pending payment requests</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paymentRequests.map((request) => (
            <div key={request._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-blue-600 mb-2">{request.courseName}</h3>
                  <p className="text-gray-600"><strong>Student:</strong> {request.studentName}</p>
                  <p className="text-gray-600"><strong>Email:</strong> {request.studentEmail}</p>
                  <p className="text-gray-600"><strong>Phone:</strong> {request.studentPhone}</p>
                </div>
                
                <div>
                  <p className="text-gray-600"><strong>Amount:</strong> Rs. {request.amount}</p>
                  <p className="text-gray-600"><strong>Status:</strong> 
                    <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {request.status}
                    </span>
                  </p>
                  <p className="text-gray-600"><strong>Requested:</strong> {formatDate(request.createdAt)}</p>
                  <p className="text-gray-600"><strong>Request ID:</strong> 
                    <span className="font-mono text-sm">{request._id}</span>
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAction(request, 'approve')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Approve & Enroll
                  </button>
                  <button
                    onClick={() => handleAction(request, 'reject')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Payment Request
            </h3>
            
            <div className="mb-4">
              <p><strong>Student:</strong> {selectedRequest?.studentName}</p>
              <p><strong>Course:</strong> {selectedRequest?.courseName}</p>
              <p><strong>Amount:</strong> Rs. {selectedRequest?.amount}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Add any notes about this decision..."
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-md ${
                  actionType === 'approve' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionType === 'approve' ? 'Approve & Enroll' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentRequests;