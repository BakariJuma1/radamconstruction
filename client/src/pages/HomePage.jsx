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
          : response.data.services || [];
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
          : response.data.portfolio || [];
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

  // Auto-rotate carousel images
  useEffect(() => {
    if (portfolio.length > 0) {
      const intervals = portfolio.map((project, index) => {
        if (project.images && project.images.length > 1) {
          return setInterval(() => {
            nextImage(index);
          }, 5000);
        }
        return null;
      });

      return () => {
        intervals.forEach(interval => {
          if (interval) clearInterval(interval);
        });
      };
    }
  }, [portfolio]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1800&q=80')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Radamajaribu Builders</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto">
            Building Dreams, Crafting Excellence - Your trusted partner for quality construction and renovation services
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Book a Service
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300">
              View Projects
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              We offer a comprehensive range of construction services to bring your vision to life
            </p>
          </div>
          
          {loadingServices ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {services.map(service => (
                <div key={service.id} className="group bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <div className="relative overflow-hidden">
                    <img 
                      src={service.image_url} 
                      alt={service.title} 
                      className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <a 
                        href="/services" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Learn More
                      </a>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.short_description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <a 
              href="/services" 
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
            >
              View All Services
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Projects</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              Explore our portfolio of successfully completed construction projects
            </p>
          </div>
          
          {loadingPortfolio ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {portfolio.map((project, index) => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={project.images[currentImageIndex[index]]} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {project.images && project.images.length > 1 && (
                      <>
                        <button 
                          onClick={() => prevImage(index)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>
                        <button 
                          onClick={() => nextImage(index)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                        
                        {/* Image indicators */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {project.images.map((_, i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full ${i === currentImageIndex[index] ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                            ></div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">{project.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                    <a 
                      href="/portfolio" 
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
                    >
                      View Project
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <a 
              href="/portfolio" 
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
            >
              View All Projects
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
              <div className="text-lg">Projects Completed</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">25+</div>
              <div className="text-lg">Years Experience</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg">Expert Workers</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-lg">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Client Testimonials</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              What our clients say about our work and services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "Radamajaribu Builders transformed our home beyond expectations. Their attention to detail and professional approach made the entire process smooth and stress-free."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <div className="font-medium">John & Mary Doe</div>
                    <div className="text-sm text-gray-500">Residential Renovation</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Start Your Project?</h2>
          <p className="text-xl mb-10 text-blue-100">
            Get in touch with us for a free consultation and quote. Let's build something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/booking" 
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book a Consultation
            </a>
            <a 
              href="/contact" 
              className="inline-block bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;