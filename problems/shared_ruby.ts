export const RUBY_LINKED_LIST_SETUP = `
class ListNode
  attr_accessor :val, :next
  def initialize(val = 0, nxt = nil)
    @val = val
    @next = nxt
  end
end

def array_to_list(arr)
  return nil if arr.empty?
  head = ListNode.new(arr[0])
  curr = head
  arr[1..].each do |v|
    curr.next = ListNode.new(v)
    curr = curr.next
  end
  head
end

def list_to_array(head)
  result = []
  while head
    result << head.val
    head = head.next
  end
  result
end

def build_cyclic_list(vals, pos)
  return nil if vals.empty?
  nodes = vals.map { |v| ListNode.new(v) }
  (0...nodes.length - 1).each { |i| nodes[i].next = nodes[i + 1] }
  nodes.last.next = nodes[pos] if pos >= 0
  nodes.first
end
`

export const RUBY_TREE_SETUP = `
class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val = 0, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

def array_to_tree(arr)
  return nil if arr.empty? || arr[0].nil?
  root = TreeNode.new(arr[0])
  queue = [root]
  i = 1
  while !queue.empty? && i < arr.length
    node = queue.shift
    if i < arr.length && !arr[i].nil?
      node.left = TreeNode.new(arr[i])
      queue << node.left
    end
    i += 1
    if i < arr.length && !arr[i].nil?
      node.right = TreeNode.new(arr[i])
      queue << node.right
    end
    i += 1
  end
  root
end

def tree_to_array(root)
  return [] unless root
  result = []
  queue = [root]
  while !queue.empty?
    node = queue.shift
    if node
      result << node.val
      queue << node.left
      queue << node.right
    else
      result << nil
    end
  end
  result.pop while result.last.nil?
  result
end
`
