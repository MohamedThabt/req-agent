import { useState, useCallback, useMemo } from 'react'
import { TopBar } from './components/TopBar'
import { ConversationHistory, type Conversation } from './components/ConversationHistory'
import { ChatArea } from './components/ChatArea'
import { ChatInput } from './components/ChatInput'
import type { Message } from './components/MessageBubble'
import { RequirementPanel } from './components/RequirementPanel'
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type AgentRuntimeState,
  type RequirementCategory,
  type RequirementItem,
  type RequirementStatus,
} from './lib/requirements'

const sampleConversations: Conversation[] = [
  {
    id: '1',
    title: 'University LMS Discovery',
    lastMessage: 'Mapped scope, users, and authentication direction',
    timestamp: new Date(),
    isPinned: true,
    messageCount: 11,
  },
  {
    id: '2',
    title: 'Clinic Booking Assistant',
    lastMessage: 'Clarification pending on cancellation policy',
    timestamp: new Date(Date.now() - 3600000),
    isPinned: true,
    messageCount: 9,
  },
  {
    id: '3',
    title: 'Warehouse Tracking Platform',
    lastMessage: 'Integrations section completed',
    timestamp: new Date(Date.now() - 86400000),
    messageCount: 14,
  },
  {
    id: '4',
    title: 'Fintech KYC Portal',
    lastMessage: 'Non-functional goals captured',
    timestamp: new Date(Date.now() - 172800000),
    messageCount: 10,
  },
  {
    id: '5',
    title: 'SaaS Billing Migration',
    lastMessage: 'Data entities need final validation',
    timestamp: new Date(Date.now() - 259200000),
    messageCount: 16,
  },
  {
    id: '6',
    title: 'Retail POS Refresh',
    lastMessage: 'PRD generated and ready for export',
    timestamp: new Date(Date.now() - 432000000),
    messageCount: 13,
  },
]

const requirementBlueprints: Array<{
  id: string
  category: RequirementCategory
  question: string
  dependencies: string[]
}> = [
  {
    id: 'REQ-001',
    category: 'business_requirements',
    question: 'What business problem are you solving, and how will success be measured?',
    dependencies: [],
  },
  {
    id: 'REQ-002',
    category: 'users_and_roles',
    question: 'Who are the primary user roles, and what does each role need to accomplish?',
    dependencies: ['REQ-001'],
  },
  {
    id: 'REQ-003',
    category: 'functional_requirements',
    question: 'What are the core workflows and must-have capabilities in the first release?',
    dependencies: ['REQ-001', 'REQ-002'],
  },
  {
    id: 'REQ-004',
    category: 'non_functional_requirements',
    question: 'What reliability, performance, and security expectations should the system meet?',
    dependencies: ['REQ-003'],
  },
  {
    id: 'REQ-005',
    category: 'integrations',
    question: 'Which external systems, APIs, or third-party services must be integrated?',
    dependencies: ['REQ-003'],
  },
  {
    id: 'REQ-006',
    category: 'constraints',
    question: 'What constraints should we account for, such as timeline, budget, or compliance?',
    dependencies: [],
  },
  {
    id: 'REQ-007',
    category: 'technical_preferences',
    question: 'Do you have technology preferences or standards the solution must follow?',
    dependencies: ['REQ-006'],
  },
  {
    id: 'REQ-008',
    category: 'data_and_entities',
    question: 'What key entities and data relationships are required in the system?',
    dependencies: ['REQ-003'],
  },
  {
    id: 'REQ-009',
    category: 'validation_questions',
    question: 'What open risks or assumptions should be validated before implementation?',
    dependencies: ['REQ-004', 'REQ-006', 'REQ-008'],
  },
]

const buildInitialRequirements = (): RequirementItem[] =>
  requirementBlueprints.map((item, index) => ({
    id: item.id,
    category: item.category,
    question: item.question,
    answer: '',
    status: index === 0 ? 'in_progress' : 'not_started',
    confidence: 0,
    dependencies: item.dependencies,
    source: 'chat',
  }))

const sampleMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      role: 'assistant',
      content:
        'Welcome to ReqAgent. I will run structured discovery across 9 sections and generate a PRD at the end.\n\nLet us start with business requirements:\n\n**What business problem are you solving, and how will success be measured?**',
      timestamp: new Date(Date.now() - 240000),
      model: 'Gemini 2.5 Flash',
      requirementId: 'REQ-001',
    },
  ],
}

const initialRequirements = buildInitialRequirements()

function isResolvedStatus(status: RequirementStatus) {
  return status === 'completed' || status === 'skipped'
}

function scoreAnswerConfidence(answer: string) {
  const trimmed = answer.trim()
  const lengthScore = Math.min(35, Math.floor(trimmed.length / 3))
  const detailScore = /,|;|\band\b|\bwith\b|\bbecause\b/i.test(trimmed) ? 12 : 0
  const structureScore = /\d+\.|-\s|\n/.test(trimmed) ? 8 : 0
  return Math.min(96, 40 + lengthScore + detailScore + structureScore)
}

function App() {
  const [conversations] = useState<Conversation[]>(sampleConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>('1')
  const [messages, setMessages] = useState<Record<string, Message[]>>(sampleMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [requirements, setRequirements] = useState<RequirementItem[]>(initialRequirements)
  const [agentState, setAgentState] = useState<AgentRuntimeState>({
    phase: 'planning',
    detail: 'Selecting next discovery question',
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
    const base = CATEGORY_ORDER.reduce(
      (acc, category) => {
        acc[category] = { completed: 0, skipped: 0, resolved: 0, total: 0 }
        return acc
      },
      {} as Record<RequirementCategory, { completed: number; skipped: number; resolved: number; total: number }>
    )

    return requirements.reduce(
      (acc, req) => {
        acc[req.category].total += 1
        if (req.status === 'completed') {
          acc[req.category].completed += 1
        }
        if (req.status === 'skipped') {
          acc[req.category].skipped += 1
        }
        acc[req.category].resolved = acc[req.category].completed + acc[req.category].skipped
        return acc
      },
      base
    )
  }, [requirements])

  const overallProgress = useMemo(() => {
    const stats = Object.values(progressByCategory).reduce(
      (acc, item) => {
        acc.resolved += item.resolved
        acc.total += item.total
        return acc
      },
      { resolved: 0, total: 0 }
    )

    return stats.total === 0 ? 0 : Math.round((stats.resolved / stats.total) * 100)
  }, [progressByCategory])

  const pickOpenRequirement = useCallback(() => {
    return requirements.find((req) => !isResolvedStatus(req.status))
  }, [requirements])

  const handleRequirementStatusChange = useCallback(
    (id: string, status: RequirementStatus) => {
      const confidence =
        status === 'completed'
          ? 90
          : status === 'skipped'
            ? 0
            : status === 'needs_clarification'
              ? 45
              : undefined
      updateRequirementStatus(id, status, confidence)
      setAgentPhase('updating_progress', 'Requirement lifecycle updated')
      setTimeout(() => {
        setAgentPhase('planning', 'Selecting next requirement question')
      }, 500)
    },
    [setAgentPhase, updateRequirementStatus]
  )

  const handleSend = useCallback(
    (content: string) => {
      if (!activeConvId) return

      const answer = content.trim()
      if (!answer) return

      const targetRequirement = pickOpenRequirement()

      setAgentPhase('evaluating', 'Evaluating answer completeness and clarity')

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: answer,
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
                  answer,
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
        if (!targetRequirement) {
          const completionMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content:
              'All discovery sections are resolved. The session is ready for finalization and PRD generation.',
            timestamp: new Date(),
            model: 'Gemini 2.5 Flash',
          }

          setMessages((prev) => ({
            ...prev,
            [activeConvId]: [...(prev[activeConvId] || []), completionMessage],
          }))

          setAgentPhase('finalizing', 'Ready to generate final PRD markdown')
          setIsLoading(false)
          return
        }

        const confidence = scoreAnswerConfidence(answer)
        const needsClarification = confidence < 70

        let nextRequirement: RequirementItem | undefined

        setRequirements((prev) => {
          const updated: RequirementItem[] = prev.map((req): RequirementItem => {
            if (req.id !== targetRequirement.id) return req

            const nextStatus: RequirementStatus = needsClarification
              ? 'needs_clarification'
              : 'completed'

            return {
              ...req,
              answer,
              confidence,
              status: nextStatus,
              source: 'chat',
            }
          })

          nextRequirement = updated.find((req) => !isResolvedStatus(req.status))
          return updated
        })

        const aiContent = needsClarification
          ? `Thanks, I captured that for **${targetRequirement.id}** but I still need clarification.\n\nCurrent section: **${CATEGORY_LABELS[targetRequirement.category]}**\nOriginal question: ${targetRequirement.question}\n\nPlease add concrete details (scope, constraints, or examples) so I can validate this requirement with higher confidence.`
          : nextRequirement
            ? `Captured and validated **${targetRequirement.id}** at **${confidence}% confidence**.\n\nNext section: **${CATEGORY_LABELS[nextRequirement.category]}**\n\n**${nextRequirement.question}**`
            : `Great, all requirement sections are resolved.\n\nI can now finalize the session and generate the PRD markdown with assumptions, open questions, user stories, and acceptance criteria.`

        const linkedRequirementId = needsClarification
          ? targetRequirement.id
          : nextRequirement?.id

        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: aiContent,
          timestamp: new Date(),
          model: 'Gemini 2.5 Flash',
          requirementId: linkedRequirementId,
        }

        setMessages((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), aiMessage],
        }))

        setAgentPhase(
          needsClarification ? 'asking' : nextRequirement ? 'planning' : 'finalizing',
          needsClarification
            ? 'Clarification requested for current requirement'
            : nextRequirement
              ? 'Selecting next requirement question'
              : 'All sections resolved; PRD finalization available'
        )

        setAgentPhase('updating_progress', 'Refreshing requirement confidence and status')
        setTimeout(() => {
          setAgentPhase(
            needsClarification ? 'asking' : nextRequirement ? 'planning' : 'finalizing',
            needsClarification
              ? 'Waiting for targeted clarification answer'
              : nextRequirement
                ? 'Selecting next requirement question'
                : 'Session ready for PRD generation'
          )
        }, 550)

        setIsLoading(false)
      }, 1500 + Math.random() * 1500)
    },
    [activeConvId, pickOpenRequirement, setAgentPhase, updateRequirementStatus]
  )

  const handleNewChat = () => {
    const newId = `new-${Date.now()}`
    setActiveConvId(newId)
    const freshRequirements = buildInitialRequirements()
    setRequirements(freshRequirements)

    setMessages((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `seed-${Date.now()}`,
          role: 'assistant',
          content: `New ReqAgent session created.\n\n**${freshRequirements[0].question}**`,
          timestamp: new Date(),
          model: 'Gemini 2.5 Flash',
          requirementId: freshRequirements[0].id,
        },
      ],
    }))
    setHistoryOpen(false)
    setAgentPhase('asking', 'First discovery question has been issued')
  }

  const handleStop = () => {
    setIsLoading(false)
    setAgentPhase('planning', 'Response generation paused by user')
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="relative">
        <TopBar
          model="Gemini 2.5 Flash"
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
            getRequirementById={getRequirementById}
            onRequirementStatusChange={handleRequirementStatusChange}
          />

          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            onStop={handleStop}
            showHints={currentMessages.length === 0}
          />
        </div>

        <div className="hidden xl:block">
          <RequirementPanel
            requirements={requirements}
            onStatusChange={handleRequirementStatusChange}
          />
        </div>
      </main>
    </div>
  )
}

export default App
