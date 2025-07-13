import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function PaymentStatus() {
  const { ID } = useParams();
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-request/my-requests', {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="text-lg text-white">Loading payment requests...</div>
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
      <h2 className="text-2xl font-bold mb-6 text-white">My Payment Requests</h2>
      
      {paymentRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-300 text-lg">No payment requests found</p>
          <p className="text-gray-400 text-sm mt-2">Enroll in a course to create a payment request</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paymentRequests.map((request) => (
            <div key={request._id} className="bg-gray-800 border border-gray-600 rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg text-blue-400 mb-2">{request.courseName}</h3>
                  <p className="text-gray-300"><strong>Amount:</strong> Rs. {request.amount}</p>
                  <p className="text-gray-300"><strong>Requested:</strong> {formatDate(request.createdAt)}</p>
                  <p className="text-gray-300"><strong>Request ID:</strong> 
                    <span className="font-mono text-sm ml-1">{request._id}</span>
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-300 mb-2"><strong>Status:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </p>
                  
                  {request.status === 'pending' && (
                    <div className="bg-blue-900 p-3 rounded-md mt-3">
                      <p className="text-blue-200 text-sm font-medium mb-1">Next Steps:</p>
                      <p className="text-blue-100 text-sm">
                        Contact admin via WhatsApp: <strong>+252 61 9122271</strong>
                      </p>
                      <p className="text-blue-100 text-sm">
                        Provide your Request ID: <span className="font-mono">{request._id}</span>
                      </p>
                    </div>
                  )}
                  
                  {request.status === 'approved' && (
                    <div className="bg-green-900 p-3 rounded-md mt-3">
                      <p className="text-green-100 text-sm">
                        ✅ Payment approved! You can now access the course content.
                      </p>
                    </div>
                  )}
                  
                  {request.status === 'rejected' && request.adminNotes && (
                    <div className="bg-red-900 p-3 rounded-md mt-3">
                      <p className="text-red-200 text-sm font-medium mb-1">Admin Notes:</p>
                      <p className="text-red-100 text-sm">{request.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentStatus;