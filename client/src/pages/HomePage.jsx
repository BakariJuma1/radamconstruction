import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    // Fetch services data
    axios.get('https://radamconstruction.onrender.com/services')
      .then(response => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.services || []; // handle wrapped object
        setServices(data.slice(0, 3));
        setLoadingServices(false);
      })
      .catch(error => {
        console.error('Error fetching services:', error);
        setLoadingServices(false);
      });

    // Fetch portfolio data
    axios.get('https://radamconstruction.onrender.com/portfolio')
      .then(response => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.portfolio || []; // handle wrapped object
        const portfolioData = data.slice(0, 3);
        setPortfolio(portfolioData);

        // Initialize current image index for each portfolio item
        const initialIndexes = {};
        portfolioData.forEach((item, index) => {
          initialIndexes[index] = 0;
        });
        setCurrentImageIndex(initialIndexes);

        setLoadingPortfolio(false);
      })
      .catch(error => {
        console.error('Error fetching portfolio:', error);
        setLoadingPortfolio(false);
      });
  }, []);

  // Function to navigate carousel images
  const nextImage = (portfolioIndex) => {
    setCurrentImageIndex(prevIndexes => ({
      ...prevIndexes,
      [portfolioIndex]: (prevIndexes[portfolioIndex] + 1) % portfolio[portfolioIndex].images.length
    }));
  };

  const prevImage = (portfolioIndex) => {
    setCurrentImageIndex(prevIndexes => ({
      ...prevIndexes,
      [portfolioIndex]: (prevIndexes[portfolioIndex] - 1 + portfolio[portfolioIndex].images.length) %
                        portfolio[portfolioIndex].images.length
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">BuildCorp Constructors</h1>
          <p className="text-xl md:text-2xl mb-8">Building Dreams, Crafting Excellence</p>
          <button className="bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
            Book a Service
          </button>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          
          {loadingServices ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.short_description}</p>
                    <a 
                      href="/services" 
                      className="inline-block bg-coral-500 hover:bg-coral-600 text-white font-medium py-2 px-4 rounded transition duration-300"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">Our Projects</h2>
          
          {loadingPortfolio ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {portfolio.map((project, index) => (
                <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={project.images[currentImageIndex[index]]} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                    {project.images && project.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => prevImage(index)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                        >
                          &lt;
                        </button>
                        <button 
                          onClick={() => nextImage(index)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full"
                        >
                          &gt;
                        </button>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <a 
                      href="/portfolio" 
                      className="inline-block bg-coral-500 hover:bg-coral-600 text-white font-medium py-2 px-4 rounded transition duration-300"
                    >
                      View More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-coral-500">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 text-white opacity-90">Get in touch with us for a free consultation and quote.</p>
          <a 
            href="/booking" 
            className="inline-block bg-white hover:bg-gray-100 text-coral-500 font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
          >
            Book Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 md:px-8">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} BuildCorp Constructors. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
