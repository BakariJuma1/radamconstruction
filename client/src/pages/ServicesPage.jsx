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
    service_id: ""
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    // Fetch services data
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
        setLoading(false);
      });
  }, []);

  const handleBookClick = (service) => {
    setSelectedService(service);
    setBookingForm({
      ...bookingForm,
      service_id: service.id
    });
    setShowBookingModal(true);
    setBookingSuccess(false);
    setBookingError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value
    });
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.email) {
      setBookingError("Please fill in all required fields");
      return;
    }

    // Email validation
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
        
        // Reset form after successful booking
        setBookingForm({
          name: "",
          phone: "",
          email: "",
          message: "",
          service_id: selectedService.id
        });
        
        // Close modal after 3 seconds
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Professional construction services with expertise in delivering quality projects on time and within budget
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 group"
                >
                  <div className="relative overflow-hidden h-56 bg-gray-100">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => handleBookClick(service)}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0"
                      >
                        Book Consultation
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    {service.price && (
                      <div className="text-lg font-semibold text-blue-600 mb-4">
                        Starting from ${service.price}
                      </div>
                    )}
                    <button
                      onClick={() => handleBookClick(service)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      Book Now
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
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Book Consultation
                </h2>
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
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Booking Submitted Successfully!</h3>
                  <p className="text-gray-600">We'll contact you shortly to confirm your consultation for {selectedService?.title}.</p>
                </div>
              ) : (
                <>
                  {selectedService && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800">Service: {selectedService.title}</h3>
                      {selectedService.price && (
                        <p className="text-blue-600">Starting from ${selectedService.price}</p>
                      )}
                    </div>
                  )}
                  
                  {bookingError && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {bookingError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitBooking}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2" htmlFor="name">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2" htmlFor="phone">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2" htmlFor="email">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 mb-2" htmlFor="message">
                        Message (Optional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={bookingForm.message}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "Submit Booking Request"}
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