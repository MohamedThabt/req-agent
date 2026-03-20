import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

let mermaidId = 0

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  fontFamily: 'var(--font-sans)',
  themeVariables: {
    fontSize: '14px',
    primaryColor: '#d4632d',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#a84f24',
    lineColor: '#8888a0',
    secondaryColor: '#3c425c',
    tertiaryColor: '#474d6e',
  },
})

interface MermaidDiagramProps {
  chart: string
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const id = `mermaid-${++mermaidId}`

    async function render() {
      try {
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim())
        if (!cancelled) {
          setSvg(renderedSvg)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
          setSvg(null)
        }
        const el = document.getElementById('d' + id)
        el?.remove()
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return (
      <div className="my-2 rounded-md bg-muted border border-border p-3">
        <p className="text-xs text-destructive font-mono">Mermaid error: {error}</p>
        <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">{chart}</pre>
      </div>
    )
  }

  if (!svg) {
    return (
      <div className="my-2 rounded-md bg-muted border border-border p-4 flex items-center justify-center">
        <span className="text-xs text-muted-foreground">Rendering diagram...</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-2 rounded-md bg-muted border border-border p-4 overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
