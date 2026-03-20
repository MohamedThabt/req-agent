export type RequirementCategory = 'business' | 'functional' | 'technical' | 'non-functional'

export type RequirementStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'needs_clarification'
  | 'follow_up_later'

export type RequirementSource = 'chat' | 'pdf' | 'image'

export type AgentPhase =
  | 'planning'
  | 'asking'
  | 'evaluating'
  | 'processing_documents'
  | 'updating_progress'
  | 'finalizing'

export interface RequirementItem {
  id: string
  category: RequirementCategory
  question: string
  answer: string
  status: RequirementStatus
  confidence: number
  dependencies: string[]
  source: RequirementSource
  linkedDocuments: string[]
}

export interface AgentRuntimeState {
  phase: AgentPhase
  detail: string
  updatedAt: Date
}

export interface UploadedDocument {
  id: string
  name: string
  type: 'pdf' | 'image'
  status: 'queued' | 'processing' | 'linked'
}

export const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  business: 'Business',
  functional: 'Functional',
  technical: 'Technical',
  'non-functional': 'Non-Functional',
}

export const STATUS_LABELS: Record<RequirementStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked',
  needs_clarification: 'Needs Clarification',
  follow_up_later: 'Follow-up Later',
}
