# Design Decisions

## ADR-001: React Native bare workflow

**Status:** Accepted

Shift Feel uses React Native's bare workflow and TypeScript. The project needs direct native integration for low-latency audio, while the interaction and simulation layers benefit from cross-platform TypeScript and automated testing.

## ADR-002: Deterministic simulation core

**Status:** Accepted

Vehicle behaviour is implemented as a deterministic TypeScript state model rather than being owned by a game engine or an audio tool. This keeps shift logic testable, makes tuning changes reviewable, and allows the UI and native audio layers to remain replaceable.

## ADR-003: Optional FMOD integration

**Status:** Accepted with external dependency constraints

The project provides a thin optional native FMOD bridge for RPM-driven engine audio. FMOD is not open source, so its SDK and example assets are excluded from the repository. The app must continue to run without FMOD installed locally. Contributors and distributors are responsible for obtaining FMOD separately and following its current terms.

## ADR-004: No unlicensed vehicle branding or audio assets

**Status:** Accepted

The project does not include real vehicle manufacturer names, logos, or unlicensed audio assets. New media must have clear redistribution rights before it is accepted.
