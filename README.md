# VoiceShield 🛡️
### AI-powered detection of synthetic voices during live calls

VoiceShield is a proposed AI-powered voice-authenticity system designed to help people identify suspicious AI-generated or cloned speech during live VoIP calls. Instead of relying only on a caller's phone number or reputation, VoiceShield analyzes the audio signal itself in short chunks and estimates whether the speech is genuine or synthetic.


**Prototype:** [https://voice-shield-chi.vercel.app/](https://voice-shield-chi.vercel.app/)

---

## Table of Contents
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [How It Works](#how-it-works)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Workflow](#system-workflow)
- [Target Users](#target-users)
- [What Makes VoiceShield Different](#what-makes-voiceshield-different)
- [Future Scope](#future-scope)
- [Team](#team)
- [Acknowledgements](#acknowledgements)

## The Problem

AI voice-cloning and real-time voice-changing tools can make fraudulent calls sound like they come from a trusted family member, bank officer, or company executive. These scams can persuade victims to share sensitive information or transfer money.

Traditional caller-ID applications mainly assess phone numbers. A scammer using a clean or unfamiliar number may therefore avoid number-reputation warnings, while the synthetic voice itself goes unchecked.

The impact can be especially serious for senior citizens and people who are less familiar with AI-generated audio. Families, bank customers, corporate employees, banks, and call centres may also be affected.

## Our Solution

VoiceShield aims to analyze live call audio in short chunks and estimate whether the speech is genuine or AI-generated.

A tiered, risk-based decision engine is proposed to respond according to the detected risk:

1. **Low risk — Continue:** Leave the call uninterrupted.
2. **Elevated risk — Warn:** Show a warning to make the user cautious.
3. **Sustained high risk — Disconnect:** Disconnect the call after the high-risk condition persists.
4. **After a suspicious call — Report:** Offer a one-tap cybercrime reporting workflow.

The purpose is to give users an opportunity to recognize suspicious voice activity before acting on a fraudulent request.

## How It Works

The proposed workflow is:

1. A user participates in a supported live VoIP call.
2. Call audio is processed in short chunks.
3. Audio-processing components prepare the chunks for analysis.
4. An AI/ML model estimates the likelihood that the speech is synthetic.
5. The risk-based decision engine evaluates the result.
6. VoiceShield continues the call, warns the user, or disconnects after sustained high risk.
7. The user can access a one-tap cybercrime reporting option.

*The presentation does not specify the model architecture, classification threshold, chunk duration, or reporting-service integration. These details should be documented when they are finalized.*

## Key Features

### 1. Live voice-authenticity analysis
Analyzes call audio in short chunks to estimate whether speech is genuine or synthetic.

### 2. Risk-based user protection
Uses a tiered response so that the call can continue, a warning can be displayed, or a call can be disconnected after sustained high risk.

### 3. One-tap cybercrime reporting
Provides a reporting workflow after a suspicious call, helping users take action rather than simply receiving an alert.

## Technology Stack

The HackFest presentation identifies the following technologies and options:

| Area | Technologies listed |
|---|---|
| AI / Machine Learning | Python, PyTorch |
| Audio Processing | Librosa, torchaudio |
| Backend | FastAPI |
| Model Deployment / Optimization | ONNX or TensorFlow Lite (TFLite) |
| Application | Flutter or React |
| Calling / Audio Transport | WebRTC or a Telephony API |
| Database | PostgreSQL or Firebase |

**Implementation note:** The presentation lists alternatives (for example, Flutter / React and PostgreSQL / Firebase), but does not identify the final selected option for each layer. Replace these alternatives with the exact technologies used in the working prototype.

## System Workflow

```text
Live VoIP Call
      |
      v
Audio Capture in Short Chunks
      |
      v
Audio Processing
      |
      v
AI/ML Voice Authenticity Analysis
      |
      v
Risk-Based Decision Engine
      |
      +-------------------+----------------------+
      |                   |                      |
      v                   v                      v
  Low Risk           Elevated Risk        Sustained High Risk
      |                   |                      |
      v                   v                      v
Continue Call        Warn the User          Disconnect Call
                                                  |
                                                  v
                                      One-Tap Cybercrime Report
```

This is a conceptual workflow based on the proposed solution, not a verified implementation diagram.

## Target Users

- **Senior citizens and non-technical users:** People who may trust a familiar-sounding voice.
- **Families and bank customers:** People who may be targeted by impersonation and financial scams.
- **Corporate employees:** Potential targets of executive or CEO-impersonation fraud.
- **Banks and call centres:** Potential enterprise users in a future version.

## What Makes VoiceShield Different?

VoiceShield focuses on the authenticity of the voice signal, not only the reputation of the caller's phone number. Its proposed combination of audio analysis, risk-based warnings, call intervention, and a reporting workflow is intended to provide a more direct response to synthetic-voice impersonation.

## Future Scope

The presentation identifies banks and call centres as possible enterprise users in a later version. Other implementation work that follows from the proposed design includes:

- Finalizing and evaluating the synthetic-speech detection model.
- Integrating audio analysis with a supported live VoIP calling flow.
- Calibrating risk thresholds to reduce false alarms and missed detections.
- Implementing and validating the warning and sustained-high-risk call-disconnection flow.
- Connecting the reporting workflow to the appropriate cybercrime reporting process.
- Evaluating privacy, consent, security, latency, and performance under real-world call conditions.


## Team

**VoiceShield Team — HackFest 2026, Season 1**

- Kritika P
- Purnima Rout
- Sai Sanjana S

**Track:** AI  
**Project:** VoiceShield

