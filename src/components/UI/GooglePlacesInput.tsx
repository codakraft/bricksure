import React, { useRef, useEffect, useState } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { Input } from "./Input";

interface GooglePlacesInputProps {
  value: string;
  onChange: (
    value: string,
    placeDetails?: google.maps.places.PlaceResult
  ) => void;
  placeholder?: string;
  className?: string;
}

// Google Maps libraries to load
const libraries: "places"[] = ["places"];

/**
 * GooglePlacesInput Component
 *
 * A text input with Google Places Autocomplete functionality.
 * Automatically suggests addresses as the user types.
 *
 * Features:
 * - Restricted to Nigeria for relevant results
 * - Returns place details including coordinates, formatted address, and components
 * - Falls back to regular input if no API key is configured
 *
 * Place Details Structure:
 * - formatted_address: Full address string
 * - geometry.location: {lat(), lng()} coordinates
 * - address_components: Array of address parts (street, city, state, postal code)
 * - place_id: Unique identifier for the location
 */

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder = "Enter location",
  className = "",
}) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  console.log("google", apiKey);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || "";
      setInputValue(address);
      onChange(address, place);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // If no API key is provided, fall back to regular input
  if (!apiKey) {
    console.warn("Google Maps API key not found. Using regular text input.");
    return (
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
        options={{
          componentRestrictions: { country: "ng" }, // Restrict to Nigeria
          types: ["address"], // Focus on addresses
        }}
      >
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
        />
      </Autocomplete>
    </LoadScript>
  );
};
