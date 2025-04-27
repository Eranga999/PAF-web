import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const ImageCarousel = ({ imageIds, altPrefix = 'Post media' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ensure imageIds is an array and not empty
  if (!imageIds || imageIds.length === 0) {
    return (
      <div className="aspect-[16/9] w-full bg-gray-100 flex items-center justify-center rounded-lg">
        <Camera className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageIds.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageIds.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
      {/* Images */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {imageIds.map((imageId, index) => (
          <img
            key={imageId}
            src={`http://localhost:8080/api/images/${imageId}`}
            alt={`${altPrefix} ${index + 1}`}
            className="w-full h-full object-cover flex-shrink-0"
            onError={(e) => {
              console.error('ImageCarousel.jsx - Failed to load image:', imageId);
              e.target.src = 'https://via.placeholder.com/300';
            }}
            onLoad={() => console.log('ImageCarousel.jsx - Image loaded successfully:', imageId)}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      {imageIds.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      {imageIds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {imageIds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-white scale-125' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;