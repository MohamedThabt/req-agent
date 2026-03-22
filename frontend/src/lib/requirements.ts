export type RequirementCategory =
  | 'business_requirements'
  | 'users_and_roles'
  | 'functional_requirements'
  | 'non_functional_requirements'
  | 'integrations'
  | 'constraints'
  | 'technical_preferences'
  | 'data_and_entities'
  | 'validation_questions'

export type RequirementStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'blocked'
  | 'needs_clarification'
  | 'follow_up_later'

export type RequirementSource = 'chat'

export type AgentPhase =
  | 'planning'
  | 'asking'
  | 'evaluating'
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
}

export interface AgentRuntimeState {
  phase: AgentPhase
  detail: string
  updatedAt: Date
}

export const CATEGORY_ORDER: RequirementCategory[] = [
  'business_requirements',
  'users_and_roles',
  'functional_requirements',
  'non_functional_requirements',
  'integrations',
  'constraints',
  'technical_preferences',
  'data_and_entities',
  'validation_questions',
]

export const CATEGORY_LABELS: Record<RequirementCategory, string> = {
  business_requirements: 'Business Requirements',
  users_and_roles: 'Users and Roles',
  functional_requirements: 'Functional Requirements',
  non_functional_requirements: 'Non-Functional Requirements',
  integrations: 'Integrations',
  constraints: 'Constraints',
  technical_preferences: 'Technical Preferences',
  data_and_entities: 'Data and Entities',
  validation_questions: 'Validation Questions',
}

export const STATUS_LABELS: Record<RequirementStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  skipped: 'Skipped',
  blocked: 'Blocked',
  needs_clarification: 'Needs Clarification',
  follow_up_later: 'Follow-up Later',
}
