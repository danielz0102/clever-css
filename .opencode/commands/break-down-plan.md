---
description: "Break down a plan into multiple tasks"
agent: build
---

Take a plan and break it down into multiple tasks. Each task should have:

- A title
- What other tasks it depends on (if any)
- Detailed description of what needs to be done, including what files should be updated or created. Also specify the contracts of classes or functions created (if any).
- Relevant unit test or integration test cases that verify the functionality of the task, if applicable.

Also include a Acceptance Criteria section that has a checklist with:

- All tasks completed
- All tests passing (`npm run test`)
- Linter passing (`npm run lint`)
- Type checks passing (`npm run check-types`)

Check existing examples in @plans

The plan is the following:

$ARGUMENTS
