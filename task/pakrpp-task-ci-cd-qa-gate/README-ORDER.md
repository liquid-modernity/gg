# PakRPP QA / CI-CD Gate Task

This package adds the sixth task requested for keeping QA, tools, and GitHub Actions green after the Store isolation, Discovery, Shell, and Theme tasks.

Recommended order:

0. Commit current green baseline.
1. TASK-STORE-ISOLATION-001
2. TASK-DISCOVERY-002
3. TASK-DISCOVERY-003
4. TASK-THEME-001
5. TASK-SHELL-001
6. TASK-CI-CD-001

Important:
Run the local QA chain after every task, but run TASK-CI-CD-001 as the final hardening pass after the feature/design tasks have changed the contracts.
