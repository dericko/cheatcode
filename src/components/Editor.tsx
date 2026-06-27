'use client'
import { useRef } from 'react'
import MonacoEditor, { type OnMount } from '@monaco-editor/react'
import { KeyMod, KeyCode } from 'monaco-editor'
import type { Language } from '@/types/problem'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onRun?: () => void
  theme?: string
  language?: Language
}

export default function Editor({ value, onChange, onRun, theme = 'vs-dark', language = 'typescript' }: EditorProps) {
  const onRunRef = useRef(onRun)
  onRunRef.current = onRun

  const handleMount: OnMount = (editor) => {
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => {
      onRunRef.current?.()
    })
  }

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme={theme}
      onMount={handleMount}
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
