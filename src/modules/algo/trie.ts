class TrieNode {
  char: string;
  isLastChar: boolean;
  children: Map<string, TrieNode>;
  constructor(char?: string, isLastChar = false) {
    this.char = char ?? "";
    this.isLastChar = isLastChar;
    this.children = new Map();
  }

  getChild(char: string) {
    return this.children.get(char);
  }

  addChild(character: string, isLastChar: boolean) {
    if (!this.children.has(character)) {
      this.children.set(character, new TrieNode(character, isLastChar))
    }
    const childNode = this.children.get(character);
    if (childNode)
      childNode.isLastChar = childNode.isLastChar || isLastChar;
    return childNode;
  }

  removeChild(character: string) {
    const childNode = this.getChild(character)
    if (
      childNode
      && !childNode.isLastChar
      && !childNode.hasChildren()
    ) {
      this.children.delete(character)
    }
  }

  hasChild(character: string) {
    return this.children.has(character)
  }

  hasChildren() {
    return this.children.size !== 0
  }
}

export default class Trie {
  head: TrieNode | undefined;
  children: TrieNode[];

  constructor() {
    this.head = new TrieNode();
    this.children = [];
  }
  insertWord(word: string) {
    const characters = Array.from(word);
    let currentNode = this.head;
    for (let charIndex = 0; charIndex < word.length; charIndex++) {
      const isLastChar = charIndex === characters.length - 1;
      if (currentNode)
        currentNode = currentNode.addChild(characters[charIndex], isLastChar);
    }
  }
  deleteWord(word: string) {
    const depthFirstDelete = (currentNode: TrieNode, charIndex = 0) => {
      if (charIndex >= word.length) return
      const character = word[charIndex]
      const nextNode = currentNode.getChild(character)
      if (nextNode == null) return
      depthFirstDelete(nextNode, charIndex + 1)
      if (charIndex === (word.length - 1)) {
        nextNode.isLastChar = false
      }
      currentNode.removeChild(character)
    }
    if (this.head)
      depthFirstDelete(this.head)
    return this
  }

  doesWordExist(word: string) {
    const lastCharacter = this.getLastCharacterNode(word)
    return !!lastCharacter && lastCharacter.isLastChar
  }

  private getLastCharacterNode(word: string) {
    const characters = Array.from(word);
    let currentNode = this.head;
    for (let i = 0; i < characters.length; i++) {
      if (!currentNode) return;
      if (!currentNode.hasChild(characters[i])) return;
      currentNode = currentNode.getChild(characters[i]);
    }
    return currentNode;
  }
}