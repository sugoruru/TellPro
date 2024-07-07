export const getAtCoderColors = (rate: number) => {
  if (rate === 0) {
    return '#000000';
  } else if (rate < 400) {
    return '#808080';
  } else if (rate < 800) {
    return '#804000';
  } else if (rate < 1200) {
    return '#008000';
  } else if (rate < 1600) {
    return '#00C0C0';
  } else if (rate < 2000) {
    return '#0000FF';
  } else if (rate < 2400) {
    return '#C0C000';
  } else if (rate < 2800) {
    return '#FF8000';
  } else {
    return '#FF0000';
  }
}

export const getCodeforcesColors = (rate: number) => {
  if (rate === 0) {
    return '#000000';
  } else if (rate < 1200) {
    return '#808080';
  } else if (rate < 1400) {
    return '#008000';
  } else if (rate < 1600) {
    return '#00C0C0';
  } else if (rate < 1900) {
    return '#0000FF';
  } else if (rate < 2100) {
    return '#C0C000';
  } else if (rate < 2400) {
    return '#FF8000';
  } else if (rate < 2700) {
    return '#FF0000';
  } else {
    return '#FF00FF';
  }
}