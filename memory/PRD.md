# TSS Image Fraud Detector - PRD

## Original Problem Statement
Build a React web app for Lenovo Premier Support teams to detect AI-generated/altered customer images. Phase 1 of MSD integration. Features: AI Forensic Analysis (Claude), ELA Heatmap (client-side), Fraud Risk Score (0-100), Agent Notes, Copy Report, MSD Integration Roadmap.

## Architecture
- **Backend**: FastAPI (Python) with `/api/analyze` endpoint using emergentintegrations library for Claude Sonnet 4-6
- **Frontend**: React with pure inline styles (no Tailwind/Shadcn/MUI per requirement)
- **Database**: MongoDB for audit trail storage
- **Design**: Dark theme (#1a1a1a), Lenovo red (#e2231a), Segoe UI, card-based layout

## User Personas
- TSS Agents: Upload and analyze customer-submitted images for fraud
- TAMs: Review escalated cases with high fraud risk scores

## Core Requirements
- Image upload (drag & drop, JPG/PNG/WEBP)
- AI Forensic Analysis via Claude (8 forensic indicators)
- ELA Heatmap (client-side Canvas API)
- Fraud Risk Score 0-100 with color-coded tiers
- Agent Notes, Copy-to-clipboard report, Analysis timestamp
- MSD Integration Roadmap panel

## What's Been Implemented (Feb 2026)
- [x] Full backend with Claude integration via emergentintegrations
- [x] Frontend with all specified components and inline styles
- [x] Upload card → two-column results layout transition
- [x] AI Analysis tab with verdict, score, indicators, recommendation
- [x] ELA Heatmap tab with sensitivity slider and thermal color mapping
- [x] Agent Notes, Copy Report, Clear, Case ID generation
- [x] MSD Integration Roadmap (4 phases)
- [x] Footer with Lenovo branding

## P0/P1/P2 Features Remaining
- P0: None (MVP complete)
- P1: Chrome Extension (Phase 2), Batch image analysis
- P2: Backend API Hook (Phase 3), Full MSD Integration (Phase 4), TAM Dashboard

## Next Tasks
- Increase Universal Key balance for production Claude usage
- Add image history/audit log viewer
- Implement batch analysis for multiple images
