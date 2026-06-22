'use client'
import MonacoEditor from '@monaco-editor/react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language="typescript"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
    />
  )
}
