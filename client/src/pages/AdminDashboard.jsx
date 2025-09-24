import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

const AdminDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());

  // New service form state
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    price: "",
    images: [],
  });

  // New portfolio item form state
  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    images: [],
  });

  // Toggle item expansion for mobile
  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const useAuthValidation = () => {
    const validateAuth = () => {
      if (!token) {
        showMessage("Authentication required. Please log in.", "error");
        return false;
      }

      try {
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
          showMessage("Invalid authentication token", "error");
          logout();
          return false;
        }

        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          showMessage("Session expired. Please log in again.", "error");
          logout();
          return false;
        }

        return true;
      } catch (error) {
        console.error("Token validation error:", error);
        showMessage("Authentication error. Please log in again.", "error");
        logout();
        return false;
      }
    };

    return { validateAuth };
  };

  const { validateAuth } = useAuthValidation();

  // API call with retry logic
  const apiCallWithRetry = async (apiCall, maxRetries = 2) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (error.response?.status === 401) {
          throw error;
        }

        if (i === maxRetries - 1) throw error;

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log("No token available");
        return;
      }

      if (!validateAuth()) {
        return;
      }

      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        await apiCallWithRetry(async () => {
          switch (activeTab) {
            case "bookings":
              const bookingsRes = await axios.get(
                "https://radamconstruction.onrender.com/bookings",
                config
              );
              setBookings(bookingsRes.data);
              break;
            case "contacts":
              const contactsRes = await axios.get(
                "https://radamconstruction.onrender.com/contacts",
                config
              );
              setContacts(contactsRes.data);
              break;
            case "services":
              const servicesRes = await axios.get(
                "https://radamconstruction.onrender.com/services"
              );
              setServices(servicesRes.data);
              break;
            case "portfolio":
              const portfolioRes = await axios.get(
                "https://radamconstruction.onrender.com/portfolio"
              );
              setPortfolio(portfolioRes.data);
              break;
            default:
              break;
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          showMessage("Session expired. Please log in again.", "error");
          logout();
        } else {
          showMessage("Error fetching data", "error");
        }
      } finally {
        setLoading(false);
        setExpandedItems(new Set()); // Reset expanded items on tab change
      }
    };

    fetchData();
  }, [activeTab, token, logout]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", newService.title);
      formData.append("description", newService.description);
      formData.append("price", newService.price);

      newService.images.forEach((image) => {
        formData.append("images", image);
      });

      await apiCallWithRetry(async () => {
        await axios.post(
          "https://radamconstruction.onrender.com/services",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      });

      showMessage("Service created successfully", "success");
      setNewService({ title: "", description: "", price: "", images: [] });

      const servicesRes = await axios.get(
        "https://radamconstruction.onrender.com/services"
      );
      setServices(servicesRes.data);
    } catch (error) {
      console.error("Error creating service:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage("Error creating service", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();

    if (!validateAuth()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", newPortfolio.title);
      formData.append("description", newPortfolio.description);

      newPortfolio.images.forEach((image) => {
        formData.append("images", image);
      });

      await apiCallWithRetry(async () => {
        await axios.post(
          "https://radamconstruction.onrender.com/portfolio",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      });

      showMessage("Portfolio item created successfully", "success");
      setNewPortfolio({ title: "", description: "", images: [] });

      const portfolioRes = await axios.get(
        "https://radamconstruction.onrender.com/portfolio"
      );
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage("Error creating portfolio item", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    if (!validateAuth()) return;

    try {
      await apiCallWithRetry(async () => {
        await axios.put(
          `https://radamconstruction.onrender.com/bookings/${bookingId}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      );

      showMessage("Booking status updated", "success");
    } catch (error) {
      console.error("Error updating booking:", error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage("Error updating booking", "error");
      }
    }
  };

  const deleteItem = async (type, id) => {
    if (!validateAuth()) return;

    if (!window.confirm(`Are you sure you want to delete this ${type}?`))
      return;

    try {
      let endpoint = "";

      switch (type) {
        case "service":
          endpoint = `https://radamconstruction.onrender.com/services/${id}`;
          break;
        case "portfolio":
          endpoint = `https://radamconstruction.onrender.com/portfolio/${id}`;
          break;
        case "contact":
          endpoint = `https://radamconstruction.onrender.com/contacts/${id}`;
          break;
        default:
          return;
      }

      await apiCallWithRetry(async () => {
        await axios.delete(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
      });

      switch (type) {
        case "service":
          setServices(services.filter((item) => item.id !== id));
          break;
        case "portfolio":
          setPortfolio(portfolio.filter((item) => item.id !== id));
          break;
        case "contact":
          setContacts(contacts.filter((item) => item.id !== id));
          break;
        default:
          break;
      }

      showMessage(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
        "success"
      );
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      if (error.response?.status === 401) {
        showMessage("Session expired. Please log in again.", "error");
        logout();
      } else {
        showMessage(`Error deleting ${type}`, "error");
      }
    }
  };

  const handleImageUpload = (e, setter, field) => {
    const files = Array.from(e.target.files);
    setter((prev) => ({ ...prev, [field]: files }));
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      confirmed: { color: "bg-green-100 text-green-800", text: "Confirmed" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // Mobile-friendly table row component
  const MobileTableRow = ({ item, type, children }) => (
    <div
      className={`bg-white border-b border-gray-200 ${
        expandedItems.has(item.id) ? "expanded" : ""
      }`}
      onClick={() => window.innerWidth < 768 && toggleItemExpansion(item.id)}
    >
      {children}
    </div>
  );

  // Improved loading spinner
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-gray-500">
          Loading...
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = ({ message, icon }) => (
    <div className="text-center py-12 px-4">
      <div className="text-gray-400 text-4xl mb-4">{icon}</div>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Main Content */}
      <div className="flex-1 md:ml-0 min-w-0 pb-20 md:pb-0">
        {/* Sticky Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
            {/* Hamburger menu button for mobile, now inside header */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden mr-4 p-3 rounded-full bg-blue-600 text-white shadow-lg"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800 capitalize flex items-center">
              <span className="hidden sm:inline mr-2">Manage</span>
              {activeTab}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="md:hidden text-right">
                {user && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {user.name || user.email}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {bookings.length +
                  contacts.length +
                  services.length +
                  portfolio.length}{" "}
                items
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 overflow-x-hidden">
          {/* Enhanced Message Alert */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg border-l-4 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border-green-400"
                  : "bg-red-50 text-red-800 border-red-400"
              } shadow-sm`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">
                  {message.type === "success" ? "✅" : "⚠️"}
                </span>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Enhanced Loading Indicator */}
          {loading && <LoadingSpinner />}

          {/* Authentication Check */}
          {!token && !loading && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <span className="text-lg mr-3">🔒</span>
                <span>Please log in to access the admin dashboard.</span>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && token && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📅</span>
                  Booking Requests ({bookings.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <EmptyState message="No booking requests found" icon="📭" />
                ) : (
                  bookings.map((booking) => (
                    <MobileTableRow
                      key={booking.id}
                      item={booking}
                      type="booking"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {booking.name}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {booking.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <StatusBadge status={booking.status || "pending"} />
                            <button
                              onClick={() => toggleItemExpansion(booking.id)}
                              className="md:hidden text-gray-400 hover:text-gray-600"
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedItems.has(booking.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.phone || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Date:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {new Date(
                                booking.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-700">
                              Service:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {booking.service_id || "Not specified"}
                            </span>
                          </div>
                        </div>

                        {(expandedItems.has(booking.id) ||
                          window.innerWidth >= 768) && (
                          <div className="space-y-4 border-t border-gray-100 pt-4">
                            <div>
                              <span className="font-medium text-gray-700 block mb-1">
                                Message:
                              </span>
                              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                                {booking.message}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex-1">
                                <label
                                  htmlFor={`status-${booking.id}`}
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Update Status:
                                </label>
                                <select
                                  id={`status-${booking.id}`}
                                  value={booking.status || "pending"}
                                  onChange={(e) =>
                                    updateBookingStatus(
                                      booking.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </MobileTableRow>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === "contacts" && token && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📞</span>
                  Contact Messages ({contacts.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {contacts.length === 0 ? (
                  <EmptyState message="No contact messages found" icon="📭" />
                ) : (
                  contacts.map((contact) => (
                    <MobileTableRow
                      key={contact.id}
                      item={contact}
                      type="contact"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {contact.name}
                            </h4>
                            <p className="text-sm text-gray-600 truncate">
                              {contact.email}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {contact.subject}
                            </span>
                            <button
                              onClick={() => toggleItemExpansion(contact.id)}
                              className="md:hidden text-gray-400 hover:text-gray-600"
                            >
                              <svg
                                className={`w-5 h-5 transform transition-transform ${
                                  expandedItems.has(contact.id)
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          {contact.phone && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Phone:
                              </span>
                              <span className="ml-2 text-gray-900">
                                {contact.phone}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">
                              Date:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {new Date(
                                contact.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {(expandedItems.has(contact.id) ||
                          window.innerWidth >= 768) && (
                          <div className="space-y-4 border-t border-gray-100 pt-4">
                            <div>
                              <span className="font-medium text-gray-700 block mb-1">
                                Message:
                              </span>
                              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                                {contact.message}
                              </p>
                            </div>

                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  deleteItem("contact", contact.id)
                                }
                                className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                aria-label="Delete message"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </MobileTableRow>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && token && !loading && (
            <div className="space-y-6">
              {/* Enhanced Add New Service Form */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🛠️</span>
                  Add New Service
                </h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={newService.title}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter service title"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Price
                      </label>
                      <input
                        type="text"
                        id="price"
                        value={newService.price}
                        onChange={(e) =>
                          setNewService({
                            ...newService,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter price (optional)"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                      placeholder="Describe the service..."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="service-images"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                      <input
                        type="file"
                        id="service-images"
                        multiple
                        onChange={(e) =>
                          handleImageUpload(e, setNewService, "images")
                        }
                        className="hidden"
                      />
                      <label
                        htmlFor="service-images"
                        className="cursor-pointer"
                      >
                        <div className="text-gray-400 mb-2">
                          <svg
                            className="w-8 h-8 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">
                          Click to upload images
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    </div>
                    {newService.images.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        {newService.images.length} file(s) selected
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding Service...
                      </span>
                    ) : (
                      "Add Service"
                    )}
                  </button>
                </form>
              </div>

              {/* Enhanced Services List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Existing Services ({services.length})
                </h3>
                {services.length === 0 ? (
                  <EmptyState
                    message="No services found. Add your first service!"
                    icon="🛠️"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        {service.images && service.images.length > 0 && (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2 truncate">
                            {service.name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                          {service.price && (
                            <p className="text-blue-600 font-medium mb-4 truncate">
                              💰 {service.price}
                            </p>
                          )}
                          <button
                            onClick={() => deleteItem("service", service.id)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Service
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === "portfolio" && token && !loading && (
            <div className="space-y-6">
              {/* Enhanced Add New Portfolio Item Form */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📁</span>
                  Add New Portfolio Item
                </h3>
                <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="portfolio-title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="portfolio-title"
                      value={newPortfolio.title}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter portfolio item title"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portfolio-description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="portfolio-description"
                      rows={4}
                      value={newPortfolio.description}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical"
                      placeholder="Describe your portfolio item..."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portfolio-images"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors duration-200">
                      <input
                        type="file"
                        id="portfolio-images"
                        multiple
                        onChange={(e) =>
                          handleImageUpload(e, setNewPortfolio, "images")
                        }
                        className="hidden"
                        required
                      />
                      <label
                        htmlFor="portfolio-images"
                        className="cursor-pointer"
                      >
                        <div className="text-gray-400 mb-2">
                          <svg
                            className="w-8 h-8 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">
                          Click to upload project images
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    </div>
                    {newPortfolio.images.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        {newPortfolio.images.length} file(s) selected
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding Item...
                      </span>
                    ) : (
                      "Add Portfolio Item"
                    )}
                  </button>
                </form>
              </div>

              {/* Enhanced Portfolio Items List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🖼️</span>
                  Portfolio Items ({portfolio.length})
                </h3>
                {portfolio.length === 0 ? (
                  <EmptyState
                    message="No portfolio items found. Add your first project!"
                    icon="📁"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        {item.images && item.images.length > 0 && (
                          <img
                            src={item.images[0].image_url}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2 truncate">
                            {item.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {item.description}
                          </p>
                          <button
                            onClick={() => deleteItem("portfolio", item.id)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm font-medium"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Item
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Enhanced Sidebar */}
      <div
        className={`
        bg-white w-80 min-h-screen shadow-xl fixed md:relative z-40 transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {user && (
            <p className="text-blue-100 mt-2 truncate">
              Welcome, {user.name || user.email}
            </p>
          )}
        </div>
        <nav className="p-4">
          {[
            { id: "bookings", icon: "📅", label: "Bookings" },
            { id: "contacts", icon: "📞", label: "Contacts" },
            { id: "services", icon: "🛠️", label: "Services" },
            { id: "portfolio", icon: "📁", label: "Portfolio" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left py-4 px-4 rounded-xl mb-2 flex items-center transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-xl mr-4">{tab.icon}</span>
              <span className="text-lg">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>
          ))}
          <button
            onClick={logout}
            className="w-full text-left py-4 px-4 rounded-xl flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 mt-8 transition-colors duration-200"
          >
            <span className="text-xl mr-4">🚪</span>
            <span className="text-lg">Logout</span>
          </button>
        </nav>
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
