import React from "react";
function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ image, name }) {
  const initials = getInitials(name);

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-16 h-16 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center text-xl font-bold select-none">
      {initials}
    </div>
  );
}

export default Avatar;
