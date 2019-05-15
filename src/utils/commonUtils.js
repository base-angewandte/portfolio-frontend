
export const capitalizeString = (string) => {
  const newString = string.split('/')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join('/');
  return newString.split(' ')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join(' ');
};

export const sorting = (list, property) => list.sort((a, b) => {
  const compA = property ? a[property].toLowerCase() : a.toLowerCase();
  const compB = property ? b[property].toLowerCase() : b.toLowerCase();
  if (compA > compB) {
    return 1;
  }
  return -1;
});
