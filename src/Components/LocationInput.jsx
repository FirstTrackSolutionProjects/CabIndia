// src/Components/LocationInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { MapPin, Loader2, X } from 'lucide-react';

const LocationInput = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  onSelect,
  icon: Icon = MapPin,
  required = false,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'in' },
      types: ['geocode', 'establishment'],
    },
    debounce: 300,
  });

  // Sync with parent value
  useEffect(() => {
    if (value !== inputValue && !isFocused) {
      setValue(value, false);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect(address, lat, lng);
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback: just pass the address without coordinates
      onSelect(address, null, null);
    }
  };

  const handleClear = () => {
    setValue('', false);
    onChange('');
    onSelect('', null, null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="text-xs font-bold tracking-[0.15em] text-gray-400 uppercase block mb-1.5">
          {label} {required && <span className="text-yellow-400">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <Icon size={18} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          disabled={!ready}
          className="w-full bg-gray-800 border border-gray-700 focus:border-yellow-400/60 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.08)] disabled:opacity-50"
        />
        
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        
        {!ready && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && status === 'OK' && data.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {data.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;
            
            return (
              <button
                key={place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
              >
                <MapPin size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">{main_text}</p>
                  {secondary_text && (
                    <p className="text-xs text-gray-400">{secondary_text}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationInput;