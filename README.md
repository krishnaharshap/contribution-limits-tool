# Contribution Limits Tool-Registered Accounts-TFSA | FHSA | RRSP

A simple web-based tool to track and calculate remaining contribution room for **TFSA**, **FHSA**, and **RRSP**, across multiple years.  
Built for users 18 + with valid legal contribution rooms.  
Includes a UI layer and a full UI-test automation framework using Playwright + Jest.

---

## Highlights

- Unified single-screen UI with tabs/links for TFSA, FHSA, and RRSP  
- Input validation: age (18+), contribution limits, cross-year accumulation  
- Data persistence via local browser storage (MVP)  
- Clean automation framework: Playwright + Jest  
- Hosted using free frontend option (e.g., GitHub Pages)  

---

## Table of Contents

- [Motivation](#motivation)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running the app](#running-the-app)  
- [Usage](#usage)  
- [Test Automation](#test-automation)  
- [Architecture Overview](#architecture-overview)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Motivation

Many Canadians track contribution limits for TFSA, FHSA and RRSP manually or via spreadsheets.  
This tool provides a lightweight UI to simplify the calculation of remaining room across years and enforce age eligibility and limit rules.

---

## Features

- Age verification (18+)  
- Separate tabs/screen views for TFSA, FHSA, RRSP  
- Inputs for past contributions and annual limits  
- Displays remaining room and summary table per account type  
- Validation for over-contribution, under-age, invalid inputs  
- Data persistence via local storage (MVP)  
- Automated UI tests covering flows, inputs, persistence  

---

## Tech Stack

- Frontend: HTML5, CSS3, vanilla JavaScript  
- Test Framework: Playwright + Jest  
- Hosting: GitHub Pages (or equivalent free static host)  
- Data Persistence (MVP): Browser `localStorage`, later optional free backend  

---

## Getting Started

### Prerequisites

- Node.js (≥ 14.x)  
- npm (or yarn)  
- Git  
- VS Code (or your preferred editor)  
- Browser (Chrome/Edge/Firefox)  

### Installation

```bash
git clone https://github.com/<YOUR_USERNAME>/contribution-limits-tool.git
cd contribution-limits-tool
