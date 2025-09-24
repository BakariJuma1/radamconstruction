import React, { useState, useEffect } from "react";
import axios from "axios";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    service_id: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://radamconstruction.onrender.com/services")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.services || [];
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        setError("Failed to load services. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleBookClick = (service) => {
    setSelectedService(service);
    setBookingForm({
      ...bookingForm,
      service_id: service.id,
    });
    setShowBookingModal(true);
    setBookingSuccess(false);
    setBookingError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value,
    });
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();

    if (!bookingForm.name || !bookingForm.phone || !bookingForm.email) {
      setBookingError("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingForm.email)) {
      setBookingError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    axios
      .post("https://radamconstruction.onrender.com/bookings", bookingForm)
      .then((response) => {
        setBookingSuccess(true);
        setBookingError("");
        setLoading(false);

        setBookingForm({
          name: "",
          phone: "",
          email: "",
          message: "",
          service_id: selectedService.id,
        });

        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error submitting booking:", error);
        setBookingError("Failed to submit booking. Please try again.");
        setLoading(false);
      });
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    // Show the placeholder by removing the display: none style from parent
    const placeholder = e.target.parentElement.querySelector('.image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  // Function to handle image loading success
  const handleImageLoad = (e) => {
    e.target.style.display = 'block';
    const placeholder = e.target.parentElement.querySelector('.image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Our Services</h1>
          <p className="text-lg">
            Professional construction services with expertise in delivering
            quality projects
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No services available
              </h3>
              <p className="text-gray-500">Check back later for our service offerings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  {/* Image Container with Error Handling */}
                  <div className="relative h-48 bg-gray-100">
                    {service.image_url ? (
                      <>
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
                        />
                        <div 
                          className="image-placeholder absolute inset-0 flex items-center justify-center text-gray-400"
                          style={{ display: 'none' }}
                        >
                          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm">
                      {service.description}
                    </p>
                    {service.price && (
                      <div className="text-md font-semibold text-blue-600 mb-3">
                        Starting from KES {service.price.toLocaleString()}
                      </div>
                    )}
                    <button
                      onClick={() => handleBookClick(service)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Book Consultation</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Submitted!</h3>
                  <p className="text-gray-600">
                    We'll contact you shortly about {selectedService?.name}.
                  </p>
                </div>
              ) : (
                <>
                  {selectedService && (
                    <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-100">
                      <h3 className="font-semibold text-blue-800">Service: {selectedService.name}</h3>
                      {selectedService.price && (
                        <p className="text-blue-600">
                          KES {selectedService.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {bookingError && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 rounded border border-red-200 text-sm">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleSubmitBooking}>
                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1 text-sm" htmlFor="name">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1 text-sm" htmlFor="phone">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Your phone number"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700 mb-1 text-sm" htmlFor="email">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Your email address"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-1 text-sm" htmlFor="message">
                        Message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={bookingForm.message}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Tell us about your project"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Submit Booking Request"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;