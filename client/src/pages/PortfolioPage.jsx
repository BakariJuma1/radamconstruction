import React, { useState, useEffect } from "react";
import axios from "axios";

const PortfolioPage = () => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://radamconstruction.onrender.com/portfolio")
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.portfolio || [];
        
        // Transform the data to match expected structure
        const transformedData = data.map(item => ({
          ...item,
          title: item.tittle || item.title, // Fix typo in API response
          // Combine main image with gallery images
          allImages: [
            item.image_url, // Main image
            ...(item.images?.map(img => img.image_url) || [])
          ].filter(Boolean) // Remove any null/undefined values
        }));
        
        setPortfolioItems(transformedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching portfolio:", error);
        setError("Failed to load portfolio. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Extract unique categories (adjust based on your actual category field)
  const categories = ["all", ...new Set(portfolioItems.map(item => item.category).filter(Boolean))];

  // Filter portfolio items by selected category
  const filteredItems = selectedCategory === "all" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  const openProjectModal = (project, index = 0) => {
    setSelectedProject(project);
    setCurrentImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (selectedProject?.allImages) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % selectedProject.allImages.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProject?.allImages) {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex - 1 + selectedProject.allImages.length) % selectedProject.allImages.length
      );
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedProject) return;
      
      if (e.key === 'Escape') closeProjectModal();
      else if (e.key === 'ArrowRight') nextImage();
      else if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject]);

  // Simple Image component with error handling
  const ImageWithFallback = ({ src, alt, className, isThumbnail = false }) => {
    const [hasError, setHasError] = useState(false);
    
    if (hasError || !src) {
      return (
        <div className={`${className} bg-gray-200 flex items-center justify-center`}>
          <div className="text-gray-400 text-center p-4">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
            </svg>
            <span className="text-xs">Image not available</span>
          </div>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        loading={isThumbnail ? "lazy" : "eager"}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Our Portfolio</h1>
          <p className="text-lg">
            Showcasing our excellence in quality construction projects
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">Browse Our Projects</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Something went wrong</h3>
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
              <p className="ml-3 text-gray-600">Loading projects...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects found</h3>
              <p className="text-gray-500">We don't have any projects in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300"
                  onClick={() => openProjectModal(project)}
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gray-100">
                    {project.allImages && project.allImages.length > 0 ? (
                      <>
                        <ImageWithFallback
                          src={project.allImages[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        {project.allImages.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs py-1 px-2 rounded flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            {project.allImages.length}
                          </div>
                        )}
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
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    {project.category && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {project.category}
                      </span>
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
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedProject.title}
              </h2>
              <button
                onClick={closeProjectModal}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Image Viewer */}
            <div className="relative bg-gray-900 flex-grow min-h-64">
              {selectedProject.allImages && selectedProject.allImages.length > 0 ? (
                <>
                  <div className="h-64 md:h-80 flex items-center justify-center">
                    <ImageWithFallback
                      src={selectedProject.allImages[currentImageIndex]}
                      alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  {selectedProject.allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {selectedProject.allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-blue-500 scale-125"
                                : "bg-white bg-opacity-50 hover:bg-opacity-100"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Project Details */}
            <div className="p-4 border-t">
              {selectedProject.category && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded mb-3">
                  {selectedProject.category}
                </span>
              )}
              <p className="text-gray-600 text-sm leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            {/* Image Gallery */}
            {selectedProject.allImages && selectedProject.allImages.length > 1 && (
              <div className="p-4 border-t bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Project Gallery ({selectedProject.allImages.length} images)</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {selectedProject.allImages.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 cursor-pointer border-2 rounded transition-all ${
                        index === currentImageIndex 
                          ? "border-blue-500" 
                          : "border-transparent hover:border-gray-300"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${selectedProject.title} - ${index + 1}`}
                        className="w-20 h-16 object-cover rounded"
                        isThumbnail={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;