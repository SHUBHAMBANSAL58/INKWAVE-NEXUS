import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  INITIAL_TASK_BLUEPRINTS,
  instantiateBlueprint,
  createBlueprintFromTasks,
  validateBlueprintInput,
} from './taskBlueprints';
import { AgentTask, TaskBlueprint } from '../types';

describe('TaskBlueprints', () => {
  it('loads valid initial curated blueprints with tasks and dependencies', () => {
    assert.ok(INITIAL_TASK_BLUEPRINTS.length >= 4);
    const fullstack = INITIAL_TASK_BLUEPRINTS.find((b) => b.id === 'blueprint-fullstack-mesh');
    assert.ok(fullstack);
    assert.strictEqual(fullstack.tasks.length, 4);
    // Task 2 (index 1) should be blocked by task 1 (index 0)
    assert.deepStrictEqual(fullstack.tasks[1].blockedByIndices, [0]);
  });

  it('validates blueprint input parameters properly', () => {
    const invalidName = validateBlueprintInput('ab', 'Description long enough', [
      { title: 'T1', prompt: 'P1', priority: 'medium', category: 'work' },
    ]);
    assert.strictEqual(invalidName.valid, false);

    const emptyTasks = validateBlueprintInput('Valid Name', 'Valid Description', []);
    assert.strictEqual(emptyTasks.valid, false);

    const missingTitle = validateBlueprintInput('Valid Name', 'Valid Description', [
      { title: '', prompt: 'Prompt', priority: 'medium', category: 'work' },
    ]);
    assert.strictEqual(missingTitle.valid, false);

    const valid = validateBlueprintInput('Production Pipeline', 'Standard staging and prod workflow', [
      { title: 'Task 1', prompt: 'Prompt 1', priority: 'high', category: 'engineering' },
    ]);
    assert.strictEqual(valid.valid, true);
  });

  it('instantiates blueprint tasks with correctly mapped blockedByTaskIds', () => {
    const sampleBlueprint: TaskBlueprint = {
      id: 'test-bp',
      name: 'Test Workflow',
      description: 'A 3-step test workflow',
      category: 'engineering',
      createdAt: '2026-11-11T00:00:00.000Z',
      tasks: [
        {
          title: 'Step 1: Planning',
          prompt: 'Formulate plan',
          priority: 'high',
          category: 'engineering',
        },
        {
          title: 'Step 2: Execution',
          prompt: 'Execute plan',
          priority: 'medium',
          category: 'engineering',
          blockedByIndices: [0], // Blocked by Step 1
        },
        {
          title: 'Step 3: Verification',
          prompt: 'Verify plan',
          priority: 'high',
          category: 'engineering',
          blockedByIndices: [0, 1], // Blocked by Steps 1 & 2
        },
      ],
    };

    const instantiated = instantiateBlueprint(sampleBlueprint, 'user-123');
    assert.strictEqual(instantiated.length, 3);

    // Verify task IDs exist and are unique
    const idSet = new Set(instantiated.map((t) => t.id));
    assert.strictEqual(idSet.size, 3);

    // Step 1 has no blockers
    assert.deepStrictEqual(instantiated[0].blockedByTaskIds, []);

    // Step 2 blocked by Step 1 ID
    assert.deepStrictEqual(instantiated[1].blockedByTaskIds, [instantiated[0].id]);

    // Step 3 blocked by Step 1 & Step 2 IDs
    assert.deepStrictEqual(instantiated[2].blockedByTaskIds, [instantiated[0].id, instantiated[1].id]);

    // Verify logs include blueprint info
    assert.ok(instantiated[0].logs[0].details.includes('Test Workflow'));
  });

  it('creates a custom blueprint from an existing list of tasks preserving dependency indices', () => {
    const mockTasks: AgentTask[] = [
      {
        id: 't-100',
        title: 'Task Alpha',
        prompt: 'First prompt',
        status: 'pending',
        priority: 'high',
        category: 'work',
        activeAgent: 'planner',
        creatorId: 'user-1',
        createdAt: '2026-11-11T00:00:00.000Z',
        updatedAt: '2026-11-11T00:00:00.000Z',
        retryCount: 0,
        approvalRequired: true,
        logs: [],
      },
      {
        id: 't-200',
        title: 'Task Beta',
        prompt: 'Second prompt',
        status: 'pending',
        priority: 'medium',
        category: 'creative',
        blockedByTaskIds: ['t-100'], // Depends on Task Alpha (index 0)
        activeAgent: 'designer',
        creatorId: 'user-1',
        createdAt: '2026-11-11T00:00:00.000Z',
        updatedAt: '2026-11-11T00:00:00.000Z',
        retryCount: 0,
        approvalRequired: true,
        logs: [],
      },
    ];

    const blueprint = createBlueprintFromTasks(
      'Custom Design Sprint',
      'Extracted from running tasks',
      'creative',
      mockTasks,
      'Elena Rostova',
      'user-elena'
    );

    assert.strictEqual(blueprint.name, 'Custom Design Sprint');
    assert.strictEqual(blueprint.isCustom, true);
    assert.strictEqual(blueprint.tasks.length, 2);
    assert.strictEqual(blueprint.tasks[0].title, 'Task Alpha');
    assert.strictEqual(blueprint.tasks[1].title, 'Task Beta');
    assert.deepStrictEqual(blueprint.tasks[1].blockedByIndices, [0]);
  });
});
