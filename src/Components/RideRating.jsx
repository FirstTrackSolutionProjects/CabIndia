// src/Components/RideRating.jsx
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function RideRating({ rideId, onRated, initialRating = 0 }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [rated, setRated] = useState(initialRating > 0);

  const handleRate = async (value) => {
    if (rated) {
      toast.info('You already rated this ride');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/api/rides/${rideId}/rate`, { rating: value });
      if (response.data.success) {
        setRating(value);
        setRated(true);
        toast.success('⭐ Thank you for rating!');
        onRated && onRated(value);
      }
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => !rated && setHover(star)}
            onMouseLeave={() => !rated && setHover(0)}
            onClick={() => !rated && handleRate(star)}
            disabled={submitting || rated}
            className={`transition-all ${!rated && 'hover:scale-110'} ${rated ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              size={28}
              className={`${
                star <= (hover || rating) 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {rated ? (
        <p className="text-sm text-gray-400">You rated this ride {rating}★</p>
      ) : (
        <p className="text-sm text-gray-500">Tap a star to rate your ride</p>
      )}
    </div>
  );
}