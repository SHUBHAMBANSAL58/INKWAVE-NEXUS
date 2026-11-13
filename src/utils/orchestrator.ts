import { AgentTask, AgentType, TaskStatus } from '../types';

export const MAX_TESTER_RETRIES = 2;

export interface TransitionResult {
  nextStatus: TaskStatus;
  nextAgent: AgentType;
  requiresApproval: boolean;
  logAction: string;
  logDetails: string;
}

/**
 * Validates whether a state transition is legal in the NEXUS CORE orchestration workflow.
 */
export function isValidTransition(current: TaskStatus, next: TaskStatus): boolean {
  const allowedMap: Record<TaskStatus, TaskStatus[]> = {
    pending: ['planning', 'cancelled'],
    planning: ['designing', 'ready_for_implementation', 'failed', 'cancelled'],
    designing: ['ready_for_implementation', 'building', 'failed', 'cancelled'],
    ready_for_implementation: ['building', 'cancelled'],
    building: ['testing', 'failed', 'cancelled'],
    testing: ['awaiting_approval', 'building', 'failed', 'completed'],
    awaiting_approval: ['completed', 'building', 'planning', 'failed', 'cancelled'],
    failed: ['pending', 'planning'],
    completed: [],
    cancelled: [],
  };

  return allowedMap[current]?.includes(next) ?? false;
}

/**
 * Calculates the next step in the multi-agent pipeline based on the current task and agent completion.
 */
export function processAgentHandoff(task: AgentTask, testPassed: boolean = true): TransitionResult {
  switch (task.status) {
    case 'pending':
      return {
        nextStatus: 'planning',
        nextAgent: 'planner',
        requiresApproval: false,
        logAction: 'PLANNER_ACTIVATED',
        logDetails: 'NEXUS CORE delegated user objective to PLANNER agent for architectural scoping.',
      };

    case 'planning':
      return {
        nextStatus: 'designing',
        nextAgent: 'designer',
        requiresApproval: false,
        logAction: 'PLANNER_TO_DESIGNER_HANDOFF',
        logDetails: 'PLANNER generated implementation roadmap. Handed off to DESIGNER for visual & UI/UX tokens.',
      };

    case 'designing':
      return {
        nextStatus: 'building',
        nextAgent: 'builder',
        requiresApproval: false,
        logAction: 'DESIGNER_TO_BUILDER_HANDOFF',
        logDetails: 'DESIGNER defined layout and typography specifications. Handed off to BUILDER for engineering implementation.',
      };

    case 'ready_for_implementation':
      return {
        nextStatus: 'building',
        nextAgent: 'builder',
        requiresApproval: false,
        logAction: 'BUILDER_ACTIVATED',
        logDetails: 'Task approved for implementation. BUILDER executing code modules and API integration.',
      };

    case 'building':
      return {
        nextStatus: 'testing',
        nextAgent: 'tester',
        requiresApproval: false,
        logAction: 'BUILDER_TO_TESTER_HANDOFF',
        logDetails: 'BUILDER completed code execution. Handed off to TESTER for automated verification & assertions.',
      };

    case 'testing':
      if (testPassed) {
        return {
          nextStatus: 'awaiting_approval',
          nextAgent: 'tester',
          requiresApproval: true,
          logAction: 'TESTER_PASSED_APPROVAL_REQUEST',
          logDetails: 'All automated quality and accessibility tests passed. Submitting to human creator for review.',
        };
      } else {
        const nextRetry = task.retryCount + 1;
        if (nextRetry > MAX_TESTER_RETRIES) {
          return {
            nextStatus: 'failed',
            nextAgent: 'tester',
            requiresApproval: false,
            logAction: 'ORCHESTRATION_CIRCUIT_BREAKER',
            logDetails: `Automated test suite failed ${nextRetry} times. Circuit breaker activated to prevent infinite loop.`,
          };
        }
        return {
          nextStatus: 'building',
          nextAgent: 'builder',
          requiresApproval: false,
          logAction: 'TESTER_REJECTION_REFEED',
          logDetails: `Defects detected by TESTER. Feeding back to BUILDER for defect resolution (Attempt ${nextRetry}/${MAX_TESTER_RETRIES}).`,
        };
      }

    default:
      return {
        nextStatus: task.status,
        nextAgent: task.activeAgent,
        requiresApproval: false,
        logAction: 'NOOP',
        logDetails: `No transition mapped for status: ${task.status}`,
      };
  }
}

/**
 * Validates that an agent task meets all structural and security constraints before submission.
 */
export function validateTaskInput(title: string, prompt: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length < 3) {
    return { valid: false, error: 'Task title must be at least 3 characters long.' };
  }
  if (!prompt || prompt.trim().length < 10) {
    return { valid: false, error: 'Task prompt must contain at least 10 characters detailing the objective.' };
  }
  return { valid: true };
}
