
export const capitalizeString = (string) => {
  const newString = string.split('/')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join('/');
  return newString.split(' ')
    .map(partialString => partialString.slice(0, 1).toUpperCase() + partialString.slice(1)).join(' ');
};

export const sorting = (list, property, lang) => list.sort((a, b) => {
  let compA = property ? a[property] : a;
  let compB = property ? b[property] : b;
  if (lang) {
    compA = compA[lang];
    compB = compB[lang];
  }
  if (compA.toLowerCase() > compB.toLowerCase()) {
    return 1;
  }
  return -1;
});
