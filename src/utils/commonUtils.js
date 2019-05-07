
export const capitalizeString = string => string.split(' ')
  .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join(' ');

export const nodefault = 'x';
