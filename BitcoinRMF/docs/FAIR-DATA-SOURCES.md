# FAIR Data Sources & Empirical Basis

This document details the empirical basis, data sources, and assumptions behind every FAIR estimate in the Bitcoin Risk Management Framework. Scores are calibrated against real-world data where available and clearly document assumptions where empirical data is limited.

## General Methodology

- **Threat Event Frequency (TEF)**: Derived from historical incident frequency, academic research, and expert consensus. Where no direct incidents exist, we use analogous attack frequencies from comparable systems.
- **Vulnerability (V)**: Based on protocol analysis, known defenses, and attack feasibility studies. Considers current state of technology and deployed mitigations.
- **Loss Estimates**: Primary losses use direct financial exposure (funds at risk). Secondary losses factor in market capitalization impact using historical market reactions to similar events.

---

## Threat-Level FAIR Sources

### 1. Quantum Computing Breaks ECDSA
| Factor | Value | Source |
|--------|-------|--------|
| TEF | 0.02/yr | Expert consensus: CRQC 10-20+ years away. NIST Post-Quantum Cryptography project timelines; IBM/Google quantum roadmaps. |
| Vulnerability | 0.80 | ~5M BTC in P2PK outputs with exposed public keys. Shor's algorithm proven effective against ECDLP in theory. Mitigated only by P2PKH hash protection pre-spend. |
| Primary Loss | $100B | ~5M BTC at risk × current market price. Source: Bitcoin UTXO set analysis. |
| Secondary Loss | $500B | Full market confidence destruction. Historical: Mt. Gox caused ~80% drawdown. Existential threat priced as total market cap loss. |

**Key citations:**
- Roetteler et al. (2017) "Quantum Resource Estimates for Computing Elliptic Curve Discrete Logarithms"
- NIST IR 8413 "Status Report on the Third Round of the NIST Post-Quantum Cryptography Standardization Process"
- Bitcoin UTXO Analysis: Deloitte "Quantum computers and the Bitcoin blockchain" (2022)

### 2. 51% Attack / Mining Centralization
| Factor | Value | Source |
|--------|-------|--------|
| TEF | 0.15/yr | Historical: Bitcoin Gold, Ethereum Classic suffered successful 51% attacks. No successful attack on Bitcoin mainnet. Pool concentration periodically exceeds 30% for top pool. |
| Vulnerability | 0.30 | Bitcoin's hashrate scale (~600 EH/s) makes attack extremely expensive. Estimated cost >$1B/hour. Pools are not monolithic entities. |
| Primary Loss | $10B | Double-spend potential limited by confirmation depth. Realistic target: exchanges with low confirmations. |
| Secondary Loss | $100B | Market reaction to successful attack. Historical: altcoin 51% attacks caused 30-60% price declines. |

**Key citations:**
- Crypto51.app attack cost estimates
- Cambridge Centre for Alternative Finance: Bitcoin Mining Map
- Bonneau et al. (2015) "SoK: Research Perspectives and Challenges for Bitcoin and Cryptocurrencies"

### 3. Regulatory Prohibition
| Factor | Value | Source |
|--------|-------|--------|
| TEF | 0.25/yr | China ban (2021), India proposed ban (2021), EU MiCA regulations. Multiple jurisdictions actively considering restrictions. |
| Vulnerability | 0.40 | Bitcoin is censorship-resistant by design but relies on fiat on/off ramps. Mining can be jurisdictionally displaced. |
| Primary Loss | $50B | Forced liquidation in banned jurisdictions. Historical: China ban caused temporary ~50% hashrate drop. |
| Secondary Loss | $200B | Market impact of coordinated G7 ban scenario. Historical: China ban alone caused ~30% price decline. |

**Key citations:**
- Library of Congress: "Regulation of Cryptocurrency Around the World" (updated annually)
- Atlantic Council CBDC Tracker
- Cambridge Bitcoin Electricity Consumption Index

### 4. Eclipse Attacks on Node Network
| Factor | Value | Source |
|--------|-------|--------|
| TEF | 0.50/yr | Heilman et al. (2015) demonstrated feasibility. Multiple patches deployed but new variants possible. |
| Vulnerability | 0.15 | Bitcoin Core has implemented multiple countermeasures (addrman bucketing, outbound peer diversity, anchor connections). |
| Primary Loss | $1B | Targeted attack on specific victims (merchants, exchanges). Limited blast radius per attack. |
| Secondary Loss | $5B | Network trust degradation if widely publicized. |

**Key citations:**
- Heilman et al. (2015) "Eclipse Attacks on Bitcoin's Peer-to-Peer Network" (USENIX Security)
- Bitcoin Core PRs: #8282, #9037 (eclipse attack mitigations)

### 5. Supply Chain Attack on Bitcoin Core
| Factor | Value | Source |
|--------|-------|--------|
| TEF | 0.10/yr | SolarWinds-style attacks increasingly common. Bitcoin Core has reproducible builds but complex dependency chain. |
| Vulnerability | 0.20 | Gitian/Guix reproducible build system. Multiple maintainer review. But human review has limits at scale. |
| Primary Loss | $20B | Compromised consensus rules could enable theft. Limited by detection speed. |
| Secondary Loss | $100B | Fundamental trust in Bitcoin software destroyed. |

**Key citations:**
- Bitcoin Core reproducible builds documentation
- Carl Dong's work on Guix-based build system
- SolarWinds incident analysis (CISA)

---

## Recalibration Process

FAIR estimates are **not static**. They should be recalibrated when:

1. **New incidents occur** — Any successful attack on Bitcoin or analogous cryptocurrency updates TEF
2. **Technology advances** — Quantum computing milestones, new mining hardware, etc.
3. **Protocol changes** — Soft forks, new BIP implementations that add/remove controls
4. **Market changes** — Significant price movements change loss magnitude estimates
5. **Research publications** — New academic work on attack feasibility

Recalibrated scores are submitted through the admin interface directly into Supabase, with full audit trail. The `score` API endpoints require a `reason` field documenting the justification for any score change.

---

## Limitations & Disclaimers

- FAIR estimates for novel, unprecedented threats (e.g., quantum attacks) rely heavily on expert judgment rather than historical frequency data
- Loss estimates use current market prices and may not reflect future valuations
- Secondary loss estimates assume rational market behavior and may underestimate panic-driven losses
- Vulnerability scores assume current protocol state; unpatched zero-days could significantly increase vulnerability
- This framework provides *estimates* for institutional risk management, not precise predictions
