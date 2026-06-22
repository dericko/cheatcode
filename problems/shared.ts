export const LINKED_LIST_SETUP = `
class ListNode {
  val: number
  next: ListNode | null
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val
    this.next = next === undefined ? null : next
  }
}
function arrayToList(arr: number[]): ListNode | null {
  if (!arr.length) return null
  const head = new ListNode(arr[0])
  let curr = head
  for (let i = 1; i < arr.length; i++) { curr.next = new ListNode(arr[i]); curr = curr.next! }
  return head
}
function listToArray(head: ListNode | null): number[] {
  const r: number[] = []
  while (head) { r.push(head.val); head = head.next }
  return r
}
function buildCyclicList(vals: number[], pos: number): ListNode | null {
  if (!vals.length) return null
  const nodes = vals.map(v => new ListNode(v))
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1]
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos]
  return nodes[0]
}
`

export const TREE_SETUP = `
class TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val === undefined ? 0 : val
    this.left = left === undefined ? null : left
    this.right = right === undefined ? null : right
  }
}
function arrayToTree(arr: (number | null)[]): TreeNode | null {
  if (!arr.length || arr[0] === null) return null
  const root = new TreeNode(arr[0])
  const queue: TreeNode[] = [root]
  let i = 1
  while (queue.length && i < arr.length) {
    const node = queue.shift()!
    if (i < arr.length && arr[i] !== null) { node.left = new TreeNode(arr[i] as number); queue.push(node.left) }
    i++
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i] as number); queue.push(node.right) }
    i++
  }
  return root
}
function treeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return []
  const result: (number | null)[] = []
  const queue: (TreeNode | null)[] = [root]
  while (queue.length) {
    const node = queue.shift()!
    if (node) { result.push(node.val); queue.push(node.left); queue.push(node.right) }
    else result.push(null)
  }
  while (result[result.length - 1] === null) result.pop()
  return result
}
`
