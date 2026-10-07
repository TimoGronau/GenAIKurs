# Definition of Done

This Definition of Done (DoD) describes the minimum quality expected for each
implementation in the recipe app. A change is done when the applicable checklist
items below are satisfied and its acceptance criteria pass.

## Checklist

- [ ] **Acceptance criteria:** All acceptance criteria for the user story are implemented and verified. Any agreed deviations are recorded.
- [ ] **Architecture:** The implementation follows [`architecture.md`](architecture.md), including the separation between the Vue frontend, FastAPI backend, business logic, and JSON storage.
- [ ] **Code style:** The implementation follows `code_style.md`. Until that guide exists, follow the established conventions in the files being changed and avoid unrelated formatting changes.
- [ ] **Readability:** Names and control flow are clear; complex decisions are explained briefly where needed.
- [ ] **Maintainability:** Responsibilities are kept focused, existing abstractions are reused, and the change avoids unnecessary duplication or unrelated complexity.
- [ ] **Tests:** Tests cover the changed behavior and important edge cases in proportion to the change's risk. All relevant tests pass.
- [ ] **Build and checks:** The frontend production build succeeds, and relevant backend checks or startup checks succeed.
- [ ] **Error and empty states:** Expected loading, empty, invalid-input, and failure states are handled where relevant, with understandable feedback.
- [ ] **Accessibility and usability:** Interactive controls have meaningful labels, can be operated with a keyboard, and present clear feedback. Layout remains usable at supported viewport sizes.
- [ ] **Security and data:** Inputs are validated at the appropriate boundary; secrets are not committed; data changes preserve valid JSON and do not expose unintended data.
- [ ] **Documentation:** User-facing behavior, API contracts, setup instructions, or architectural decisions are updated when the change makes existing documentation inaccurate.
- [ ] **Dependencies:** New dependencies are necessary, documented in the appropriate manifest, and install successfully.

## Applying the checklist

Not every item applies to every change. Mark an item as not applicable when the
change genuinely does not touch that concern. For example, a backend-only change
may not affect responsive layout; a documentation-only change may not require a
frontend build. Do not skip acceptance criteria or relevant tests.

For this learning project, the goal is consistent, explainable quality rather
than a fixed test-coverage percentage. Prefer a focused test that demonstrates
the expected behavior over a coverage number without meaningful assertions.