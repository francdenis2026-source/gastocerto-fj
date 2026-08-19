---
name: impeccable
description: Design guidance and quality-control workflow for AI coding agents. Use to shape, critique, audit, polish, harden, adapt, optimize, typeset, animate and improve frontend experiences.
metadata:
  upstream: https://github.com/pbakaus/impeccable
---

# Impeccable

Use an explicit design-quality pass whenever creating or modifying Gasto Certo UI.

## Workflow

1. Shape: define UX intent and information hierarchy before coding.
2. Craft: implement with the existing product language and reusable components.
3. Critique: inspect clarity, hierarchy, consistency and emotional tone.
4. Audit: check accessibility, responsiveness, overflow, loading/error states and performance.
5. Polish: remove visual noise, inconsistent spacing and accidental styling.
6. Harden: cover edge cases, long text, empty data, errors and small screens.

## Anti-patterns

Avoid excessive cards, cards nested in cards, default-looking typography, arbitrary gradients, gray text with weak contrast, decorative icon tiles everywhere, and motion without a functional purpose.

## Gasto Certo quality bar

Financial data must remain readable and trustworthy. Balance, spending, budgets, due dates and alerts need strong semantic hierarchy. Visual delight must never obscure amounts, categories, dates or primary actions.

## Upstream reference

Source: `pbakaus/impeccable`. The upstream project provides the full CLI, commands, detector rules and live-browser tooling. When those executables are available, use `npx impeccable install` and initialize its project context as documented upstream. This project-level skill provides the compatible agent instructions in-repository.
