enum NodeType {
  Element = 'element',
  Text = 'text'
}

enum ElementType {
  // Inline
  Bold = 'b',
  Italic = 'i',
  Underline = 'u',
  Strikethrough = 's',
  token = 'token',
  link = 'link',

  // Block
  Heading1 = 'h1',
  Heading2 = 'h2',
  Heading3 = 'h3',
  Heading4 = 'h4',
  Heading5 = 'h5',
  Heading6 = 'h6',
  Paragraph = 'p',
  OrderedList = 'ol',
  UnorderedList = 'ul',
  ListItem = 'li',
  Blockquote = 'blockquote',
  Rule = 'hr',
  code = 'code',
  Image = 'image',
  Audio = 'audio',
  Video = 'video'
}

interface ENode {
  nodeType: NodeType
}

interface Text {
  nodeType: NodeType.Text
  content: string
}

interface Attribute {
  key: string
  value: string
}

interface ELement {
  nodeType: NodeType.Element
  elementType: ElementType
  attributes: Attribute[]
  children: ENode[]
}

interface Document {
  version: string | number // ????
  nodes: ENode[]
  // ????
}

interface Cursor {
  node: ENode
  nodeIndex: number // if the nodeIndex does NOT refer to a text node, insert one at index on 'input' event
  charIndex: number
}

const example = {
  version: 'string or number?',
  nodes: [
    {
      nodeType: NodeType,
      elementType: ElementType


    }
  ]
}
