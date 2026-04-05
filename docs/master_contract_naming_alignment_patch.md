# MASTER CONTRACT — Naming Alignment Patch
**Target:** `BLOG_GAGA_ISH_MASTER_CONTRACT.md`  
**Status:** Proposed binding patch  
**Purpose:** Resolve authority conflict with `GG-NAMING.md` and make GAGA-ish naming a master-level non-negotiable.

---

## 1. Replace Section 0.1 Authority

### 0.1 Authority
This document is the **supreme operational contract** for BLOG GAGA-ish.

All implementation, review, release, and AI-agent work must follow this document.
No separate naming law, no parallel brief, no undocumented “common sense,” and no feature-level exception may override this contract unless this contract itself is revised.

`GG-NAMING.md` is the **binding naming law under this contract**.
It governs the naming of internal selectors, hooks, families, registries, ledgers, manifests, SSOT identifiers, tokens, events, storage keys, and naming-related migration rules.

If a lower document conflicts with this contract, this contract wins.
If naming-related work is not explicitly governed here, `GG-NAMING.md` governs by default.

---

## 2. Add to Section 0.2 Scope

Add these bullets under the scope list:

- naming law and internal contract language governance
- selector, hook, family, registry, ledger, and manifest naming discipline
- deprecation and migration control for legacy internal naming

---

## 3. Add New Section 0.6 Naming Authority Model

### 0.6 Naming authority model
The project uses **one internal naming language**.

Rules:
1. Internal system contracts must use GAGA-ish naming.
2. Parallel naming dialects are forbidden.
3. A GG-prefixed name is still invalid if its meaning is dishonest or its ownership is unclear.
4. Legacy names may survive only as documented migration bridges with explicit removal intent.

This naming authority applies across:
- XML hooks and template IDs
- CSS family names and selectors
- JS modules and internal hooks
- event names and storage keys
- registries, ledgers, manifests, and SSOT-side identifiers

---

## 4. Add to Section 1.3 Non-negotiables

Add these new non-negotiables after the current list:

8. **One internal language, not parallel dialects**  
   Hooks, selectors, family names, registries, ledgers, and manifests must use one GAGA-ish naming system.

9. **Semantic honesty over compatibility theater**  
   A name may not lie about what a control, family, or system actually does.

10. **Legacy is debt, not a second architecture**  
   Deprecated names may survive only as migration bridges and may not remain the silent active law.

---

## 5. Add New Section 6.10 Internal Contract Naming Law

### 6.10 Internal contract naming law
All internal machine-facing contracts must follow the project’s GAGA-ish naming law.

This includes:
- component family names
- primitive family names
- selectors and hooks
- template IDs
- tokens
- events
- storage keys
- registries
- ledgers
- manifests
- internal SSOT identifiers

Human-readable prose may use short descriptive language where appropriate, but official internal contracts must remain GAGA-ish and auditable.

---

## 6. Add New Section 6.11 No Parallel Naming Dialects

### 6.11 No parallel naming dialects
The following pattern is forbidden:
- generic component family names in docs
- GG-prefixed selectors in code
- legacy family names in XML
- adapter aliases in JS that quietly become permanent

The system must converge toward one language, not maintain a permanent translation layer.

---

## 7. Add New Section 6.12 Semantic Honesty Rule

### 6.12 Semantic honesty rule
A contract name must describe the real role of the thing it names.

Examples of invalid naming:
- a support action named as `like`
- a detail metadata system named as `editorial-preview`
- a deprecated family name that remains active architecture under a new wrapper

A GG prefix does not rescue a dishonest name.

---

## 8. Add to Section 10 or equivalent governance/testing area

Add the following rule wherever the contract discusses testing, readiness gates, or release control:

### Naming drift gate
A release fails if it introduces or preserves:
- a parallel naming dialect
- a dishonest internal action/family name
- undocumented legacy selector aliases
- selector, registry, or manifest identifiers that drift from GAGA-ish naming law

---

## 9. Add New Section near AI-agent execution rules

### AI naming compliance rule
AI agents may not invent a new naming dialect, preserve misleading semantics for convenience, or treat legacy aliases as permanent architecture.

AI agents must:
- follow `GG-NAMING.md`
- keep naming auditable across XML, CSS, JS, and docs
- document migration bridges clearly
- prefer semantic honesty over shallow backward-compatibility theater

---

## 10. Acceptance note

This patch is considered complete only if, after adoption:
- `BLOG_GAGA_ISH_MASTER_CONTRACT.md` is unambiguously supreme
- `GG-NAMING.md` is clearly binding under the master contract
- GAGA-ish naming becomes a master-level rule, not a local implementation preference
- future CSS and XML rules can inherit naming law without inventing separate dialects

