# KrishiMitra workflow diagram research notes

**Audience:** Hackathon presentation reviewers  
**Date:** 2 September 2026  
**Scope:** A faithful, high-level representation of the implemented KrishiMitra farmer-to-buyer marketplace journey. This is a solution-workflow diagram, not a claim that every stage is fully automated or production-grade.

## Recommended story

KrishiMitra gives both parties a structured path into one transparent marketplace: a farmer lists a lot and can record a quality assessment; a buyer publishes a requirement. A rules-based matching engine compares crop, quality, quantity and location. The buyer can issue an offer, the farmer accepts or rejects it, and an accepted offer creates a transaction record. Market intelligence supports the farmer's decision rather than replacing it.

## Verified product flow

1. Farmer creates a lot with crop, quantity and location.
2. Farmer may upload photos for the prototype quality assessment; its resulting grade updates matching eligibility.
3. Farmer can view market intelligence before deciding how to sell.
4. Buyer creates and publishes a requirement with crop, quality, quantity, delivery and payment information.
5. The matching service normalizes crops and evaluates crop, grade, quantity and location. It records full or partial eligible matches.
6. Buyer reviews matching lots and submits a digital offer.
7. Farmer accepts or rejects the offer.
8. Acceptance marks the demand fulfilled, moves the lot to an active transaction state, and creates a transaction record.

## Diagram design rationale

- Use **two entry lanes** (Farmer and Buyer) because the platform has two independent actors.
- Make **Matching Engine** the visual centre: it represents the core technical value rather than a generic marketplace listing.
- Use a **shared lower trust layer** to communicate identity, transparent pricing and records without repeating it in every box.
- Put a small feedback arrow from transaction outcome back to market intelligence to indicate future learning/analytics, clearly labelled as an outcome-data loop rather than a current predictive model.

## External grounding

e-NAM describes the appropriate problem framing: transparent price discovery based on quality, buyer access, real-time market information and timely online payment. KrishiMitra's diagram should therefore foreground quality, matching and traceability—not claim guaranteed pricing or automatic payment.

- [e-NAM overview, Small Farmers' Agribusiness Consortium / Ministry of Agriculture & Farmers Welfare](https://enam.gov.in/) — transparent, quality-based price discovery and timely online payment.
- [Revised e-NAM Operational Guidelines, Ministry of Agriculture & Farmers Welfare](https://www.enam.gov.in/web/assest/download/Revised-Operational-Guidelines-of-e-NAM.pdf) — competition, quality testing and digital agricultural supply-chain integration.
- [e-NAM Farmers information](https://enam.gov.in/web/stakeholders-Involved/farmers) — real-time market information, quality-linked price and traceable lot progress.

## Limitations to state if questioned

- The quality assessment in the current build is explicitly a reference-image prototype, not a trained ML quality model.
- The outcome-data feedback arrow is a presentation-level roadmap/analytics loop, not a deployed learning model.
- The product records a transaction after acceptance; do not call it an integrated bank-settlement mechanism unless that capability is added and verified.
