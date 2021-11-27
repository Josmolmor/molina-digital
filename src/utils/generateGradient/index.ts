const hexValues = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
];

function populate(a: string) {
  let b = a;
  for (let i = 0; i < 6; i++) {
    const x = Math.round(Math.random() * 14);
    const y = hexValues[x];
    b += y;
  }
  return b;
}

function generateGradient() {
  const newColor1 = populate('#');
  const newColor2 = populate('#');
  const angle = Math.round(Math.random() * 360);

  return `linear-gradient(${angle}deg, ${newColor1}, ${newColor2})`;
}

export default generateGradient;
