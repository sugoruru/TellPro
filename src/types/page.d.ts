interface Page {
  ID: string,
  userID: string,
  title: string,
  content: string,
  likeCount: number,
  commentCount: number,
  tags: string[],
  isPublic: boolean,
  date: string
}

// contentなどを省略して軽量化したPage型.
interface PageList {
  ID: string,
  userID: string,
  title: string,
  likeCount: number,
  commentCount: number,
  tags: string[],
  isPublic: boolean,
  date: string
}