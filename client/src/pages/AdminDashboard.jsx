import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // New service form state
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    images: []
  });

  // New portfolio item form state
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    images: []
  });

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        switch (activeTab) {
          case 'bookings':
            const bookingsRes = await axios.get('https://radamconstruction.onrender.com/bookings', config);
            setBookings(bookingsRes.data);
            break;
          case 'contacts':
            const contactsRes = await axios.get('https://radamconstruction.onrender.com/contacts', config);
            setContacts(contactsRes.data);
            break;
          case 'services':
            const servicesRes = await axios.get('https://radamconstruction.onrender.com/services');
            setServices(servicesRes.data);
            break;
          case 'portfolio':
            const portfolioRes = await axios.get('https://radamconstruction.onrender.com/portfolio');
            setPortfolio(portfolioRes.data);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('Error fetching data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newService.title);
      formData.append('description', newService.description);
      formData.append('price', newService.price);
      
      // Append each image file
      newService.images.forEach(image => {
        formData.append('images', image);
      });

      await axios.post('https://radamconstruction.onrender.com/services', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showMessage('Service created successfully', 'success');
      setNewService({ title: '', description: '', price: '', images: [] });
      
      // Refresh services list
      const servicesRes = await axios.get('https://radamconstruction.onrender.com/services');
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Error creating service:', error);
      showMessage('Error creating service', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newPortfolio.title);
      formData.append('description', newPortfolio.description);
      
      // Append each image file
      newPortfolio.images.forEach(image => {
        formData.append('images', image);
      });

      await axios.post('https://radamconstruction.onrender.com/portfolio', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showMessage('Portfolio item created successfully', 'success');
      setNewPortfolio({ title: '', description: '', images: [] });
      
      // Refresh portfolio list
      const portfolioRes = await axios.get('https://radamconstruction.onrender.com/portfolio');
      setPortfolio(portfolioRes.data);
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      showMessage('Error creating portfolio item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://radamconstruction.onrender.com/bookings/${bookingId}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ));
      
      showMessage('Booking status updated', 'success');
    } catch (error) {
      console.error('Error updating booking:', error);
      showMessage('Error updating booking', 'error');
    }
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (type) {
        case 'service':
          endpoint = `https://radamconstruction.onrender.com/services/${id}`;
          break;
        case 'portfolio':
          endpoint = `https://radamconstruction.onrender.com/portfolio/${id}`;
          break;
        case 'contact':
          endpoint = `https://radamconstruction.onrender.com/contacts/${id}`;
          break;
        default:
          return;
      }
      
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      switch (type) {
        case 'service':
          setServices(services.filter(item => item.id !== id));
          break;
        case 'portfolio':
          setPortfolio(portfolio.filter(item => item.id !== id));
          break;
        case 'contact':
          setContacts(contacts.filter(item => item.id !== id));
          break;
        default:
          break;
      }
      
      showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showMessage(`Error deleting ${type}`, 'error');
    }
  };

  const handleImageUpload = (e, setter, field) => {
    const files = Array.from(e.target.files);
    setter(prev => ({ ...prev, [field]: files }));
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        bg-white w-64 min-h-screen shadow-lg fixed md:relative z-40 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
        <nav className="p-4">
          {['bookings', 'contacts', 'services', 'portfolio'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left py-3 px-4 rounded-lg mb-2 flex items-center ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">
                {tab === 'bookings' && '📅'}
                {tab === 'contacts' && '📞'}
                {tab === 'services' && '🛠️'}
                {tab === 'portfolio' && '📂'}
              </span>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="px-4 py-3">
            <h2 className="text-xl font-semibold text-gray-800 capitalize">
              {activeTab}
            </h2>
          </div>
        </header>

        <main className="p-4">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && !loading && (
            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No bookings found
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{booking.name}</h3>
                            <p className="text-sm text-gray-500">{booking.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={booking.status || 'pending'} />
                            <select
                              value={booking.status || 'pending'}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Phone:</span> {booking.phone || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Service:</span> {booking.service_id || 'Not specified'}
                          </div>
                          <div className="sm:col-span-2">
                            <span className="font-medium">Message:</span> {booking.message}
                          </div>
                          <div className="sm:col-span-2 text-xs text-gray-500">
                            Received: {new Date(booking.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && !loading && (
            <div>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {contacts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No contact messages found
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div key={contact.id} className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{contact.name}</h3>
                            <p className="text-sm text-gray-500">{contact.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {contact.subject}
                            </span>
                            <button
                              onClick={() => deleteItem('contact', contact.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                              aria-label="Delete contact"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {contact.phone && (
                            <div>
                              <span className="font-medium">Phone:</span> {contact.phone}
                            </div>
                          )}
                          <div className="sm:col-span-2">
                            <span className="font-medium">Message:</span> {contact.message}
                          </div>
                          <div className="sm:col-span-2 text-xs text-gray-500">
                            Received: {new Date(contact.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && !loading && (
            <div className="space-y-6">
              {/* Add New Service Form */}
              <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Add New Service</h3>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newService.title}
                      onChange={(e) => setNewService({...newService, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={newService.description}
                      onChange={(e) => setNewService({...newService, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      id="price"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="service-images" className="block text-sm font-medium text-gray-700 mb-1">
                      Images
                    </label>
                    <input
                      type="file"
                      id="service-images"
                      multiple
                      onChange={(e) => handleImageUpload(e, setNewService, 'images')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Add Service
                  </button>
                </form>
              </div>
              
              {/* Services List */}
              <div>
                <h3 className="text-lg font-medium mb-4">Existing Services</h3>
                {services.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No services found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        {service.images && service.images.length > 0 && (
                          <img 
                            src={service.images[0]} 
                            alt={service.title} 
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description}</p>
                          {service.price && (
                            <p className="text-blue-600 font-medium mb-3">Price: {service.price}</p>
                          )}
                          <button
                            onClick={() => deleteItem('service', service.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          {activeTab === 'portfolio' && !loading && (
            <div className="space-y-6">
              {/* Add New Portfolio Item Form */}
              <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Add New Portfolio Item</h3>
                <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="portfolio-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="portfolio-title"
                      value={newPortfolio.title}
                      onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="portfolio-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="portfolio-description"
                      rows={3}
                      value={newPortfolio.description}
                      onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="portfolio-images" className="block text-sm font-medium text-gray-700 mb-1">
                      Images
                    </label>
                    <input
                      type="file"
                      id="portfolio-images"
                      multiple
                      onChange={(e) => handleImageUpload(e, setNewPortfolio, 'images')}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Add Portfolio Item
                  </button>
                </form>
              </div>
              
              {/* Portfolio Items List */}
              <div>
                <h3 className="text-lg font-medium mb-4">Portfolio Items</h3>
                {portfolio.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    No portfolio items found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolio.map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        {item.images && item.images.length > 0 && (
                          <img 
                            src={item.images[0].image_url} 
                            alt={item.title} 
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                          <button
                            onClick={() => deleteItem('portfolio', item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    </div>
  );
};

export default AdminDashboard;