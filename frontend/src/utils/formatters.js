// Format Philippine Peso (PHP) currency
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(num);
};

// Format Date string
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Get displayable image URL for market space
export const getSpaceImageUrl = (image, spaceNumber = '') => {
  if (!image) {
    const num = String(spaceNumber).toUpperCase();
    if (num.includes('101') || num.includes('102') || num.includes('WET')) return '/assets/spaces/stall_wet.png';
    if (num.includes('105') || num.includes('106') || num.includes('FOOD')) return '/assets/spaces/stall_food.png';
    if (num.includes('107') || num.includes('GROCERY')) return '/assets/spaces/stall_grocery.png';
    return '/assets/spaces/stall_retail.png';
  }

  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/assets/')) {
    return image;
  }

  if (image.startsWith('stall_') && (image.endsWith('.jpg') || image.endsWith('.png') || image.endsWith('.webp'))) {
    return `/assets/spaces/${image}`;
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${image}`;
};

// Get displayable image URL for user profile picture
export const getUserAvatarUrl = (profileImage) => {
  if (!profileImage) return null;
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://') || profileImage.startsWith('data:')) {
    return profileImage;
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${profileImage}`;
};

