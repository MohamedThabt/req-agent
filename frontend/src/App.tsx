import { useState, useCallback, useMemo } from 'react'
import { TopBar } from './components/TopBar'
import { ConversationHistory, type Conversation } from './components/ConversationHistory'
import { ChatArea } from './components/ChatArea'
import { ChatInput } from './components/ChatInput'
import type { Message } from './components/MessageBubble'
import { RequirementPanel } from './components/RequirementPanel'
import {
  type AgentRuntimeState,
  type RequirementCategory,
  type RequirementItem,
  type RequirementStatus,
  type UploadedDocument,
} from './lib/requirements'

const sampleConversations: Conversation[] = [
  {
    id: '1',
    title: 'Refactor Auth Module',
    lastMessage: 'I\'ve updated the JWT middleware...',
    timestamp: new Date(),
    isPinned: true,
    messageCount: 24,
  },
  {
    id: '2',
    title: 'Database Schema Design',
    lastMessage: 'The normalized schema looks good...',
    timestamp: new Date(Date.now() - 3600000),
    isPinned: true,
    messageCount: 18,
  },
  {
    id: '3',
    title: 'API Performance Tuning',
    lastMessage: 'Redis caching improved response time by 60%',
    timestamp: new Date(Date.now() - 86400000),
    messageCount: 12,
  },
  {
    id: '4',
    title: 'CI/CD Pipeline Setup',
    lastMessage: 'GitHub Actions workflow is configured',
    timestamp: new Date(Date.now() - 172800000),
    messageCount: 8,
  },
  {
    id: '5',
    title: 'Frontend Component Library',
    lastMessage: 'All base components documented',
    timestamp: new Date(Date.now() - 259200000),
    messageCount: 31,
  },
  {
    id: '6',
    title: 'Docker Configuration',
    lastMessage: 'Multi-stage build optimized image size',
    timestamp: new Date(Date.now() - 432000000),
    messageCount: 6,
  },
]

const sampleMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      role: 'user',
      content: 'Can you help me refactor the authentication module? The current JWT implementation is getting complex.',
      timestamp: new Date(Date.now() - 300000),
      requirementId: 'REQ-001',
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'I\'d be happy to help with refactoring the auth module! Let me analyze the current structure.\n\nHere\'s what I recommend:\n\n1. **Separate concerns** — Extract the JWT generation, validation, and refresh logic into distinct services\n2. **Middleware pattern** — Create a reusable auth middleware that handles token extraction and validation\n3. **Error handling** — Implement a consistent error response format for auth failures\n4. **Token rotation** — Add automatic refresh token rotation for better security\n\nShould I start with the JWT service extraction?',
      timestamp: new Date(Date.now() - 240000),
      model: 'GPT-4o',
      requirementId: 'REQ-001',
    },
    {
      id: 'm3',
      role: 'user',
      content: 'Yes, let\'s start with the JWT service. Also, can you make sure it supports both access and refresh tokens?',
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: 'm4',
      role: 'assistant',
      content: 'I\'ve created a comprehensive JWT service with the following structure:\n\n```typescript\nclass JwtService {\n  generateAccessToken(payload)   // 15min expiry\n  generateRefreshToken(payload)  // 7d expiry\n  verifyToken(token, type)\n  rotateRefreshToken(oldToken)\n  revokeToken(tokenId)\n}\n```\n\nKey features:\n• **Dual token support** with configurable expiry\n• **Token rotation** that invalidates used refresh tokens\n• **JTI (JWT ID)** for revocation support\n• **Type-safe** with full TypeScript generics\n\nThe middleware now cleanly separates authentication from authorization, making it easy to add role-based access control later.',
      timestamp: new Date(Date.now() - 120000),
      model: 'GPT-4o',
      requirementId: 'REQ-002',
    },
  ],
}

const initialRequirements: RequirementItem[] = [
  {
    id: 'REQ-001',
    category: 'business',
    question: 'What core business problem does your system solve?',
    answer: 'Need to modernize auth workflows and reduce implementation complexity.',
    status: 'completed',
    confidence: 90,
    dependencies: [],
    source: 'chat',
    linkedDocuments: [],
  },
  {
    id: 'REQ-002',
    category: 'functional',
    question: 'Which authentication capabilities must the system support?',
    answer: 'Access and refresh tokens, rotation support, and middleware integration.',
    status: 'in_progress',
    confidence: 68,
    dependencies: ['REQ-001'],
    source: 'chat',
    linkedDocuments: [],
  },
  {
    id: 'REQ-003',
    category: 'technical',
    question: 'How should token revocation and auditability be handled?',
    answer: '',
    status: 'not_started',
    confidence: 0,
    dependencies: ['REQ-002'],
    source: 'chat',
    linkedDocuments: [],
  },
  {
    id: 'REQ-004',
    category: 'non-functional',
    question: 'What availability and latency targets are required for auth endpoints?',
    answer: '',
    status: 'not_started',
    confidence: 0,
    dependencies: [],
    source: 'chat',
    linkedDocuments: [],
  },
]

function App() {
  const [conversations] = useState<Conversation[]>(sampleConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>('1')
  const [messages, setMessages] = useState<Record<string, Message[]>>(sampleMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [requirements, setRequirements] = useState<RequirementItem[]>(initialRequirements)
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [agentState, setAgentState] = useState<AgentRuntimeState>({
    phase: 'planning',
    detail: 'Mapping next best question',
    updatedAt: new Date(),
  })

  const currentMessages = activeConvId ? messages[activeConvId] || [] : []

  const setAgentPhase = useCallback((phase: AgentRuntimeState['phase'], detail: string) => {
    setAgentState({ phase, detail, updatedAt: new Date() })
  }, [])

  const updateRequirementStatus = useCallback((id: string, status: RequirementStatus, confidence?: number) => {
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status, confidence: confidence ?? req.confidence }
          : req
      )
    )
  }, [])

  const getRequirementById = useCallback(
    (id: string) => requirements.find((req) => req.id === id),
    [requirements]
  )

  const progressByCategory = useMemo(() => {
    return requirements.reduce(
      (acc, req) => {
        acc[req.category].total += 1
        if (req.status === 'completed') {
          acc[req.category].completed += 1
        }
        return acc
      },
      {
        business: { completed: 0, total: 0 },
        functional: { completed: 0, total: 0 },
        technical: { completed: 0, total: 0 },
        'non-functional': { completed: 0, total: 0 },
      } as Record<RequirementCategory, { completed: number; total: number }>
    )
  }, [requirements])

  const overallProgress = useMemo(() => {
    const stats = Object.values(progressByCategory).reduce(
      (acc, item) => {
        acc.completed += item.completed
        acc.total += item.total
        return acc
      },
      { completed: 0, total: 0 }
    )

    return stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)
  }, [progressByCategory])

  const pickOpenRequirement = useCallback(() => {
    return requirements.find((req) => req.status !== 'completed')
  }, [requirements])

  const handleRequirementStatusChange = useCallback(
    (id: string, status: RequirementStatus) => {
      const confidence = status === 'completed' ? 90 : status === 'needs_clarification' ? 45 : undefined
      updateRequirementStatus(id, status, confidence)
      setAgentPhase('updating_progress', 'Requirement lifecycle updated')
      setTimeout(() => {
        setAgentPhase('planning', 'Selecting next question')
      }, 500)
    },
    [setAgentPhase, updateRequirementStatus]
  )

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const accepted = files.filter((file) => {
        const mime = file.type.toLowerCase()
        return mime.includes('pdf') || mime.startsWith('image/')
      })

      if (accepted.length === 0) {
        return
      }

      const stagedDocs: UploadedDocument[] = accepted.map((file) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        status: 'queued',
      }))

      setDocuments((prev) => [...stagedDocs, ...prev])
      setAgentPhase('processing_documents', `Queued ${stagedDocs.length} document(s) for OCR and RAG`) 

      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((doc) =>
            stagedDocs.some((item) => item.id === doc.id) ? { ...doc, status: 'processing' } : doc
          )
        )
      }, 400)

      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((doc) =>
            stagedDocs.some((item) => item.id === doc.id) ? { ...doc, status: 'linked' } : doc
          )
        )

        setRequirements((prev) => {
          const openReq = prev.find((req) => req.status !== 'completed')
          if (!openReq) return prev

          return prev.map((req) =>
            req.id === openReq.id
              ? {
                  ...req,
                  linkedDocuments: [...req.linkedDocuments, ...stagedDocs.map((doc) => doc.id)],
                  source: stagedDocs.some((doc) => doc.type === 'pdf') ? 'pdf' : 'image',
                  status: req.status === 'not_started' ? 'in_progress' : req.status,
                }
              : req
          )
        })

        setAgentPhase('updating_progress', 'Document insights linked to open requirements')
        setTimeout(() => setAgentPhase('planning', 'Preparing next guided question'), 600)
      }, 1700)
    },
    [setAgentPhase]
  )

  const handleSend = useCallback(
    (content: string) => {
      if (!activeConvId) return

      const targetRequirement = pickOpenRequirement()

      setAgentPhase('evaluating', 'Evaluating answer completeness and clarity')

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
        status: 'sent',
        requirementId: targetRequirement?.id,
      }

      setMessages((prev) => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] || []), userMessage],
      }))

      if (targetRequirement) {
        setRequirements((prev) =>
          prev.map((req) =>
            req.id === targetRequirement.id
              ? {
                  ...req,
                  answer: content,
                  status: 'in_progress',
                  confidence: Math.max(req.confidence, 52),
                  source: 'chat',
                }
              : req
          )
        )
      }

      setIsLoading(true)

      setTimeout(() => {
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: generateResponse(content),
          timestamp: new Date(),
          model: 'GPT-4o',
          requirementId: targetRequirement?.id,
        }

        setMessages((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), aiMessage],
        }))

        if (targetRequirement) {
          const confidence = content.trim().length > 40 ? 86 : 48
          const nextStatus: RequirementStatus = confidence >= 70 ? 'completed' : 'needs_clarification'
          updateRequirementStatus(targetRequirement.id, nextStatus, confidence)
        }

        setAgentPhase('updating_progress', 'Refreshing requirement confidence and status')
        setTimeout(() => {
          setAgentPhase('planning', 'Selecting next requirement question')
        }, 550)

        setIsLoading(false)
      }, 1500 + Math.random() * 1500)
    },
    [activeConvId, pickOpenRequirement, setAgentPhase, updateRequirementStatus]
  )

  const handleNewChat = () => {
    const newId = `new-${Date.now()}`
    setActiveConvId(newId)
    setMessages((prev) => ({ ...prev, [newId]: [] }))
    setHistoryOpen(false)
    setAgentPhase('planning', 'Initializing fresh requirement discovery session')
  }

  const handleStop = () => {
    setIsLoading(false)
    setAgentPhase('planning', 'Response generation paused by user')
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="relative">
        <TopBar
          model="GPT-4o"
          isOnline={true}
          overallProgress={overallProgress}
          agentState={agentState}
          onNewChat={handleNewChat}
          onHistoryToggle={() => setHistoryOpen(!historyOpen)}
          historyOpen={historyOpen}
        />

        {historyOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setHistoryOpen(false)}
            />
            <ConversationHistory
              conversations={conversations}
              activeId={activeConvId}
              onSelect={(id) => {
                setActiveConvId(id)
                setHistoryOpen(false)
              }}
              onClose={() => setHistoryOpen(false)}
            />
          </>
        )}
      </div>

      <main className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatArea
            messages={currentMessages}
            isLoading={isLoading}
            agentState={agentState}
            progressByCategory={progressByCategory}
            onFilesSelected={handleFilesSelected}
            getRequirementById={getRequirementById}
            onRequirementStatusChange={handleRequirementStatusChange}
          />

          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            onStop={handleStop}
            showHints={currentMessages.length === 0}
            onFilesSelected={handleFilesSelected}
          />
        </div>

        <div className="hidden xl:block">
          <RequirementPanel
            requirements={requirements}
            documentsCount={documents.length}
            onStatusChange={handleRequirementStatusChange}
          />
        </div>
      </main>
    </div>
  )
}

function generateResponse(userMessage: string): string {
  const responses = [
    `Great question! Let me break this down.\n\nBased on my analysis, here are the key points:\n\n1. **Architecture** — The current structure follows a modular pattern, which is excellent for scalability\n2. **Performance** — I've identified a few bottlenecks that can be optimized\n3. **Best Practices** — There are some patterns we should adopt for better maintainability\n\nWould you like me to elaborate on any of these points?`,
    `I've analyzed your request carefully. Here's my recommendation:\n\n• First, we should establish clear **boundaries** between services\n• Then implement **proper error handling** throughout the pipeline\n• Finally, add **comprehensive logging** for debugging\n\nThis approach ensures we maintain code quality while making progress. Shall I create a detailed implementation plan?`,
    `Excellent! I've processed the information and here's what I found:\n\nThe solution involves three main components:\n\n\`\`\`mermaid\ngraph LR\n    A[ServiceA] -->|request| B[Middleware]\n    B -->|forward| C[ServiceB]\n    C -->|response| B\n    B -->|response| A\n\`\`\`\n\nEach component handles a specific responsibility, following the **Single Responsibility Principle**. The middleware acts as an orchestrator, ensuring data flows correctly between services.\n\nReady to implement this?`,
    `I understand! Let me provide a comprehensive solution.\n\n**Current State Analysis:**\n- The existing code covers ~80% of the requirements\n- There are 3 edge cases that need handling\n- Performance can be improved by ~40% with caching\n\n**Proposed Changes:**\n1. Add input validation layer\n2. Implement response caching with TTL\n3. Add retry logic with exponential backoff\n\nAll changes are backward compatible and include proper test coverage. Want me to start with the implementation?`,
  ]

  const idx = userMessage.length % responses.length
  return responses[idx]
}

export default App
