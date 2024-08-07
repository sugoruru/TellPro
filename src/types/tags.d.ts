interface Tag {
  [key: string]: TagData,
}

interface TagData {
  name: string,
  page_count: number,
  question_count: number,
  problem_count: number,
  image: string,
}