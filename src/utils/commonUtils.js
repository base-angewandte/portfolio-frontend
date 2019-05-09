
export const capitalizeString = (string) => {
  const newString = string.split('/')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join('/');
  return newString.split(' ')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join(' ');
};

export const nodefault = 'x';
