import React, { useState, useEffect } from "react";
import axios from "axios";

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  useEffect(() => {
    // Fetch services data
    axios
      .get("https://radamconstruction.onrender.com/services")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.services || [];
        setServices(data.slice(0, 3));
        setLoadingServices(false);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        setLoadingServices(false);
      });

    // Fetch portfolio data
    axios
      .get("https://radamconstruction.onrender.com/portfolio")
      .then((response) => {
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
      .catch((error) => {
        console.error("Error fetching portfolio:", error);
        setLoadingPortfolio(false);
      });
  }, []);

  // Function to navigate carousel images
  const nextImage = (portfolioIndex) => {
    setCurrentImageIndex((prevIndexes) => ({
      ...prevIndexes,
      [portfolioIndex]:
        (prevIndexes[portfolioIndex] + 1) %
        portfolio[portfolioIndex].images.length,
    }));
  };

  const prevImage = (portfolioIndex) => {
    setCurrentImageIndex((prevIndexes) => ({
      ...prevIndexes,
      [portfolioIndex]:
        (prevIndexes[portfolioIndex] -
          1 +
          portfolio[portfolioIndex].images.length) %
        portfolio[portfolioIndex].images.length,
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
        intervals.forEach((interval) => {
          if (interval) clearInterval(interval);
        });
      };
    }
  }, [portfolio]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - No Image */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Building Excellence, <br className="hidden md:block" /> Crafting
            Legacy
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Professional construction services with over 10 years of experience
            delivering quality projects on time and within budget.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Your Project
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300">
              View Our Work
            </button>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-wider">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60">
            {[
              "Bamburi cement",
              "Doshi",
              "Simba cement",
              "Lakhir plastics",
              "Basco paints",
            ].map((company, index) => (
              <div key={index} className="text-xl font-semibold text-gray-700">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Professional Services
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              Comprehensive construction solutions tailored to meet your
              specific needs and exceed expectations
            </p>
          </div>

          {loadingServices ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100"
                >
                  <div className="relative overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    <div className="relative overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                      <img
                        src={service.image_url}
                        alt={service.name || service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {service.short_description}
                    </p>
                    <a
                      href="/services"
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
                    >
                      Learn More
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="/services"
              className="inline-flex items-center bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Explore All Services
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Portfolio Preview Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Featured Projects
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              Showcasing our excellence in delivering quality construction
              projects across various sectors
            </p>
          </div>

          {loadingPortfolio ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {portfolio.map((project, index) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden group border border-gray-100"
                >
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    {project.images && project.images.length > 0 ? (
                      <>
                        <img
                          src={project.images[currentImageIndex[index]]}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {project.images.length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(index)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                ></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => nextImage(index)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                ></path>
                              </svg>
                            </button>

                            {/* Image indicators */}
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {project.images.map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i === currentImageIndex[index]
                                      ? "bg-white"
                                      : "bg-white bg-opacity-50"
                                  }`}
                                ></div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
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
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <a
                      href="/portfolio"
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300"
                    >
                      View Case Study
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        ></path>
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
              className="inline-flex items-center bg-gray-800 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors duration-300"
            >
              View All Projects
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
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
              <div className="text-4xl md:text-5xl font-bold mb-2">60+</div>
              <div className="text-lg uppercase tracking-wider text-blue-200">
                Projects Completed
              </div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">10+</div>
              <div className="text-lg uppercase tracking-wider text-blue-200">
                Years Experience
              </div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg uppercase tracking-wider text-blue-200">
                Expert Workers
              </div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-lg uppercase tracking-wider text-blue-200">
                Happy Clients
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Process
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              A structured approach to ensure quality and efficiency in every
              project we undertake
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                title: "Consultation",
                desc: "Understanding your vision and requirements",
              },
              {
                title: "Planning",
                desc: "Detailed project planning and design",
              },
              {
                title: "Execution",
                desc: "Quality construction with precision",
              },
              { title: "Completion", desc: "Final delivery and follow-up" },
            ].map((step, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-lg"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Client Testimonials
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              What our clients say about our work and services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "Radamjaribu Builders transformed our home beyond
                  expectations. Their attention to detail and professional
                  approach made the entire process smooth and stress-free."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full mr-4 flex items-center justify-center text-blue-600 font-bold">
                    KW
                  </div>
                  <div>
                    <div className="font-medium">Ken Wekesa</div>
                    <div className="text-sm text-gray-500">
                      Residential Renovation
                    </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Get in touch with us for a free consultation and quote. Let's build
            something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/booking"
              className="inline-block bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Request a Quote
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
