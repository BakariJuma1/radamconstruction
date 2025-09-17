import React, { useState, useEffect } from "react";
import axios from "axios";

const PortfolioPage = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Fetch portfolio data
    axios
      .get("https://radamconstruction.onrender.com/portfolio")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.portfolio || [];
        setPortfolioItems(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching portfolio:", error);
        setLoading(false);
      });
  }, []);

  // Extract unique categories from portfolio items
  const categories = ["all", ...new Set(portfolioItems.map(item => item.category).filter(Boolean))];

  // Filter portfolio items by selected category
  const filteredItems = selectedCategory === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const openProjectModal = (project, index = 0) => {
    setSelectedProject(project);
    setCurrentImageIndex(index);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % selectedProject.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.images) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex - 1 + selectedProject.images.length) % selectedProject.images.length
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Portfolio</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Showcasing our excellence in delivering quality construction projects across various sectors
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-10 px-4 md:px-8 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
              <p className="text-gray-500">We don't have any projects in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 group cursor-pointer"
                  onClick={() => openProjectModal(project)}
                >
                  <div className="relative overflow-hidden h-56 bg-gray-100">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
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
                      <button className="bg-blue-600 text-white py-2 px-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                        View Project
                      </button>
                    </div>
                    {project.images && project.images.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm py-1 px-2 rounded-lg">
                        {project.images.length} photos
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                    {project.category && (
                      <div className="mt-4">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {project.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="relative">
              {selectedProject.images && selectedProject.images.length > 0 ? (
                <>
                  <img
                    src={selectedProject.images[currentImageIndex]}
                    alt={selectedProject.title}
                    className="w-full h-96 object-cover"
                  />
                  {selectedProject.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {selectedProject.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white bg-opacity-50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-400">
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
              
              <button
                onClick={closeProjectModal}
                className="absolute top-4 right-4 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedProject.title}
              </h2>
              {selectedProject.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mb-4">
                  {selectedProject.category}
                </span>
              )}
              <p className="text-gray-600 mb-6">
                {selectedProject.description}
              </p>
              
              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">All Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedProject.images.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                          index === currentImageIndex ? "border-blue-500" : "border-transparent"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img
                          src={image}
                          alt={`${selectedProject.title} - ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;