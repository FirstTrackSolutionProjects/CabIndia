// src/components/Carousel.tsx
import React, { useState } from 'react';

interface CarouselProps {
  images: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="relative w-full sm:h-96 h-48 bg-gray-800">
      <div className="relative overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 flex justify-center">
              <img  src={image} alt={`Slide ${index}`} className='sm:h-96 h-48' />
            </div>
          ))}
        </div>
      </div>
      <button
        className="absolute flex justify-center items-center top-1/2 left-0 transform -translate-y-1/2  text-white p-2 rounded-full focus:outline-none  text-3xl"
        onClick={prevSlide}
      >
        &lt;
      </button>
      <button
        className="absolute top-1/2 right-0 transform -translate-y-1/2  text-white p-2 rounded-full focus:outline-none text-3xl"
        onClick={nextSlide}
      >
        &gt;
      </button>
    </div>
  );
};

export default Carousel;
