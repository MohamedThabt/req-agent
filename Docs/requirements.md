# 🧠 AI Requirements Gathering Agent

## High-Level Overview

The goal is to build an AI-powered chatbot agent that helps software engineers gather and clarify software requirements through structured, intelligent conversations.

The agent will:

- Ask guided and contextual questions
- Manage requirement progress
- Track completed vs pending questions
- Accept supporting documents (PDFs, Images)
- Extract information using OCR
- Show its current internal state (Planning, Working, Evaluating, etc.)

---

# 🎯 Core Objective

Transform raw project ideas into:

- Clear software requirements
- Structured feature breakdown
- Defined business rules
- Identified missing information
- A validated requirements document

---

# 🧩 Core Capabilities

## 1️⃣ Intelligent Question Engine

The agent should:

- Generate contextual and category-based questions
- Ask follow-up questions when answers are unclear
- Detect vague or incomplete responses
- Decide question status automatically:
  - ✅ Completed
  - ⏳ Needs Clarification
  - 🔄 Follow-up Later

### Example Flow

> **Agent:** What problem does your system solve?
> **User:** It helps students.
> **Agent:** How exactly does it help them? In which workflow?
---

## 2️⃣ Question Lifecycle Management

Each requirement question must contain:

- Status:
  - Not Started
  - In Progress
  - Completed
  - Blocked
- Confidence Score (0–100%)
- Linked documents (PDF/Image reference)
- Category (Business, Technical, etc.)

---

## 3️⃣ Progress Tracking System

The agent should display structured progress such as:

- 🟢 40% Business Requirements Completed
- 🟡 Functional Requirements In Progress
- 🔵 Technical Architecture Not Started

This makes the agent act like an AI-driven project manager.

---

## 4️⃣ Document & File Understanding

### 📄 PDF Support

If the user uploads:

- BRD
- Notes
- Proposal
- Documentation

The agent should:

1. Extract text
2. Chunk content
3. Generate embeddings
4. Use RAG to answer questions
5. Link extracted insights to open requirements

---

### 🖼 Image Support (OCR)

If the user uploads:

- Whiteboard photo
- Flowchart
- Screenshot

The agent should:

1. Run OCR
2. Extract readable text
3. Understand diagram structure (if possible)
4. Map extracted data to relevant open questions

---

## 5️⃣ Agent State Awareness

The agent must expose its internal state to the user.

### Possible States:

- 🧠 Planning (deciding next question)
- 💬 Asking
- 🔍 Evaluating answer
- 📄 Processing documents
- 📊 Updating progress
- ✅ Finalizing requirements

This increases transparency and trust.

---

# 🏗 Internal Architecture Design

## Requirement Object Model

Each requirement should follow a structured format:

```json
{
  "id": "REQ-001",
  "category": "business | functional | technical | non-functional",
  "question": "",
  "answer": "",
  "status": "not_started | in_progress | completed | blocked",
  "confidence": 0,
  "dependencies": [],
  "source": "chat | pdf | image"
}
```
## 🧠 Core Agent Modules

### 1️⃣ Conversation Orchestrator
Controls flow and decides the next best question.

### 2️⃣ Requirement Memory Store
Stores structured requirements persistently.

### 3️⃣ Evaluation Engine
Checks:
- Answer completeness
- Vagueness
- Logical conflicts
- Missing edge cases

### 4️⃣ Document Processing Module
- PDF parser
- OCR processor
- Embedding engine
- Vector search (RAG)

### 5️⃣ State Manager
Controls and exposes the agent state:
- Planning
- Working
- Evaluating
- Idle
- Completed

## 🔄 Decision Logic

The agent should follow structured logic:

```text
IF answer_confidence < threshold:
    Ask clarification
ELSE:
    Mark question as completed
    Move to next requirement category
```

## 🧱 Requirement Categories

The agent should systematically cover:

- Business Goals
- Target Users
- User Roles
- Core Features
- Workflows
- Edge Cases
- Non-Functional Requirements
- Integrations
- Constraints
- Security
- Scalability

## 📊 Final Output of the Agent

At completion, the agent should generate:

Structured Requirements Document (Markdown / PDF) that contains:    
- Feature List
- User Stories
- Acceptance Criteria
- Open Questions List
- Assumptions List

