interface Tag {
  [key: string]: TagData,
}

interface TagData {
  "name": string,
  "pageCount": number,
  "questionCount": number,
  "image": string,
}