# ReqAgent — Architecture & Diagrams

---

## Overview

ReqAgent is an AI-powered requirements discovery agent built to replace unstructured client interviews and scattered requirement documents with a guided, intelligent conversation. It acts as a senior system analyst — asking the right questions in the right order, evaluating the quality of each answer, and producing a structured Product Requirements Document (PRD) at the end.

The agent is not a chatbot. It has a defined goal (a complete PRD), a structured question flow (predefined sections), a memory of what has been said, and a self-correcting evaluation loop that asks for clarification when an answer is unclear or incomplete. Every session ends with a single markdown document that a development team can act on immediately.

---

## Purpose

Most software projects fail early because requirements are unclear, incomplete, or never written down. Discovery meetings produce notes that get lost. Clients describe symptoms instead of problems. Developers make assumptions that contradict each other by sprint three.

ReqAgent solves this by doing structured requirements discovery automatically. It guides any stakeholder — technical or non-technical — through a complete set of business, functional, non-functional, technical, and constraint questions. It evaluates every answer for clarity and completeness using an LLM, asks targeted follow-up questions when needed, and builds a living requirements record throughout the session. When discovery is complete, it generates a PRD that covers features, user stories, acceptance criteria, open questions, and assumptions — ready to hand to a product or engineering team.

---

## Goals

| Goal | Description |
|---|---|
| Structured discovery | Guide users through all 9 requirement sections in a consistent, repeatable order |
| Answer quality assurance | Evaluate every answer for clarity, completeness, and confidence — never silently accept a vague response |
| Adaptive conversation | Generate targeted clarification questions when answers are insufficient, up to 2 attempts per question |
| Session persistence | Save full state, conversation history, requirements, and the final PRD to the database — resumable at any time |
| Lean context management | Compress conversation history into a rolling summary so the LLM context stays small without losing important decisions |
| PRD generation | Produce a complete, structured markdown PRD from all collected requirements at the end of discovery |
| Clean architecture | Keep every agent node a pure function with no DB access, no FastAPI dependency, and one responsibility only |

---

## Scope

### In scope

- Guided requirements discovery across 9 predefined sections: business requirements, users and roles, functional requirements, non-functional requirements, integrations, constraints, technical preferences, data and entities, and validation questions
- Per-answer LLM evaluation with confidence scoring and missing-point detection
- Clarification loop capped at 2 attempts per question before escalation
- Skip support — users can skip any question; skipped questions count as resolved for session completion
- Rolling conversation summarization every N turns to keep LLM context lean
- Full session persistence: `state`, `chat`, `requirements`, and `prd` stored in a single `sessions` table
- PRD generation as a markdown document covering features, user stories, acceptance criteria, open questions, assumptions, functional and non-functional requirements
- REST API over FastAPI with a React frontend

### Out of scope (current version)

- RAG (retrieval-augmented generation) from uploaded documents
- OCR processing of images or scanned files
- Multi-user collaboration on a single session
- Real-time streaming of agent responses (polling model only)
- Custom question flows per project type
- Version history or diff between PRD drafts

---

## Agent Architecture at a Glance

```
React Frontend
      ↕  REST
FastAPI  (routes → controller → service)
      ↕
  runner.py          — injects message, invokes graph, dispatches DB writes
      ↕
LangGraph Graph      — 12 pure-function nodes, no DB access
      ↕
state_manager.py     — all reads and writes to PostgreSQL
      ↕
session_repository   — raw SQL against the sessions table
      ↕
PostgreSQL sessions  — state (JSON) | chat (JSON) | requirements (JSON) | prd (LONGTEXT)
```

### The 12 nodes at a glance

| Node | Role | LLM |
|---|---|---|
| `planner_node` | Decides next strategy by reading flags, evaluation, and progress | no |
| `strategy_router_node` | Translates strategy into a LangGraph edge — no state write | no |
| `question_selector_node` | Picks next predefined question from the JSON question bank | no |
| `clarification_node` | Generates one targeted clarification question | yes |
| `ask_node` | Publishes question to state as `agent_reply` | no |
| `wait_node` | Halts graph until user message is injected by runner | no |
| `evaluate_node` | Scores answer quality — confidence, clarity, completeness | yes |
| `decision_node` | Routes to clarification or accepted — no state write | no |
| `update_requirement_node` | Writes requirement object and advances question index | no |
| `progress_node` | Recalculates section completion, sets `ready_for_prd` flag | no |
| `summarizer_node` | Compresses conversation into rolling memory summary | yes |
| `finalizer_node` | Generates full PRD markdown from all requirements | yes |

4 LLM calls maximum per full discovery cycle. All other nodes are pure Python logic.

---

## 1. Database Design (ER Diagram)

One table. All session data lives in four typed columns — no joins, no foreign keys.

```mermaid
erDiagram
    sessions {
        UUID        id              PK
        TEXT        name
        JSON        state           "flow + flags + evaluation + progress + planning + memory + answers"
        JSON        chat            "messages array + turn_count + watermark"
        JSON        requirements    "array of requirement objects"
        LONGTEXT    prd             "final PRD as raw markdown — null until session complete"
        TIMESTAMP   created_at
        TIMESTAMP   updated_at
    }
```

### `state` JSON — internal shape

| Key | Contains |
|---|---|
| `session` | session_id, started_at, last_active_at |
| `flow` | current_category, current_question_id, question_index, current_strategy, last_question_source, current_question_text |
| `flags` | waiting_for_user, ready_for_prd, skip_requested, ready_for_next_question, session_complete |
| `evaluation` | last_confidence, last_is_clear, last_is_complete, needs_clarification, missing_points[], clarification_count, clarification_threshold |
| `progress` | per-section object: `{ completed, skipped, resolved, total }` for each of the 9 sections |
| `planning` | question_queue[], skipped_question_ids[], last_planner_decision |
| `memory` | conversation_summary, key_decisions[], last_n_messages[], summary_turn_count |
| `answers` | flat map — `{ "BUS-001": "answer text", "FUN-003": "answer text", ... }`


```json
{
  "session": {
    "session_id": "uuid",
    "started_at": "2025-01-01T10:00:00Z",
    "last_active_at": "2025-01-01T10:30:00Z"
  },

  "flow": {
    "current_category": "business_requirements",
    "current_question_id": "BUS-003",
    "question_index": 2,
    "current_strategy": "select_predefined",
    "last_question_source": "predefined",
    "current_question_text": null
  },

  "flags": {
    "waiting_for_user": true,
    "ready_for_next_question": false,
    "ready_for_prd": false,
    "skip_requested": false,
    "is_blocked": false
  },

  "evaluation": {
    "last_confidence": 65,
    "last_is_clear": false,
    "last_is_complete": false,
    "needs_clarification": true,
    "missing_points": ["edge cases", "error handling"],
    "clarification_count": 1,
    "clarification_threshold": 2
  },

  "progress": {
    "business_requirements":      { "completed": 2, "skipped": 1, "resolved": 3, "total": 8 },
    "users_and_roles":            { "completed": 0, "skipped": 0, "resolved": 0, "total": 5 },
    "functional_requirements":    { "completed": 0, "skipped": 0, "resolved": 0, "total": 10 },
    "non_functional_requirements":{ "completed": 0, "skipped": 0, "resolved": 0, "total": 12 },
    "integrations":               { "completed": 0, "skipped": 0, "resolved": 0, "total": 4 },
    "constraints":                { "completed": 0, "skipped": 0, "resolved": 0, "total": 4 },
    "technical_preferences":      { "completed": 0, "skipped": 0, "resolved": 0, "total": 3 },
    "data_and_entities":          { "completed": 0, "skipped": 0, "resolved": 0, "total": 3 },
    "validation_questions":       { "completed": 0, "skipped": 0, "resolved": 0, "total": 3 }
  },

  "planning": {
    "question_queue": [
      { "id": "BUS-003", "priority": 1, "status": "pending" },
      { "id": "BUS-004", "priority": 2, "status": "pending" }
    ],
    "skipped_question_ids": ["BUS-006"],
    "last_planner_decision": {
      "strategy": "select_predefined",
      "reason": "answer accepted, moving to next",
      "timestamp": "2025-01-01T10:28:00Z"
    }
  },

  "memory": {
    "conversation_summary": "User is building an LMS for university students and teachers. Main goal is course management. Target users are students and instructors.",
    "summary_turn_count": 8,
    "key_decisions": [
      "Platform type: LMS",
      "Primary users: students and teachers",
      "Goal: course management"
    ],
    "last_n_messages": [
      { "role": "assistant", "content": "Who are the target users?", "msg_id": "msg_010" },
      { "role": "user",      "content": "Students and teachers at universities", "msg_id": "msg_011" }
    ]
  },

  "answers": {
    "BUS-001": "Build an LMS platform for universities",
    "BUS-002": "Help teachers manage courses and students track progress"
  }
}
```


### `chat` JSON — internal shape

| Key | Contains |
|---|---|
| `messages[]` | id, role (user\|assistant), content, linked_question_id, linked_requirement_id, confidence_at_send, is_clarification, timestamp |
| `last_user_message_id` | id of most recent user message |
| `last_agent_message_id` | id of most recent assistant message |
| `turn_count` | total messages written so far |
| `summarized_up_to_turn` | watermark — how far summarizer_node has processed |

### `requirements` JSON — internal shape (array)

| Field | Description |
|---|---|
| `id` | REQ-001, REQ-002 ... |
| `question_id` | BUS-001, FUN-003 ... |
| `category` | business_requirements, functional_requirements ... |
| `question` | original question text |
| `answer` | user's answer text |
| `status` | completed \| skipped \| needs_clarification |
| `confidence` | LLM confidence score 0–100 |
| `is_validated` | true when status = completed |
| `needs_clarification` | true when escalated after 2 attempts |
| `clarification_count` | number of clarification rounds for this question |
| `source_ref` | id of the message that provided the answer |
| `created_at` / `updated_at` | timestamps |

### Column responsibilities

| Column | Type | Written by | Read by |
|---|---|---|---|
| `state` | JSON | `state_manager.save_state()` after every graph run | `state_manager.load_state()` before every run |
| `chat` | JSON | `state_manager.append_message()`, `advance_watermark()` | `state_manager.load_chat_window()` for summarizer |
| `requirements` | JSON | `state_manager.upsert_requirement()` on each accepted answer | `state_manager.load_requirements()` only when finalizer runs |
| `prd` | LONGTEXT | `state_manager.save_prd()` once at finalization | `GET /sessions/{id}/prd` endpoint |

---

## 2. Agent Flow (Flowchart)

Color legend: gray = planner/router, blue = flow controllers, purple = LLM nodes, teal = state writers, dark teal = requirement writers.

```mermaid
flowchart TD
    START([START]):::terminal --> PL

    PL["planner_node
    reads memory.summary for context"]:::planner
    PL --> SR

    SR{strategy_router_node}:::router

    SR -- predefined      --> QS
    SR -- clarification   --> CL
    SR -- skip            --> UR
    SR -- finalize        --> FN

    QS["question_selector_node
    reads JSON file"]:::flowctl
    CL["clarification_node
    LLM · reads answers{}"]:::llm

    QS --> ASK
    CL --> ASK

    ASK["ask_node
    sets agent_reply · waiting=true"]:::flowctl
    ASK --> WAIT

    WAIT["wait_node
    halts until user_message injected"]:::flowctl
    WAIT --> EV

    EV["evaluate_node
    LLM · writes evaluation{}"]:::llm
    EV --> DC

    DC{decision_node
    routing only}:::router

    DC -- "needs clarification
    count < threshold" --> CL
    DC -- "accepted or
    count >= threshold" --> UR

    UR["update_requirement_node
    writes req · advances index"]:::writer
    UR --> PR

    PR["progress_node
    writes progress + flags"]:::writer
    PR --> SUM

    SUM["summarizer_node
    LLM · writes memory{}"]:::llm
    SUM --> PL

    FN["finalizer_node
    LLM · writes sessions.prd"]:::llm
    FN --> END([END]):::terminal

    classDef terminal   fill:#4a4a4a,stroke:#888888,color:#ffffff,rx:20
    classDef planner    fill:#555555,stroke:#888888,color:#ffffff
    classDef router     fill:#444444,stroke:#666666,color:#cccccc
    classDef flowctl    fill:#1a6eb5,stroke:#3a8ed4,color:#ffffff
    classDef llm        fill:#5a3d9e,stroke:#7a5dbe,color:#ffffff
    classDef writer     fill:#0e6b50,stroke:#1d9e75,color:#ffffff
```

---

## 3. State Slice Flow (Flowchart)

Which nodes read/write which slices, and how runtime keys reach the service layer for DB writes.

```mermaid
flowchart LR
    subgraph ALWAYS["AgentState — always present"]
        FL[flow]
        FG[flags]
        EV[evaluation]
        PG[progress]
        PL[planning]
        ME[memory]
        AN[answers]
    end

    subgraph RUNTIME["Runtime keys — stripped before DB persist"]
        UM[user_message]
        AR[agent_reply]
        PR[pending_requirement]
        PP[pending_prd]
        CW[chat_window]
        FR[finalization_requirements]
        WA[pending_watermark_advance]
    end

    subgraph DB["sessions table"]
        DB_STATE[state\nJSON]
        DB_CHAT[chat\nJSON]
        DB_REQ[requirements\nJSON]
        DB_PRD[prd\nLONGTEXT]
    end

    planner_node       -->|reads|  ME
    planner_node       -->|reads|  FG
    planner_node       -->|reads|  EV
    planner_node       -->|reads|  PG
    planner_node       -->|writes| FL

    question_selector  -->|reads|  FL
    question_selector  -->|reads|  PL
    question_selector  -->|writes| FL

    clarification_node -->|reads|  EV
    clarification_node -->|reads|  AN
    clarification_node -->|writes| FL

    ask_node           -->|reads|  FL
    ask_node           -->|writes| FG
    ask_node           -->|writes| AR

    wait_node          -->|reads|  UM
    wait_node          -->|writes| FG

    evaluate_node      -->|reads|  UM
    evaluate_node      -->|reads|  AN
    evaluate_node      -->|writes| EV

    update_req_node    -->|reads|  UM
    update_req_node    -->|reads|  EV
    update_req_node    -->|reads|  FL
    update_req_node    -->|writes| AN
    update_req_node    -->|writes| FL
    update_req_node    -->|writes| FG
    update_req_node    -->|writes| PR

    progress_node      -->|reads|  AN
    progress_node      -->|reads|  PL
    progress_node      -->|writes| PG
    progress_node      -->|writes| FG

    summarizer_node    -->|reads|  CW
    summarizer_node    -->|reads|  ME
    summarizer_node    -->|writes| ME
    summarizer_node    -->|writes| WA

    finalizer_node     -->|reads|  FR
    finalizer_node     -->|reads|  AN
    finalizer_node     -->|reads|  ME
    finalizer_node     -->|writes| PP
    finalizer_node     -->|writes| FG

    service_layer      -->|save_state| DB_STATE
    service_layer      -->|append msgs via AR| DB_CHAT
    service_layer      -->|upsert via PR| DB_REQ
    service_layer      -->|save markdown via PP| DB_PRD
    service_layer      -->|advance watermark via WA| DB_CHAT
```

---

## 4. Sequence Diagram — Normal Question Cycle

One complete turn: user answers, agent evaluates, accepts, asks the next question.

```mermaid
sequenceDiagram
    participant FE  as Frontend (React)
    participant API as FastAPI
    participant CTL as Controller
    participant SVC as req_agent_service
    participant SM  as state_manager
    participant RUN as runner.py
    participant GRF as LangGraph Agent
    participant LLM as Gemini
    participant DB  as PostgreSQL

    FE  ->> API : POST /sessions/{id}/message { content }
    API ->> CTL : validate request schema
    CTL ->> SVC : process_message(session_id, content)

    SVC ->> SM  : load_state(session_id)
    SM  ->> DB  : SELECT state, chat FROM sessions WHERE id = ?
    DB  -->> SM : state JSON + chat JSON
    SM  -->> SVC: AgentState dict (no requirements)

    SVC ->> SM  : load_chat_window(session_id)
    SM  -->> SVC: messages after summarized_up_to_turn watermark

    SVC ->> RUN : run(state, user_message, chat_window)
    RUN ->> RUN : inject user_message + chat_window as runtime keys
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : planner_node
    GRF ->> GRF : strategy_router_node — select_predefined
    GRF ->> GRF : question_selector_node
    GRF ->> GRF : ask_node — sets agent_reply, waiting=true
    GRF ->> GRF : wait_node — user_message present, clears waiting
    GRF ->> LLM : evaluate_node
    LLM -->> GRF: { confidence: 85, is_complete: true, missing: [] }
    GRF ->> GRF : decision_node — accepted
    GRF ->> GRF : update_requirement_node — pending_requirement set
    GRF ->> GRF : progress_node
    GRF ->> GRF : summarizer_node — no-op
    GRF ->> GRF : planner_node — next cycle strategy
    GRF -->> RUN: final AgentState

    RUN -->> SVC: result

    SVC ->> SM  : append_message(user, content)
    SM  ->> DB  : UPDATE sessions SET chat = chat + user_msg

    SVC ->> SM  : append_message(assistant, agent_reply)
    SM  ->> DB  : UPDATE sessions SET chat = chat + agent_msg

    SVC ->> SM  : upsert_requirement(pending_requirement)
    SM  ->> DB  : UPDATE sessions SET requirements = updated_array

    SVC ->> SM  : save_state(stripped_state)
    SM  ->> DB  : UPDATE sessions SET state = new_state, updated_at = now()

    SVC -->> CTL: { agent_reply, state_snapshot }
    CTL -->> API: MessageResponse
    API -->> FE : 200 { agent_reply, progress, flags }
    FE  ->> FE  : render message + update progress bar
```

---

## 5. Sequence Diagram — Clarification Loop

User gives an incomplete answer. Agent generates a follow-up, then accepts on the second attempt.

```mermaid
sequenceDiagram
    participant FE  as Frontend (React)
    participant API as FastAPI
    participant SVC as req_agent_service
    participant RUN as runner.py
    participant GRF as LangGraph Agent
    participant LLM as Gemini
    participant DB  as PostgreSQL

    Note over FE,DB: Turn 1 — incomplete answer

    FE  ->> API : POST /sessions/{id}/message { content: "I want users to log in" }
    SVC ->> RUN : run(state, user_message)
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : wait_node — clears waiting
    GRF ->> LLM : evaluate_node
    LLM -->> GRF: { confidence: 40, is_complete: false, missing: ["auth method", "roles"] }
    GRF ->> GRF : evaluation — needs_clarification=true, count=1

    GRF ->> GRF : decision_node — needs_clarification (count 1 < threshold 2)
    GRF ->> LLM : clarification_node
    LLM -->> GRF: "Do different user roles use different login methods?"
    GRF ->> GRF : ask_node — agent_reply = clarification question, waiting=true
    GRF -->> RUN: state

    SVC ->> DB  : append user msg to sessions.chat
    SVC ->> DB  : append clarification Q to sessions.chat
    SVC ->> DB  : save_state — evaluation.clarification_count=1
    API -->> FE : { agent_reply: "Do different user roles use different login methods?" }

    Note over FE,DB: Turn 2 — complete answer

    FE  ->> API : POST /sessions/{id}/message { content: "Admin uses password, students use Google OAuth" }
    SVC ->> RUN : run(state, user_message)
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : wait_node — clears waiting
    GRF ->> LLM : evaluate_node
    LLM -->> GRF: { confidence: 88, is_complete: true, missing: [] }
    GRF ->> GRF : decision_node — accepted

    GRF ->> GRF : update_requirement_node — status=completed, confidence=88
    GRF ->> GRF : progress_node
    GRF ->> GRF : summarizer_node — no-op
    GRF ->> GRF : planner_node — select_predefined
    GRF -->> RUN: state

    SVC ->> DB  : append 2 messages to sessions.chat
    SVC ->> DB  : upsert requirement to sessions.requirements — status=completed
    SVC ->> DB  : save_state — clarification_count reset, question_index advanced
    API -->> FE : { agent_reply: "next question", progress: updated }
    FE  ->> FE  : render next question
```

---

## 6. Sequence Diagram — Session Creation & First Question

```mermaid
sequenceDiagram
    participant FE  as Frontend (React)
    participant API as FastAPI
    participant CTL as Controller
    participant SVC as session_service
    participant SM  as state_manager
    participant RUN as runner.py
    participant GRF as LangGraph Agent
    participant DB  as PostgreSQL

    FE  ->> API : POST /sessions { name: "My LMS Project" }
    API ->> CTL : validate
    CTL ->> SVC : create_session(name)
    SVC ->> SM  : build_initial_state(session_id)
    SM  -->> SVC: initial AgentState

    SVC ->> DB  : INSERT INTO sessions\n(id, name, state, chat, requirements, prd)\nVALUES (uuid, name, initial_state_json, empty_chat_json, [], null)
    DB  -->> SVC: created row

    SVC -->> FE : 201 { session_id }

    Note over FE: User clicks Start

    FE  ->> API : POST /sessions/{id}/message { content: "" }
    SVC ->> SM  : load_state(session_id)
    SM  ->> DB  : SELECT state FROM sessions WHERE id = ?
    DB  -->> SM : initial state JSON
    SVC ->> RUN : run(state, user_message="")
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : planner_node — strategy=select_predefined
    GRF ->> GRF : strategy_router_node — question_selector branch
    GRF ->> GRF : question_selector_node — picks BUS-001
    GRF ->> GRF : ask_node — agent_reply = "What problem are you trying to solve?"
    GRF ->> GRF : wait_node — no user_message, sets waiting=true, graph halts here

    GRF -->> RUN: state with agent_reply

    SVC ->> DB  : append assistant msg to sessions.chat
    SVC ->> DB  : save_state
    API -->> FE : { agent_reply: "What problem are you trying to solve?" }
    FE  ->> FE  : render first question
```

---

## 7. Sequence Diagram — PRD Finalization

```mermaid
sequenceDiagram
    participant FE  as Frontend (React)
    participant API as FastAPI
    participant SVC as req_agent_service
    participant SM  as state_manager
    participant RUN as runner.py
    participant GRF as LangGraph Agent
    participant LLM as Gemini
    participant DB  as PostgreSQL

    Note over FE,DB: All sections resolved — ready_for_prd=true set on previous run

    FE  ->> API : POST /sessions/{id}/message { content: "last answer" }
    SVC ->> SM  : load_state(session_id)
    SM  ->> DB  : SELECT state FROM sessions WHERE id = ?
    DB  -->> SM : state JSON — flags.ready_for_prd = true
    SM  -->> SVC: AgentState

    Note over SVC: Detects ready_for_prd=true — pre-loads requirements

    SVC ->> SM  : load_requirements(session_id)
    SM  ->> DB  : SELECT requirements FROM sessions WHERE id = ?
    DB  -->> SM : requirements JSON array
    SM  -->> SVC: requirements[]

    SVC ->> RUN : run(state, user_message, finalization_requirements=requirements[])
    RUN ->> RUN : inject finalization_requirements as runtime key
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : planner_node — strategy=finalize
    GRF ->> GRF : strategy_router_node — finalizer branch

    GRF ->> LLM : finalizer_node — generate PRD\nfrom requirements[] + answers + memory.summary
    LLM -->> GRF: full PRD markdown string

    GRF ->> GRF : finalizer_node — pending_prd=markdown, session_complete=true
    GRF -->> RUN: final state

    SVC ->> SM  : save_prd(session_id, pending_prd)
    SM  ->> DB  : UPDATE sessions SET prd = markdown_string, updated_at = now()

    SVC ->> SM  : save_state(stripped_state)
    SM  ->> DB  : UPDATE sessions SET state = final_state

    API -->> FE : { agent_reply: "Your PRD is ready!", session_complete: true }
    FE  ->> FE  : show PRD ready screen

    FE  ->> API : GET /sessions/{id}/prd
    API ->> DB  : SELECT prd FROM sessions WHERE id = ?
    DB  -->> API: prd LONGTEXT (markdown)
    API -->> FE : 200 { prd: "# Product Requirements\n..." }
    FE  ->> FE  : render markdown as document
```

---

## 8. Sequence Diagram — Skip Question

```mermaid
sequenceDiagram
    participant FE  as Frontend (React)
    participant API as FastAPI
    participant SVC as req_agent_service
    participant SM  as state_manager
    participant RUN as runner.py
    participant GRF as LangGraph Agent
    participant DB  as PostgreSQL

    FE  ->> API : POST /sessions/{id}/skip
    API ->> SVC : skip_question(session_id)

    SVC ->> SM  : load_state(session_id)
    SM  ->> DB  : SELECT state FROM sessions WHERE id = ?
    DB  -->> SM : state JSON
    SVC ->> SVC : set flags.skip_requested = true

    SVC ->> RUN : run(state, user_message=None)
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : planner_node — skip_requested=true — strategy=skip_question
    GRF ->> GRF : strategy_router_node — update_requirement branch

    GRF ->> GRF : update_requirement_node\nstatus=skipped\nappends to planning.skipped_ids\nadvances question_index\nskip_requested=false

    GRF ->> GRF : progress_node — skipped counted as resolved
    GRF ->> GRF : summarizer_node — no-op
    GRF ->> GRF : planner_node — strategy=select_predefined
    GRF ->> GRF : strategy_router_node — question_selector branch
    GRF ->> GRF : question_selector_node — next pending question
    GRF ->> GRF : ask_node — agent_reply = next question
    GRF -->> RUN: state

    SVC ->> SM  : upsert_requirement(skipped requirement)
    SM  ->> DB  : UPDATE sessions SET requirements = updated_array

    SVC ->> SM  : append_message(assistant, next question)
    SM  ->> DB  : UPDATE sessions SET chat = chat + next_question_msg

    SVC ->> SM  : save_state
    SM  ->> DB  : UPDATE sessions SET state = new_state

    API -->> FE : { agent_reply: "next question text" }
    FE  ->> FE  : render next question silently
```

---

## 9. Sequence Diagram — Summarizer Trigger (every N turns)

```mermaid
sequenceDiagram
    participant FE  as Frontend (React)
    participant API as FastAPI
    participant SVC as req_agent_service
    participant SM  as state_manager
    participant RUN as runner.py
    participant GRF as LangGraph Agent
    participant LLM as Gemini
    participant DB  as PostgreSQL

    Note over FE,DB: Turn 6 — summarizer threshold reached

    FE  ->> API : POST /sessions/{id}/message { content }
    SVC ->> SM  : load_state(session_id)
    SM  ->> DB  : SELECT state, chat FROM sessions WHERE id = ?
    DB  -->> SM : state JSON + chat JSON (turn_count=6, summarized_up_to_turn=0)

    SVC ->> SM  : load_chat_window(session_id)
    SM  -->> SVC: 6 messages after watermark

    SVC ->> RUN : run(state, user_message, chat_window=6 messages)
    RUN ->> RUN : inject chat_window runtime key
    RUN ->> GRF : graph.ainvoke(state)

    GRF ->> GRF : ...evaluate, decision, update_requirement, progress...

    GRF ->> GRF : summarizer_node — chat_window.len >= 6, fires
    GRF ->> LLM : compress existing summary + 6 new messages
    LLM -->> GRF: { updated_summary: "User builds LMS...", key_decisions: [...] }

    GRF ->> GRF : summarizer_node writes\nmemory.conversation_summary\nmemory.key_decisions\nmemory.last_n_messages (last 4)\npending_watermark_advance = 6

    GRF ->> GRF : planner_node — reads fresh memory.summary
    GRF -->> RUN: final state

    SVC ->> SM  : append_message (user + assistant)
    SM  ->> DB  : UPDATE sessions SET chat = chat + 2 msgs

    SVC ->> SM  : advance_watermark(session_id, turn_count=6)
    SM  ->> DB  : UPDATE sessions SET chat->summarized_up_to_turn = 6

    SVC ->> SM  : save_state — memory updated
    SM  ->> DB  : UPDATE sessions SET state = new_state

    API -->> FE : { agent_reply, progress }
```