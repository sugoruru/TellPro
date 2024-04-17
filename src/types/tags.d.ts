interface Tags {
  "tags": Tag[],
  "read": (string | number)[][]
}

interface Tag {
  "name": string,
  "id": number,
  "description": string
}