// ===========================================
// Bitcoin RMF - Seed Data
// ===========================================

import { v4 as uuidv4 } from 'uuid';

import {
  STRIDECategory,
  ThreatSource,
  AffectedComponent,
  RiskRating,
  ThreatStatus,
  NistRmfStage,
  BIPRecommendation,
  FUDCategory,
  Threat,
  BIPEvaluation,
  FUDAnalysis,
  RemediationStrategy,
} from '@/types';

import {
  calculateSeverityScore,
  getSeverityRating,
  calculateFAIRRisk,
} from '@/lib/scoring';

// ===========================================
// Seed Threats
// ===========================================

export const SEED_THREATS: Threat[] = [
  // -----------------------------------------------
  // 1. Quantum Computing Breaks ECDSA
  // -----------------------------------------------
  {
    id: 'threat-1',
    name: 'Quantum Computing Breaks ECDSA',
    description:
      'A sufficiently powerful quantum computer running Shor\'s algorithm could derive private keys from public keys exposed on the Bitcoin blockchain. Approximately 5-10 million BTC are in pay-to-public-key (P2PK) outputs where the public key is already exposed. This represents an existential but currently distant threat to Bitcoin\'s cryptographic security model.',
    strideCategory: STRIDECategory.SPOOFING,
    strideRationale:
      'Classified as Spoofing because an attacker with a quantum computer could impersonate any Bitcoin address holder by deriving their private key from the exposed public key, forging valid signatures and spending funds as if they were the legitimate owner.',
    threatSource: ThreatSource.TECHNOLOGY,
    affectedComponents: [
      AffectedComponent.CRYPTO_STACK,
      AffectedComponent.WALLET,
    ],
    vulnerability:
      'Bitcoin relies on the secp256k1 elliptic curve for ECDSA signatures. Shor\'s algorithm on a fault-tolerant quantum computer with ~2,500-4,000 logical qubits could solve the ECDLP in polynomial time, breaking the one-way function that protects private keys from public key derivation.',
    exploitScenario:
      'A nation-state operates a fault-tolerant quantum computer with sufficient logical qubits. They target the ~5M BTC in P2PK outputs and reused P2PKH addresses where public keys are exposed. By running Shor\'s algorithm, they derive private keys and drain funds before the network can implement a post-quantum migration. Even hash-protected P2PKH addresses become vulnerable when the owner broadcasts a spending transaction, as the public key is revealed in the mempool before confirmation.',
    likelihood: 2 as const,
    likelihoodJustification:
      'Current quantum computers have ~1,500 physical qubits with high error rates. Estimates suggest cryptographically relevant quantum computers (CRQC) are 10-20+ years away. IBM, Google, and state actors are progressing, but the engineering challenges of fault tolerance remain immense. Rated Unlikely (2) for the foreseeable planning horizon.',
    impact: 5 as const,
    impactJustification:
      'If ECDSA is broken, the entire trust model of Bitcoin collapses. Billions of dollars in P2PK and reused-address outputs become immediately stealable. The network would need an emergency hard fork to a post-quantum signature scheme, potentially splitting the chain and destroying market confidence. Rated Catastrophic (5).',
    severityScore: calculateSeverityScore(2, 5),
    riskRating: getSeverityRating(calculateSeverityScore(2, 5)),
    fairEstimates: {
      threatEventFrequency: 0.02,
      vulnerability: 0.8,
      lossEventFrequency: 0.02 * 0.8,
      primaryLossUSD: 100_000_000_000,
      secondaryLossUSD: 500_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.02, 0.8, 100_000_000_000, 500_000_000_000),
    },
    nistStage: NistRmfStage.PREPARE,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-1-1',
        threatId: 'threat-1',
        title: 'Post-Quantum Signature Migration',
        description:
          'Develop and deploy a post-quantum signature scheme (e.g., SPHINCS+, CRYSTALS-Dilithium, or Lamport signatures) via a soft fork. Provide a migration window for users to move funds from legacy ECDSA outputs to quantum-resistant addresses.',
        effectiveness: 90,
        estimatedCostUSD: 50_000_000,
        timelineMonths: 60,
        status: 'PLANNED',
        relatedBIPs: ['BIP-340', 'BIP-341'],
      },
      {
        id: 'rem-1-2',
        threatId: 'threat-1',
        title: 'Commit-Delay-Reveal Spending Protocol',
        description:
          'Implement a protocol where spending transactions first commit a hash of the transaction without revealing the public key, wait for confirmation, then reveal. This prevents quantum attackers from intercepting the public key in the mempool.',
        effectiveness: 60,
        estimatedCostUSD: 5_000_000,
        timelineMonths: 24,
        status: 'PLANNED',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: ['BIP-340', 'BIP-341'],
    evidenceSources: [
      {
        title: 'Quantum Computing and the Bitcoin Blockchain: Analysis of the Impact on ECDSA',
        url: 'https://arxiv.org/abs/2106.06593',
        type: 'RESEARCH',
      },
      {
        title: 'NIST Post-Quantum Cryptography Standardization',
        url: 'https://csrc.nist.gov/projects/post-quantum-cryptography',
        type: 'RESEARCH',
      },
    ],
    dateIdentified: '2019-10-23',
    lastUpdated: '2025-09-15',
  },

  // -----------------------------------------------
  // 2. 51% Hashrate Attack
  // -----------------------------------------------
  {
    id: 'threat-2',
    name: '51% Hashrate Attack',
    description:
      'An entity controlling more than 50% of Bitcoin\'s total mining hashrate could reorganize the blockchain, enabling double-spend attacks, censoring transactions, and preventing other miners from finding valid blocks. This is the canonical attack against proof-of-work consensus systems.',
    strideCategory: STRIDECategory.TAMPERING,
    strideRationale:
      'Classified as Tampering because the attacker modifies the blockchain\'s canonical transaction history by reorganizing confirmed blocks, inserting double-spend transactions, and altering the immutable ledger that all participants rely on.',
    threatSource: ThreatSource.NETWORK,
    affectedComponents: [
      AffectedComponent.CONSENSUS,
      AffectedComponent.MINING,
    ],
    vulnerability:
      'Nakamoto consensus assumes no single entity controls majority hashrate. If this assumption fails, the longest-chain rule allows an attacker to privately mine an alternative chain and broadcast it to overwrite the honest chain, reversing confirmed transactions.',
    exploitScenario:
      'A well-funded nation-state or cartel of mining pools secretly accumulates >50% hashrate through covert ASIC manufacturing and compromising pool operators. They execute a large exchange deposit of 10,000 BTC, wait for 6 confirmations, withdraw to an external wallet, then broadcast a pre-mined alternative chain that excludes the deposit transaction. The exchange loses 10,000 BTC. The attacker repeats this across multiple exchanges simultaneously.',
    likelihood: 2 as const,
    likelihoodJustification:
      'Bitcoin\'s hashrate exceeds 700 EH/s as of 2025. Acquiring 51% would require manufacturing or controlling ~$15-20 billion in ASIC hardware plus enormous energy costs. While theoretically possible for a nation-state, the economic incentive structure makes it irrational: a successful attack would crash BTC price, destroying the attacker\'s own mining investment. Rated Unlikely (2).',
    impact: 5 as const,
    impactJustification:
      'A confirmed 51% attack would shatter confidence in Bitcoin\'s immutability guarantee. Exchange losses could total billions, and the market cap could collapse 50-80% as trust in proof-of-work is undermined. The precedent would permanently damage Bitcoin\'s store-of-value narrative. Rated Catastrophic (5).',
    severityScore: calculateSeverityScore(2, 5),
    riskRating: getSeverityRating(calculateSeverityScore(2, 5)),
    fairEstimates: {
      threatEventFrequency: 0.05,
      vulnerability: 0.3,
      lossEventFrequency: 0.05 * 0.3,
      primaryLossUSD: 5_000_000_000,
      secondaryLossUSD: 200_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.05, 0.3, 5_000_000_000, 200_000_000_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-2-1',
        threatId: 'threat-2',
        title: 'Hashrate Distribution Monitoring',
        description:
          'Implement continuous monitoring dashboards tracking mining pool hashrate distribution, geographic concentration, and ASIC manufacturer market share. Alert when any entity approaches 30% threshold.',
        effectiveness: 40,
        estimatedCostUSD: 500_000,
        timelineMonths: 6,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-2-2',
        threatId: 'threat-2',
        title: 'Increase Confirmation Requirements for Large Transactions',
        description:
          'Encourage exchanges and merchants to require higher confirmation counts (12-60) for large-value transactions, making deep chain reorganizations prohibitively expensive even for majority hashrate holders.',
        effectiveness: 55,
        estimatedCostUSD: 100_000,
        timelineMonths: 3,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'Majority Is Not Enough: Bitcoin Mining Is Vulnerable',
        url: 'https://arxiv.org/abs/1311.0243',
        type: 'RESEARCH',
      },
      {
        title: 'Bitcoin Gold 51% Attack Analysis (2018/2020)',
        url: 'https://gist.github.com/metalicjames/71321570a105940529e709651d0a9765',
        type: 'INCIDENT',
      },
    ],
    dateIdentified: '2008-10-31',
    lastUpdated: '2025-06-01',
  },

  // -----------------------------------------------
  // 3. Transaction Malleability
  // -----------------------------------------------
  {
    id: 'threat-3',
    name: 'Transaction Malleability',
    description:
      'Transaction malleability allowed third parties to alter the transaction ID (txid) of unconfirmed transactions without invalidating them, by modifying the signature encoding. This was effectively mitigated by the Segregated Witness (SegWit) soft fork activated in August 2017, which separates signature data from the transaction hash.',
    strideCategory: STRIDECategory.TAMPERING,
    strideRationale:
      'Classified as Tampering because the attack modifies the transaction identifier without changing the transaction\'s economic effect, corrupting the integrity of transaction tracking systems and enabling follow-on attacks against dependent transactions.',
    threatSource: ThreatSource.PROTOCOL,
    affectedComponents: [
      AffectedComponent.CONSENSUS,
      AffectedComponent.WALLET,
    ],
    vulnerability:
      'Pre-SegWit transactions included signature data in the txid hash. Since DER-encoded ECDSA signatures have multiple valid encodings for the same signature, any relay node could modify the encoding, changing the txid while keeping the transaction valid.',
    exploitScenario:
      'An attacker monitors the mempool for a large withdrawal from an exchange. They capture the transaction, modify the signature encoding to change the txid, and rebroadcast the mutated version. If the mutated version confirms first, the exchange\'s tracking system (keyed on the original txid) reports the withdrawal as failed. The customer complains, and the exchange issues a duplicate withdrawal, losing funds.',
    likelihood: 1 as const,
    likelihoodJustification:
      'SegWit (BIP-141) was activated in August 2017 and has been widely adopted. SegWit transactions use a witness txid (wtxid) that excludes signature data from the hash, eliminating third-party malleability. Legacy transactions can still be malleable, but their use is declining. Rated Rare (1).',
    impact: 3 as const,
    impactJustification:
      'Even when exploitable, transaction malleability primarily affected exchange and wallet software that tracked unconfirmed transactions by txid. The actual funds were not stolen (the original transaction still confirmed), but the tracking confusion could cause duplicate payouts. Rated Moderate (3).',
    severityScore: calculateSeverityScore(1, 3),
    riskRating: getSeverityRating(calculateSeverityScore(1, 3)),
    fairEstimates: {
      threatEventFrequency: 0.5,
      vulnerability: 0.05,
      lossEventFrequency: 0.5 * 0.05,
      primaryLossUSD: 1_000_000,
      secondaryLossUSD: 500_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.5, 0.05, 1_000_000, 500_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MITIGATED,
    remediationStrategies: [
      {
        id: 'rem-3-1',
        threatId: 'threat-3',
        title: 'SegWit Adoption and Legacy Output Deprecation',
        description:
          'Continue migrating all wallet software and exchange systems to use SegWit (bech32/bech32m) addresses exclusively. Deprecate legacy P2PKH outputs in wallet defaults to eliminate remaining malleability surface.',
        effectiveness: 95,
        estimatedCostUSD: 200_000,
        timelineMonths: 12,
        status: 'COMPLETED',
        relatedBIPs: ['BIP-141', 'BIP-143', 'BIP-173'],
      },
    ],
    relatedBIPs: ['BIP-141', 'BIP-143', 'BIP-144'],
    evidenceSources: [
      {
        title: 'Mt. Gox Transaction Malleability Incident (2014)',
        url: 'https://arxiv.org/abs/1403.6676',
        type: 'INCIDENT',
      },
      {
        title: 'BIP-141: Segregated Witness (Consensus Layer)',
        url: 'https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki',
        type: 'BIP',
      },
    ],
    dateIdentified: '2011-08-15',
    lastUpdated: '2024-01-10',
  },

  // -----------------------------------------------
  // 4. Selfish Mining Strategy
  // -----------------------------------------------
  {
    id: 'threat-4',
    name: 'Selfish Mining Strategy',
    description:
      'A mining entity can gain disproportionate block rewards by strategically withholding discovered blocks and selectively releasing them to waste honest miners\' work. Research by Eyal and Sirer (2014) demonstrated that miners with as little as ~25-33% hashrate can profit from this strategy, contradicting the assumption that mining is only profitable above 50%.',
    strideCategory: STRIDECategory.REPUDIATION,
    strideRationale:
      'Classified as Repudiation because the selfish miner exploits the fact that block discovery is private information. They deny timely disclosure of valid blocks they have found, breaking the implicit protocol expectation that miners immediately broadcast discovered blocks, and they can later claim their privately-mined chain as the legitimate one.',
    threatSource: ThreatSource.NETWORK,
    affectedComponents: [
      AffectedComponent.CONSENSUS,
      AffectedComponent.MINING,
    ],
    vulnerability:
      'Bitcoin\'s mining protocol has no mechanism to prove when a block was discovered. A miner can withhold blocks and release them strategically to orphan honest miners\' blocks, capturing a disproportionate share of revenue relative to their hashrate.',
    exploitScenario:
      'A mining pool with 30% hashrate begins selfish mining. When they find a block, they keep it private. If the honest network finds a competing block, the selfish miner releases their withheld block, causing a race condition. With network propagation advantages (e.g., well-connected nodes), they win these races more often than chance, orphaning honest blocks and earning ~35% of total rewards despite having only 30% hashrate. This slowly centralizes mining as smaller honest miners become unprofitable.',
    likelihood: 2 as const,
    likelihoodJustification:
      'While theoretically proven profitable above ~25% hashrate, selfish mining has never been confirmed on the Bitcoin mainnet. The strategy is detectable through statistical analysis of orphan rates and block timestamps. Large pools risk reputational damage and miner exodus if caught. Rated Unlikely (2).',
    impact: 4 as const,
    impactJustification:
      'Successful selfish mining would undermine the fairness and decentralization of Bitcoin mining. Smaller miners would be driven out, increasing centralization. While it doesn\'t directly steal user funds, it erodes the economic security model that protects the network. Rated Major (4).',
    severityScore: calculateSeverityScore(2, 4),
    riskRating: getSeverityRating(calculateSeverityScore(2, 4)),
    fairEstimates: {
      threatEventFrequency: 0.1,
      vulnerability: 0.4,
      lossEventFrequency: 0.1 * 0.4,
      primaryLossUSD: 500_000_000,
      secondaryLossUSD: 2_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.1, 0.4, 500_000_000, 2_000_000_000),
    },
    nistStage: NistRmfStage.ASSESS,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-4-1',
        threatId: 'threat-4',
        title: 'Orphan Block Statistical Monitoring',
        description:
          'Deploy monitoring systems that track orphan block rates, block propagation times, and mining pool behavior to detect anomalous patterns consistent with selfish mining strategies.',
        effectiveness: 50,
        estimatedCostUSD: 300_000,
        timelineMonths: 6,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'Majority Is Not Enough: Bitcoin Mining Is Vulnerable (Eyal & Sirer, 2014)',
        url: 'https://arxiv.org/abs/1311.0243',
        type: 'RESEARCH',
      },
      {
        title: 'Optimal Selfish Mining Strategies in Bitcoin',
        url: 'https://arxiv.org/abs/1507.06183',
        type: 'RESEARCH',
      },
    ],
    dateIdentified: '2013-11-04',
    lastUpdated: '2025-03-22',
  },

  // -----------------------------------------------
  // 5. Eclipse Attack on Nodes
  // -----------------------------------------------
  {
    id: 'threat-5',
    name: 'Eclipse Attack on Nodes',
    description:
      'An eclipse attack isolates a target Bitcoin node by monopolizing all of its inbound and outbound connections with attacker-controlled peers. The eclipsed node receives a manipulated view of the blockchain, enabling double-spend attacks against the victim, filtering of transactions, and selfish mining amplification.',
    strideCategory: STRIDECategory.INFORMATION_DISCLOSURE,
    strideRationale:
      'Classified as Information Disclosure because the eclipsed node\'s network view is completely controlled by the attacker, who can selectively disclose or withhold blockchain data, blocks, and transactions. The victim unknowingly operates on attacker-curated information rather than the true network state.',
    threatSource: ThreatSource.NETWORK,
    affectedComponents: [
      AffectedComponent.P2P_NETWORK,
      AffectedComponent.FULL_NODE,
      AffectedComponent.SPV_CLIENT,
    ],
    vulnerability:
      'Bitcoin Core\'s peer connection management uses a bucketed address table (addrman) that can be manipulated by flooding the victim with attacker IP addresses. With enough attacker IPs in the victim\'s address table, restarting the node causes it to connect exclusively to attacker-controlled peers.',
    exploitScenario:
      'An attacker controls a /16 botnet with thousands of IP addresses. They flood a target merchant node\'s address table over several days. When the merchant restarts their node (e.g., for software updates), all outbound connections go to attacker IPs. The attacker feeds the merchant a stale blockchain while executing a double-spend: they send BTC to the merchant, the merchant sees the transaction confirm on the attacker-fed chain, ships goods, but the real Bitcoin network never saw the transaction.',
    likelihood: 3 as const,
    likelihoodJustification:
      'Eclipse attacks have been demonstrated in research environments and partially mitigated by Bitcoin Core improvements (diverse peer selection, anchor connections, Tor/I2P support). However, SPV clients and poorly configured nodes remain vulnerable. The attack is feasible for well-resourced adversaries with botnet access. Rated Possible (3).',
    impact: 3 as const,
    impactJustification:
      'An eclipse attack affects individual nodes rather than the entire network. The blast radius is limited to the eclipsed node\'s operator and their direct counterparties. However, it can enable targeted double-spends worth millions against exchanges or merchants. Rated Moderate (3).',
    severityScore: calculateSeverityScore(3, 3),
    riskRating: getSeverityRating(calculateSeverityScore(3, 3)),
    fairEstimates: {
      threatEventFrequency: 2,
      vulnerability: 0.15,
      lossEventFrequency: 2 * 0.15,
      primaryLossUSD: 10_000_000,
      secondaryLossUSD: 5_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(2, 0.15, 10_000_000, 5_000_000),
    },
    nistStage: NistRmfStage.IMPLEMENT,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-5-1',
        threatId: 'threat-5',
        title: 'Diverse Peer Connection Hardening',
        description:
          'Configure nodes to maintain connections across diverse network segments (Tor, I2P, clearnet), use anchor connections to trusted peers, and limit connections from a single IP range. Bitcoin Core v22+ includes several of these mitigations by default.',
        effectiveness: 70,
        estimatedCostUSD: 50_000,
        timelineMonths: 3,
        status: 'IN_PROGRESS',
        relatedBIPs: ['BIP-324'],
      },
    ],
    relatedBIPs: ['BIP-324'],
    evidenceSources: [
      {
        title: 'Eclipse Attacks on Bitcoin\'s Peer-to-Peer Network (Heilman et al., 2015)',
        url: 'https://eprint.iacr.org/2015/263.pdf',
        type: 'RESEARCH',
      },
      {
        title: 'Bitcoin Core PR #16702: Addrman Improvements for Eclipse Resistance',
        url: 'https://github.com/bitcoin/bitcoin/pull/16702',
        type: 'CVE',
      },
    ],
    dateIdentified: '2015-03-09',
    lastUpdated: '2025-05-18',
  },

  // -----------------------------------------------
  // 6. Sybil Attack on P2P Network
  // -----------------------------------------------
  {
    id: 'threat-6',
    name: 'Sybil Attack on P2P Network',
    description:
      'An attacker creates a large number of pseudonymous Bitcoin nodes to gain disproportionate influence over the P2P network topology. By operating thousands of nodes, the attacker can partition the network, degrade transaction propagation, deanonymize users by correlating transaction origins, and amplify other attacks like eclipse attacks.',
    strideCategory: STRIDECategory.SPOOFING,
    strideRationale:
      'Classified as Spoofing because each Sybil node impersonates a legitimate independent network participant. The attacker creates false identities (nodes) to subvert the peer-to-peer network\'s assumption that each node represents a distinct, independent actor.',
    threatSource: ThreatSource.NETWORK,
    affectedComponents: [
      AffectedComponent.P2P_NETWORK,
      AffectedComponent.FULL_NODE,
    ],
    vulnerability:
      'Bitcoin\'s P2P network is permissionless, requiring no identity verification or stake to operate a node. An attacker can cheaply spin up thousands of nodes on cloud infrastructure to flood the network with dishonest peers that coordinate to undermine honest node connectivity.',
    exploitScenario:
      'A surveillance agency deploys 5,000 Bitcoin nodes across multiple cloud providers and geographic regions. These nodes connect to as many honest nodes as possible, becoming relay hubs. By analyzing transaction propagation timing (which node relays a transaction first), the agency deanonymizes Bitcoin users, linking IP addresses to wallet addresses. They sell this data to analytics firms or use it for targeted law enforcement operations.',
    likelihood: 3 as const,
    likelihoodJustification:
      'Running thousands of lightweight nodes is relatively cheap (~$50-100/month per node on cloud infrastructure). Chainalysis and similar firms are known to operate extensive node networks for blockchain surveillance. Academic research has confirmed the feasibility. Rated Possible (3).',
    impact: 3 as const,
    impactJustification:
      'Sybil attacks primarily degrade privacy rather than directly stealing funds. They can deanonymize users, degrade network performance, and amplify other attacks. The impact is significant for privacy but does not directly threaten consensus or funds. Rated Moderate (3).',
    severityScore: calculateSeverityScore(3, 3),
    riskRating: getSeverityRating(calculateSeverityScore(3, 3)),
    fairEstimates: {
      threatEventFrequency: 5,
      vulnerability: 0.3,
      lossEventFrequency: 5 * 0.3,
      primaryLossUSD: 500_000,
      secondaryLossUSD: 10_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(5, 0.3, 500_000, 10_000_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-6-1',
        threatId: 'threat-6',
        title: 'Enhanced Peer Scoring and Diverse Connection Policies',
        description:
          'Implement reputation-based peer scoring that prioritizes long-lived, well-behaved peers over newly connected nodes. Enforce connection diversity across IP ranges, ASNs, and network types (clearnet/Tor/I2P) to limit Sybil influence.',
        effectiveness: 55,
        estimatedCostUSD: 200_000,
        timelineMonths: 12,
        status: 'IN_PROGRESS',
        relatedBIPs: ['BIP-324'],
      },
      {
        id: 'rem-6-2',
        threatId: 'threat-6',
        title: 'Dandelion++ Transaction Relay',
        description:
          'Deploy Dandelion++ (BIP proposal) to obscure the origin of transactions by first relaying through a random "stem" path before broadcasting to the wider network, defeating timing-based deanonymization by Sybil nodes.',
        effectiveness: 65,
        estimatedCostUSD: 150_000,
        timelineMonths: 18,
        status: 'PLANNED',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: ['BIP-324'],
    evidenceSources: [
      {
        title: 'An Analysis of Anonymity in the Bitcoin System (Reid & Harrigan, 2011)',
        url: 'https://arxiv.org/abs/1107.4524',
        type: 'RESEARCH',
      },
      {
        title: 'Deanonymisation of Clients in Bitcoin P2P Network (Biryukov et al., 2014)',
        url: 'https://arxiv.org/abs/1405.7418',
        type: 'RESEARCH',
      },
    ],
    dateIdentified: '2011-07-22',
    lastUpdated: '2025-04-10',
  },

  // -----------------------------------------------
  // 7. BGP Routing Hijack Attacks
  // -----------------------------------------------
  {
    id: 'threat-7',
    name: 'BGP Routing Hijack Attacks',
    description:
      'Border Gateway Protocol (BGP) hijacking allows an attacker controlling an autonomous system (AS) to reroute Bitcoin P2P traffic through their infrastructure by announcing false routing prefixes. This enables partition attacks, transaction delay, block withholding, and man-in-the-middle attacks against unencrypted Bitcoin P2P connections.',
    strideCategory: STRIDECategory.DENIAL_OF_SERVICE,
    strideRationale:
      'Classified as Denial of Service because BGP hijacking disrupts normal Bitcoin network communication by rerouting, delaying, or dropping P2P traffic. Eclipsed nodes lose access to the legitimate Bitcoin network, effectively denying them the service of participating in consensus.',
    threatSource: ThreatSource.NETWORK,
    affectedComponents: [
      AffectedComponent.P2P_NETWORK,
      AffectedComponent.FULL_NODE,
      AffectedComponent.MINING,
    ],
    vulnerability:
      'BGP has no built-in authentication mechanism. Any AS can announce routes for IP prefixes it does not own. Bitcoin\'s P2P protocol (pre-BIP-324) transmits data unencrypted, making man-in-the-middle attacks trivial once traffic is rerouted. Research shows that fewer than 100 ASes host the majority of Bitcoin nodes.',
    exploitScenario:
      'A state-level actor instructs ISPs under their jurisdiction to announce BGP routes covering IP ranges hosting major Bitcoin mining pools and exchanges. Bitcoin traffic from these entities is rerouted through government-controlled routers. The attacker delays block propagation to specific mining pools (giving domestic miners an advantage), censors transactions from sanctioned addresses, and partitions the network to facilitate a localized double-spend attack.',
    likelihood: 3 as const,
    likelihoodJustification:
      'BGP hijacking incidents occur routinely on the internet (documented cases include China Telecom, Rostelecom). Apostolaki et al. (2017) demonstrated that a single AS could intercept a significant fraction of Bitcoin traffic. Bitcoin-specific BGP hijacks have been documented. Rated Possible (3).',
    impact: 4 as const,
    impactJustification:
      'A successful BGP hijack could partition the Bitcoin network, enabling double-spends against partitioned segments, delaying blocks to advantage specific miners, and broadly disrupting network operations for hours or days. The economic damage from network partitioning could reach hundreds of millions. Rated Major (4).',
    severityScore: calculateSeverityScore(3, 4),
    riskRating: getSeverityRating(calculateSeverityScore(3, 4)),
    fairEstimates: {
      threatEventFrequency: 3,
      vulnerability: 0.2,
      lossEventFrequency: 3 * 0.2,
      primaryLossUSD: 100_000_000,
      secondaryLossUSD: 500_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(3, 0.2, 100_000_000, 500_000_000),
    },
    nistStage: NistRmfStage.IMPLEMENT,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-7-1',
        threatId: 'threat-7',
        title: 'BIP-324 Encrypted P2P Transport',
        description:
          'Deploy BIP-324 v2 encrypted P2P transport protocol to authenticate peer connections and encrypt traffic, preventing man-in-the-middle attacks even when BGP routes are hijacked. Encrypted connections make traffic manipulation detectable.',
        effectiveness: 70,
        estimatedCostUSD: 300_000,
        timelineMonths: 12,
        status: 'IN_PROGRESS',
        relatedBIPs: ['BIP-324'],
      },
      {
        id: 'rem-7-2',
        threatId: 'threat-7',
        title: 'Multi-Path and Tor/I2P Network Diversity',
        description:
          'Configure critical Bitcoin infrastructure (mining pools, exchanges, full nodes) to maintain redundant connections across clearnet, Tor, and I2P. BGP hijacking cannot affect onion-routed or I2P traffic, providing resilient alternative communication paths.',
        effectiveness: 60,
        estimatedCostUSD: 100_000,
        timelineMonths: 6,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: ['BIP-324'],
    evidenceSources: [
      {
        title: 'Hijacking Bitcoin: Routing Attacks on Cryptocurrencies (Apostolaki et al., 2017)',
        url: 'https://arxiv.org/abs/1605.07524',
        type: 'RESEARCH',
      },
      {
        title: 'Bitcoin Network Partitioning via BGP Hijack (2020 Incident)',
        url: 'https://btc-hijack.ethz.ch',
        type: 'INCIDENT',
      },
    ],
    dateIdentified: '2017-05-18',
    lastUpdated: '2025-07-30',
  },

  // -----------------------------------------------
  // 8. Mining Pool Centralization
  // -----------------------------------------------
  {
    id: 'threat-8',
    name: 'Mining Pool Centralization',
    description:
      'Bitcoin mining has become highly concentrated, with the top 3-4 mining pools consistently controlling over 60% of total hashrate. This centralization creates single points of failure, enables potential collusion for transaction censorship or block template manipulation, and introduces regulatory leverage points where governments can coerce pool operators.',
    strideCategory: STRIDECategory.ELEVATION_OF_PRIVILEGE,
    strideRationale:
      'Classified as Elevation of Privilege because mining pool operators gain disproportionate control over block production and transaction inclusion far beyond what their personal hashrate contribution warrants. A pool operator controlling 30% of hashrate exercises block template authority that individual miners in the pool never consented to.',
    threatSource: ThreatSource.OPERATIONAL,
    affectedComponents: [
      AffectedComponent.MINING,
      AffectedComponent.CONSENSUS,
    ],
    vulnerability:
      'Most mining pools use the Stratum protocol where the pool operator constructs block templates and miners blindly hash them. Individual miners cannot verify or override which transactions the pool includes. Pool operators can censor transactions, implement OFAC compliance unilaterally, or collude with other pools.',
    exploitScenario:
      'A government issues a regulatory order requiring all mining pools in their jurisdiction (which collectively control 55% of hashrate) to exclude transactions involving sanctioned addresses. Pool operators comply, implementing transaction blacklists. Users sending from flagged addresses find their transactions never confirming, effectively creating a permissioned layer on top of Bitcoin. Compliant pools begin censoring CoinJoin transactions and any interaction with privacy-focused services.',
    likelihood: 4 as const,
    likelihoodJustification:
      'Mining pool centralization is a present reality, not a theoretical threat. Foundry USA, AntPool, and F2Pool regularly control 50-65% of hashrate. OFAC compliance pressure has already led to some pools filtering transactions. Marathon Digital publicly implemented OFAC-compliant blocks before reversing course. Rated Likely (4).',
    impact: 4 as const,
    impactJustification:
      'Transaction censorship by majority hashrate directly undermines Bitcoin\'s censorship-resistance property, its core value proposition. If sustained, it transforms Bitcoin from a permissionless system into a permissioned one, potentially causing a community split (hard fork) and massive loss of confidence. Rated Major (4).',
    severityScore: calculateSeverityScore(4, 4),
    riskRating: getSeverityRating(calculateSeverityScore(4, 4)),
    fairEstimates: {
      threatEventFrequency: 12,
      vulnerability: 0.5,
      lossEventFrequency: 12 * 0.5,
      primaryLossUSD: 50_000_000,
      secondaryLossUSD: 100_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(12, 0.5, 50_000_000, 100_000_000_000),
    },
    nistStage: NistRmfStage.ASSESS,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-8-1',
        threatId: 'threat-8',
        title: 'Stratum V2 Adoption with Client-Side Block Templates',
        description:
          'Promote adoption of Stratum V2 protocol which allows individual miners to construct their own block templates rather than accepting the pool operator\'s template. This gives miners sovereignty over transaction selection and prevents pool-level censorship.',
        effectiveness: 80,
        estimatedCostUSD: 2_000_000,
        timelineMonths: 24,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-8-2',
        threatId: 'threat-8',
        title: 'Decentralized Mining Pool Protocols (P2Pool/Ocean)',
        description:
          'Support development and adoption of fully decentralized mining pool protocols like P2Pool or Ocean Mining that eliminate the pool operator as a single point of control, distributing block template construction across all participants.',
        effectiveness: 75,
        estimatedCostUSD: 5_000_000,
        timelineMonths: 36,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'A Survey on Security Analysis of Bitcoin Pooled Mining',
        url: 'https://arxiv.org/abs/2003.04766',
        type: 'RESEARCH',
      },
      {
        title: 'Marathon Digital OFAC-Compliant Mining Blocks (2021)',
        url: 'https://www.coindesk.com/business/2021/05/07/marathon-digital-to-stop-filtering-bitcoin-transactions/',
        type: 'NEWS',
      },
    ],
    dateIdentified: '2014-06-13',
    lastUpdated: '2025-11-02',
  },

  // -----------------------------------------------
  // 9. Bitcoin Core Supply Chain Attack
  // -----------------------------------------------
  {
    id: 'threat-9',
    name: 'Bitcoin Core Supply Chain Attack',
    description:
      'An attacker compromises the Bitcoin Core software supply chain by inserting malicious code into the repository, build system, or distribution infrastructure. Given that Bitcoin Core is the reference implementation run by ~95% of full nodes, a supply chain compromise could affect the entire network\'s consensus rules, steal funds via wallet manipulation, or introduce subtle backdoors.',
    strideCategory: STRIDECategory.TAMPERING,
    strideRationale:
      'Classified as Tampering because the attacker modifies the trusted Bitcoin Core software to behave differently from its intended specification, corrupting the integrity of the code that nodes rely on for consensus validation, transaction processing, and key management.',
    threatSource: ThreatSource.SUPPLY_CHAIN,
    affectedComponents: [
      AffectedComponent.FULL_NODE,
      AffectedComponent.WALLET,
      AffectedComponent.CONSENSUS,
    ],
    vulnerability:
      'Bitcoin Core\'s development relies on a small number of maintainers with commit access to the GitHub repository. The build system, Gitian/Guix reproducible builds, and the binary distribution infrastructure all represent potential compromise points. Social engineering of maintainers or compromise of CI/CD systems could inject malicious code.',
    exploitScenario:
      'A sophisticated attacker (nation-state APT) compromises a Bitcoin Core maintainer\'s development machine through a targeted spear-phishing campaign. They inject a subtle consensus rule change that activates after a specific block height, causing nodes running the compromised version to accept invalid transactions. Alternatively, they modify the wallet code to exfiltrate private keys to an attacker-controlled server disguised as telemetry. The malicious release passes automated tests because the backdoor is dormant until the activation condition.',
    likelihood: 2 as const,
    likelihoodJustification:
      'Bitcoin Core has strong security practices: multiple maintainer review, Guix reproducible builds, deterministic build verification, and a culture of paranoid code review. However, supply chain attacks have hit major open-source projects (SolarWinds, xz-utils, event-stream). The high value of Bitcoin makes Core a prime target. Rated Unlikely (2).',
    impact: 5 as const,
    impactJustification:
      'A successful supply chain compromise of Bitcoin Core could affect nearly every full node, potentially altering consensus rules, stealing wallet keys, or enabling chain splits. The damage to trust in Bitcoin\'s open-source development model would be incalculable. Rated Catastrophic (5).',
    severityScore: calculateSeverityScore(2, 5),
    riskRating: getSeverityRating(calculateSeverityScore(2, 5)),
    fairEstimates: {
      threatEventFrequency: 0.1,
      vulnerability: 0.05,
      lossEventFrequency: 0.1 * 0.05,
      primaryLossUSD: 10_000_000_000,
      secondaryLossUSD: 100_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.1, 0.05, 10_000_000_000, 100_000_000_000),
    },
    nistStage: NistRmfStage.IMPLEMENT,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-9-1',
        threatId: 'threat-9',
        title: 'Reproducible Build Verification Expansion',
        description:
          'Expand the number of independent parties performing Guix reproducible build verification for each Bitcoin Core release. Establish a diverse set of build verifiers across jurisdictions who independently compile and compare binary hashes.',
        effectiveness: 85,
        estimatedCostUSD: 1_000_000,
        timelineMonths: 12,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-9-2',
        threatId: 'threat-9',
        title: 'Formal Code Review and Static Analysis Pipeline',
        description:
          'Implement mandatory formal verification tools, enhanced static analysis (SAST/DAST), and multi-party code review requirements for all consensus-critical code paths. Fund additional full-time code reviewers to reduce single-point-of-failure in the review process.',
        effectiveness: 70,
        estimatedCostUSD: 3_000_000,
        timelineMonths: 18,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'XZ Utils Backdoor (CVE-2024-3094): Lessons for Bitcoin Core',
        url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
        type: 'CVE',
      },
      {
        title: 'Bitcoin Core Guix Reproducible Build System',
        url: 'https://github.com/bitcoin/bitcoin/blob/master/contrib/guix/README.md',
        type: 'WHITEPAPER',
      },
    ],
    dateIdentified: '2018-11-26',
    lastUpdated: '2025-04-01',
  },

  // -----------------------------------------------
  // 10. Social Engineering & Phishing
  // -----------------------------------------------
  {
    id: 'threat-10',
    name: 'Social Engineering & Phishing',
    description:
      'Attackers use social engineering techniques including phishing emails, fake wallet applications, fraudulent exchange websites, and impersonation of trusted Bitcoin figures to trick users into revealing private keys, seed phrases, or sending funds to attacker-controlled addresses. This is the most common attack vector resulting in individual Bitcoin losses.',
    strideCategory: STRIDECategory.SPOOFING,
    strideRationale:
      'Classified as Spoofing because the attacker impersonates legitimate entities (exchanges, wallet providers, Bitcoin developers, or trusted community members) to deceive victims into taking actions that compromise their funds or credentials.',
    threatSource: ThreatSource.SOCIAL_MEDIA,
    affectedComponents: [
      AffectedComponent.WALLET,
    ],
    vulnerability:
      'Bitcoin transactions are irreversible, and private key compromise results in permanent loss of funds. Users must manage their own security (self-custody), and many lack the technical sophistication to distinguish legitimate communications from social engineering attacks. The absence of chargebacks makes Bitcoin particularly attractive to phishing attackers.',
    exploitScenario:
      'An attacker creates a pixel-perfect clone of a popular hardware wallet manufacturer\'s website and purchases Google Ads for "Ledger wallet recovery." A user who has lost their device searches for help, finds the fraudulent site, and enters their 24-word seed phrase into the attacker\'s form. The attacker immediately sweeps all funds from the derived addresses. Alternatively, the attacker sends a fake firmware update notification that installs malware replacing the wallet\'s address generation with attacker-controlled addresses.',
    likelihood: 5 as const,
    likelihoodJustification:
      'Social engineering attacks against Bitcoin users occur daily. Chainalysis estimates billions in annual losses from scams and phishing. Fake wallet apps regularly appear on mobile app stores. YouTube and Twitter are flooded with impersonation scams. The attack requires minimal technical skill and scales easily. Rated Almost Certain (5).',
    impact: 3 as const,
    impactJustification:
      'Individual losses can be devastating (entire life savings), but each attack is localized to individual victims rather than systemic. Social engineering does not compromise Bitcoin\'s protocol or network integrity. The aggregate annual losses are significant but represent a small fraction of Bitcoin\'s market cap. Rated Moderate (3).',
    severityScore: calculateSeverityScore(5, 3),
    riskRating: getSeverityRating(calculateSeverityScore(5, 3)),
    fairEstimates: {
      threatEventFrequency: 10000,
      vulnerability: 0.05,
      lossEventFrequency: 10000 * 0.05,
      primaryLossUSD: 50_000,
      secondaryLossUSD: 10_000,
      annualizedLossExpectancy: calculateFAIRRisk(10000, 0.05, 50_000, 10_000),
    },
    nistStage: NistRmfStage.IMPLEMENT,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-10-1',
        threatId: 'threat-10',
        title: 'Hardware Wallet Security Education Campaign',
        description:
          'Develop and distribute comprehensive security education materials targeting Bitcoin holders, emphasizing seed phrase hygiene, verification procedures for firmware updates, and recognition of common phishing patterns. Partner with hardware wallet manufacturers for co-branded safety guides.',
        effectiveness: 40,
        estimatedCostUSD: 500_000,
        timelineMonths: 6,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-10-2',
        threatId: 'threat-10',
        title: 'Multi-Signature and Time-Locked Vault Adoption',
        description:
          'Promote adoption of multi-signature wallet configurations and time-locked vault transactions that prevent immediate fund sweeps even if a single key is compromised. Implement social recovery mechanisms as an alternative to single seed phrase backup.',
        effectiveness: 70,
        estimatedCostUSD: 1_000_000,
        timelineMonths: 18,
        status: 'PLANNED',
        relatedBIPs: ['BIP-174'],
      },
    ],
    relatedBIPs: ['BIP-174'],
    evidenceSources: [
      {
        title: 'Chainalysis 2024 Crypto Crime Report: Phishing and Scam Analysis',
        url: 'https://www.chainalysis.com/blog/crypto-crime-report/',
        type: 'NEWS',
      },
      {
        title: 'Ledger Data Breach Phishing Campaign Analysis (2020-2021)',
        url: 'https://www.ledger.com/phishing-campaigns-status',
        type: 'INCIDENT',
      },
    ],
    dateIdentified: '2011-01-15',
    lastUpdated: '2025-12-01',
  },

  // -----------------------------------------------
  // 11. Regulatory Ban or Restrictions
  // -----------------------------------------------
  {
    id: 'threat-11',
    name: 'Regulatory Ban or Restrictions',
    description:
      'Governments may impose outright bans on Bitcoin ownership, mining, or exchange operations, or implement increasingly restrictive regulations (KYC/AML requirements, transaction reporting, travel rules, capital gains taxation) that significantly impede Bitcoin usage. China\'s 2021 mining ban and India\'s repeated regulatory uncertainty demonstrate this is not hypothetical.',
    strideCategory: STRIDECategory.DENIAL_OF_SERVICE,
    strideRationale:
      'Classified as Denial of Service because regulatory bans aim to deny citizens access to the Bitcoin network, preventing them from using, mining, holding, or transacting in Bitcoin. While the protocol itself continues to function, users in restricted jurisdictions are effectively denied the service.',
    threatSource: ThreatSource.REGULATORY,
    affectedComponents: [
      AffectedComponent.MINING,
      AffectedComponent.WALLET,
    ],
    vulnerability:
      'Bitcoin\'s fiat on/off ramps (exchanges) are centralized and subject to regulatory jurisdiction. Mining operations require significant physical infrastructure and energy, making them visible and regulatable. While peer-to-peer usage is censorship-resistant, practical adoption depends on exchange accessibility and clear legal status.',
    exploitScenario:
      'The G7 nations, citing money laundering and sanctions evasion concerns, coordinate to implement a unified regulatory framework requiring all Bitcoin transactions to be conducted through licensed intermediaries with full KYC/AML compliance. Self-custodial wallets interacting with non-compliant counterparties face penalties. Mining operations must register and implement OFAC screening. This effectively creates a two-tier Bitcoin: regulated (permissioned) and unregulated (criminalized), fragmenting the network and cratering the price.',
    likelihood: 3 as const,
    likelihoodJustification:
      'Regulatory pressure on Bitcoin is ongoing and intensifying in some jurisdictions. The EU\'s MiCA regulation, US infrastructure bill reporting requirements, and China\'s outright ban demonstrate active regulatory intervention. However, countries like El Salvador adopting Bitcoin as legal tender show the regulatory landscape is not uniformly hostile. Rated Possible (3).',
    impact: 4 as const,
    impactJustification:
      'Coordinated regulatory action by major economies could severely restrict Bitcoin\'s liquidity, crash the price by 50-70%, and drive the ecosystem underground. However, Bitcoin\'s decentralized architecture means it cannot be technically shut down; usage would continue through VPNs, Tor, and P2P exchanges. The protocol survives but adoption is severely impacted. Rated Major (4).',
    severityScore: calculateSeverityScore(3, 4),
    riskRating: getSeverityRating(calculateSeverityScore(3, 4)),
    fairEstimates: {
      threatEventFrequency: 4,
      vulnerability: 0.25,
      lossEventFrequency: 4 * 0.25,
      primaryLossUSD: 50_000_000,
      secondaryLossUSD: 300_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(4, 0.25, 50_000_000, 300_000_000_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-11-1',
        threatId: 'threat-11',
        title: 'Regulatory Engagement and Compliance Frameworks',
        description:
          'Proactively engage with regulators and policymakers to educate them on Bitcoin\'s technology, develop reasonable compliance frameworks, and demonstrate the industry\'s commitment to preventing illicit use while preserving innovation. Support lobbying efforts by organizations like the Bitcoin Policy Institute and Coin Center.',
        effectiveness: 45,
        estimatedCostUSD: 10_000_000,
        timelineMonths: 36,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-11-2',
        threatId: 'threat-11',
        title: 'Decentralized Exchange and P2P Infrastructure',
        description:
          'Support development of decentralized exchange protocols (Bisq, RoboSats, HodlHodl) and P2P trading infrastructure that operates without centralized intermediaries, providing censorship-resistant fiat on/off ramps even in restrictive regulatory environments.',
        effectiveness: 55,
        estimatedCostUSD: 5_000_000,
        timelineMonths: 24,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'China Cryptocurrency Mining Ban Impact Analysis (2021)',
        url: 'https://www.cambridge.org/core/journals/journal-of-financial-economics/article/bitcoin-mining-ban/',
        type: 'RESEARCH',
      },
      {
        title: 'EU Markets in Crypto-Assets Regulation (MiCA) Framework',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114',
        type: 'NEWS',
      },
    ],
    dateIdentified: '2013-12-05',
    lastUpdated: '2025-10-15',
  },

  // -----------------------------------------------
  // 12. Double-Spend Attacks
  // -----------------------------------------------
  {
    id: 'threat-12',
    name: 'Double-Spend Attacks',
    description:
      'An attacker spends the same Bitcoin output twice by exploiting the delay between transaction broadcast and confirmation. Variants include zero-confirmation (0-conf) double-spends where conflicting transactions race to miners, Finney attacks where a miner pre-mines a block containing a conflicting transaction, and deep reorg attacks requiring significant hashrate.',
    strideCategory: STRIDECategory.REPUDIATION,
    strideRationale:
      'Classified as Repudiation because the attacker effectively repudiates a payment they previously made. They send a transaction (e.g., to a merchant), receive goods or services, then broadcast a conflicting transaction that redirects the funds back to themselves, denying the original payment ever occurred.',
    threatSource: ThreatSource.PROTOCOL,
    affectedComponents: [
      AffectedComponent.CONSENSUS,
      AffectedComponent.WALLET,
      AffectedComponent.SPV_CLIENT,
    ],
    vulnerability:
      'Bitcoin transactions are not final until they receive sufficient confirmations (typically 6 blocks). Zero-confirmation transactions are vulnerable to replacement by conflicting transactions with higher fees (RBF) or through miner collusion. SPV clients are especially vulnerable as they cannot fully validate the chain.',
    exploitScenario:
      'An attacker visits a physical Bitcoin ATM that credits fiat after 0 confirmations. They broadcast a Bitcoin transaction to the ATM\'s address while simultaneously broadcasting a conflicting transaction (paying themselves) with a higher fee via a direct connection to major mining pools. The higher-fee transaction gets mined, the ATM\'s transaction is dropped from the mempool, but the attacker has already collected the fiat. For larger amounts, the attacker could use a Finney attack variant.',
    likelihood: 2 as const,
    likelihoodJustification:
      'Zero-confirmation double-spends are feasible but increasingly mitigated by mempool policies (first-seen rule), RBF signaling detection, and merchant caution. Deep reorg double-spends require significant hashrate. The Bitcoin network has not experienced a confirmed double-spend on confirmed transactions. Rated Unlikely (2).',
    impact: 4 as const,
    impactJustification:
      'A successful double-spend on confirmed transactions would directly undermine Bitcoin\'s fundamental property of immutability. While 0-conf double-spends are limited to individual transaction values, a deep reorg double-spend could involve millions of dollars and would severely damage confidence in Bitcoin\'s settlement finality. Rated Major (4).',
    severityScore: calculateSeverityScore(2, 4),
    riskRating: getSeverityRating(calculateSeverityScore(2, 4)),
    fairEstimates: {
      threatEventFrequency: 5,
      vulnerability: 0.1,
      lossEventFrequency: 5 * 0.1,
      primaryLossUSD: 5_000_000,
      secondaryLossUSD: 50_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(5, 0.1, 5_000_000, 50_000_000),
    },
    nistStage: NistRmfStage.IMPLEMENT,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-12-1',
        threatId: 'threat-12',
        title: 'Confirmation Depth Standards for Merchants',
        description:
          'Establish and promote industry standards for minimum confirmation requirements based on transaction value: 0-conf for micro-payments (<$50), 1 confirmation for small ($50-$1000), 3 confirmations for medium ($1K-$100K), and 6+ confirmations for large transactions (>$100K).',
        effectiveness: 75,
        estimatedCostUSD: 100_000,
        timelineMonths: 6,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: ['BIP-125'],
    evidenceSources: [
      {
        title: 'Two Bitcoins at the Price of One: Double-Spending Attacks on Fast Payments',
        url: 'https://eprint.iacr.org/2012/248.pdf',
        type: 'RESEARCH',
      },
      {
        title: 'BIP-125: Opt-in Full Replace-by-Fee Signaling',
        url: 'https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki',
        type: 'BIP',
      },
    ],
    dateIdentified: '2008-10-31',
    lastUpdated: '2025-02-14',
  },

  // -----------------------------------------------
  // 13. Dust Attacks & Chain Analysis
  // -----------------------------------------------
  {
    id: 'threat-13',
    name: 'Dust Attacks & Chain Analysis',
    description:
      'Attackers send tiny amounts of Bitcoin (dust) to many addresses to track their spending patterns when the dust is consolidated with other UTXOs. Combined with sophisticated chain analysis techniques (common-input-ownership heuristics, change detection, timing analysis), this enables deanonymization of Bitcoin users, linking pseudonymous addresses to real-world identities.',
    strideCategory: STRIDECategory.INFORMATION_DISCLOSURE,
    strideRationale:
      'Classified as Information Disclosure because the attack reveals private information about Bitcoin users: their transaction history, wallet balances, spending patterns, and potentially real-world identities. The attack exploits Bitcoin\'s transparent ledger to disclose information users expected to remain pseudonymous.',
    threatSource: ThreatSource.OPERATIONAL,
    affectedComponents: [
      AffectedComponent.WALLET,
      AffectedComponent.P2P_NETWORK,
    ],
    vulnerability:
      'Bitcoin\'s UTXO model and transparent blockchain enable powerful chain analysis. When a wallet spends multiple UTXOs (including dust) in a single transaction, the common-input-ownership heuristic links all input addresses to the same entity. Change output detection and temporal analysis further erode privacy.',
    exploitScenario:
      'A chain analysis firm sends 546-satoshi (dust limit) outputs to 100,000 Bitcoin addresses associated with darknet marketplaces, privacy tools, and sanctioned entities. When any of these addresses spend the dust alongside their other UTXOs, the firm can link previously unconnected addresses, map the entity\'s entire wallet cluster, and estimate their total holdings. This intelligence is sold to law enforcement agencies and compliance departments.',
    likelihood: 4 as const,
    likelihoodJustification:
      'Dust attacks and chain analysis are ongoing, industrialized activities. Companies like Chainalysis, Elliptic, and Crystal operate at scale, maintaining extensive address clusters. Dust attacks have been documented on the Bitcoin mainnet repeatedly. The tools and techniques are mature and widely available. Rated Likely (4).',
    impact: 2 as const,
    impactJustification:
      'Privacy erosion is significant but does not directly result in fund theft or protocol compromise. The impact is primarily on user privacy and fungibility. While individual consequences can be severe (government targeting, blackmail), the systemic impact on Bitcoin\'s functionality is limited. Rated Minor (2).',
    severityScore: calculateSeverityScore(4, 2),
    riskRating: getSeverityRating(calculateSeverityScore(4, 2)),
    fairEstimates: {
      threatEventFrequency: 50,
      vulnerability: 0.6,
      lossEventFrequency: 50 * 0.6,
      primaryLossUSD: 1_000,
      secondaryLossUSD: 50_000,
      annualizedLossExpectancy: calculateFAIRRisk(50, 0.6, 1_000, 50_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-13-1',
        threatId: 'threat-13',
        title: 'UTXO Management and Coin Control Education',
        description:
          'Develop wallet software features and user education materials promoting proper UTXO management: coin control (manual input selection), dust filtering (never spending dust outputs), label-based coin segregation, and CoinJoin integration for regular privacy maintenance.',
        effectiveness: 60,
        estimatedCostUSD: 300_000,
        timelineMonths: 12,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-13-2',
        threatId: 'threat-13',
        title: 'PayJoin and CoinJoin Protocol Adoption',
        description:
          'Promote widespread adoption of PayJoin (P2EP) for regular transactions and CoinJoin for consolidation, both of which break the common-input-ownership heuristic that chain analysis relies on. Integrate these protocols into mainstream wallet software by default.',
        effectiveness: 70,
        estimatedCostUSD: 1_000_000,
        timelineMonths: 24,
        status: 'PLANNED',
        relatedBIPs: ['BIP-78'],
      },
    ],
    relatedBIPs: ['BIP-78'],
    evidenceSources: [
      {
        title: 'An Analysis of Bitcoin Dust and Its Impact on Privacy',
        url: 'https://arxiv.org/abs/2009.07845',
        type: 'RESEARCH',
      },
      {
        title: 'A Fistful of Bitcoins: Characterizing Payments Among Men with No Names (Meiklejohn et al.)',
        url: 'https://cseweb.ucsd.edu/~smeiklejohn/files/imc13.pdf',
        type: 'RESEARCH',
      },
    ],
    dateIdentified: '2018-10-29',
    lastUpdated: '2025-08-20',
  },

  // -----------------------------------------------
  // 14. Time-Warp Attack
  // -----------------------------------------------
  {
    id: 'threat-14',
    name: 'Time-Warp Attack',
    description:
      'A majority miner exploits Bitcoin\'s difficulty adjustment algorithm by manipulating block timestamps. By setting timestamps on the last block of each 2016-block difficulty period to be far in the future and timestamps on other blocks to be in the past, the attacker can trick the difficulty adjustment into lowering difficulty, allowing them to mine blocks at an artificially accelerated rate.',
    strideCategory: STRIDECategory.TAMPERING,
    strideRationale:
      'Classified as Tampering because the attacker manipulates block timestamp data to corrupt the difficulty adjustment algorithm, modifying the network\'s intended block production rate and potentially the issuance schedule of new Bitcoin.',
    threatSource: ThreatSource.PROTOCOL,
    affectedComponents: [
      AffectedComponent.CONSENSUS,
      AffectedComponent.MINING,
    ],
    vulnerability:
      'Bitcoin\'s difficulty adjustment algorithm only checks that block timestamps are greater than the median of the previous 11 blocks and less than 2 hours in the future from the node\'s local time. There is a known off-by-one bug where the difficulty calculation uses the timestamp of the first block in the period versus the last block, allowing timestamp manipulation to skew the perceived elapsed time.',
    exploitScenario:
      'A mining cartel controlling >50% hashrate systematically manipulates timestamps over several difficulty periods. They set the last block of each period to have a timestamp far in the future (but within the 2-hour limit for any individual block), while keeping other blocks\' timestamps low. Over several periods, this causes the difficulty adjustment to lower difficulty dramatically. The attacker can then mine blocks much faster than the intended 10-minute interval, accelerating Bitcoin issuance and potentially mining years of subsidies in weeks.',
    likelihood: 1 as const,
    likelihoodJustification:
      'The time-warp attack requires sustained majority hashrate control over multiple difficulty periods (weeks to months). It is fundamentally a variant of the 51% attack with an additional exploitation of the timestamp rules. The attack has been known since 2010 and a fix has been proposed (included in consensus cleanup proposals). Rated Rare (1).',
    impact: 4 as const,
    impactJustification:
      'If executed, the time-warp attack could dramatically accelerate Bitcoin\'s issuance schedule, undermining the fixed supply guarantee. Accelerated block production would also destabilize fee markets and transaction confirmation times. The economic damage would be severe but requires 51% hashrate to execute. Rated Major (4).',
    severityScore: calculateSeverityScore(1, 4),
    riskRating: getSeverityRating(calculateSeverityScore(1, 4)),
    fairEstimates: {
      threatEventFrequency: 0.01,
      vulnerability: 0.9,
      lossEventFrequency: 0.01 * 0.9,
      primaryLossUSD: 5_000_000_000,
      secondaryLossUSD: 50_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.01, 0.9, 5_000_000_000, 50_000_000_000),
    },
    nistStage: NistRmfStage.SELECT,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-14-1',
        threatId: 'threat-14',
        title: 'Consensus Cleanup Soft Fork (Timestamp Rule Fix)',
        description:
          'Implement the consensus cleanup soft fork proposal that fixes the time-warp vulnerability by requiring the first block of each new difficulty period to have a timestamp no earlier than a threshold relative to the last block of the previous period, eliminating the timestamp manipulation vector.',
        effectiveness: 95,
        estimatedCostUSD: 500_000,
        timelineMonths: 18,
        status: 'PLANNED',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'Bitcoin Time-Warp Attack Explained',
        url: 'https://bitcoinops.org/en/topics/time-warp/',
        type: 'RESEARCH',
      },
      {
        title: 'Great Consensus Cleanup Proposal (Matt Corallo)',
        url: 'https://github.com/TheBlueMatt/bips/blob/cleanup-softfork/bip-XXXX.mediawiki',
        type: 'BIP',
      },
    ],
    dateIdentified: '2010-07-20',
    lastUpdated: '2025-05-01',
  },

  // -----------------------------------------------
  // 15. ASIC Manufacturer Backdoors
  // -----------------------------------------------
  {
    id: 'threat-15',
    name: 'ASIC Manufacturer Backdoors',
    description:
      'ASIC mining hardware manufacturers (predominantly Bitmain, MicroBT, Canaan) could embed hardware or firmware backdoors in mining equipment that allow the manufacturer to remotely disable miners, redirect hashrate, or exfiltrate mining rewards. The Antbleed vulnerability discovered in Bitmain miners in 2017 demonstrated this risk is real.',
    strideCategory: STRIDECategory.ELEVATION_OF_PRIVILEGE,
    strideRationale:
      'Classified as Elevation of Privilege because a backdoor gives the ASIC manufacturer unauthorized administrative control over mining hardware they have sold, allowing them to elevate their privilege from hardware vendor to controller of their customers\' hashrate and mining operations.',
    threatSource: ThreatSource.SUPPLY_CHAIN,
    affectedComponents: [
      AffectedComponent.MINING,
    ],
    vulnerability:
      'ASIC mining hardware runs proprietary firmware with limited public audit capability. The hardware supply chain is concentrated among a few Chinese manufacturers. Firmware updates are typically delivered over the internet without cryptographic verification, and many mining operations run firmware provided by the manufacturer without independent review.',
    exploitScenario:
      'An ASIC manufacturer embeds a dormant backdoor in mining firmware that can be activated via a command from the manufacturer\'s server. Under government pressure, the manufacturer activates the backdoor, remotely shutting down all ASICs sold to entities in a targeted country. This instantly removes 20-30% of network hashrate, dropping difficulty and destabilizing block production. Alternatively, the manufacturer uses the backdoor to redirect hashrate to their own pool during a contentious fork, swinging the outcome.',
    likelihood: 2 as const,
    likelihoodJustification:
      'The Antbleed vulnerability (2017) proved that Bitmain had code capable of remotely disabling miners. While it was presented as an anti-theft feature, the capability exists. ASIC firmware is rarely audited, and manufacturers have economic and geopolitical incentives. However, discovery would be commercially devastating. Rated Unlikely (2).',
    impact: 4 as const,
    impactJustification:
      'A coordinated activation of backdoors across a manufacturer\'s installed base could disrupt 20-40% of hashrate, destabilize block production, and create a window for double-spend attacks. The revelation that major ASIC hardware has backdoors would shatter trust in mining equipment supply chains. Rated Major (4).',
    severityScore: calculateSeverityScore(2, 4),
    riskRating: getSeverityRating(calculateSeverityScore(2, 4)),
    fairEstimates: {
      threatEventFrequency: 0.1,
      vulnerability: 0.3,
      lossEventFrequency: 0.1 * 0.3,
      primaryLossUSD: 2_000_000_000,
      secondaryLossUSD: 20_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.1, 0.3, 2_000_000_000, 20_000_000_000),
    },
    nistStage: NistRmfStage.ASSESS,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-15-1',
        threatId: 'threat-15',
        title: 'Open-Source ASIC Firmware Development',
        description:
          'Support development and adoption of open-source ASIC firmware (e.g., Braiins OS) that replaces manufacturer firmware, eliminating potential backdoors. Promote industry standards requiring open-source firmware options for all commercial mining hardware.',
        effectiveness: 80,
        estimatedCostUSD: 3_000_000,
        timelineMonths: 24,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
      {
        id: 'rem-15-2',
        threatId: 'threat-15',
        title: 'ASIC Hardware Supply Chain Diversification',
        description:
          'Encourage diversification of ASIC manufacturing across multiple vendors and geographies. Support new ASIC designers (e.g., Intel, Auradine, Block/ASIC) to reduce dependence on the current oligopoly of Chinese manufacturers.',
        effectiveness: 60,
        estimatedCostUSD: 50_000_000,
        timelineMonths: 48,
        status: 'PLANNED',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'Antbleed: Bitmain Remote Shutdown Vulnerability (2017)',
        url: 'https://www.antbleed.com',
        type: 'CVE',
      },
      {
        title: 'ASIC Mining Hardware Security Audit Report',
        url: 'https://braiins.com/blog/asic-firmware-security',
        type: 'RESEARCH',
      },
    ],
    dateIdentified: '2017-04-26',
    lastUpdated: '2025-06-15',
  },

  // -----------------------------------------------
  // 16. Taproot Script Vulnerabilities
  // -----------------------------------------------
  {
    id: 'threat-16',
    name: 'Taproot Script Vulnerabilities',
    description:
      'The Taproot upgrade (BIPs 340/341/342) introduced Schnorr signatures, MAST (Merklized Abstract Syntax Trees), and Tapscript to Bitcoin. While extensively reviewed, the new script engine and witness validation logic present a novel attack surface. Bugs in Tapscript interpretation, witness size validation, or Schnorr batch verification could potentially be exploited.',
    strideCategory: STRIDECategory.TAMPERING,
    strideRationale:
      'Classified as Tampering because a vulnerability in Tapscript or Schnorr signature verification could allow an attacker to create transactions that appear valid but violate consensus rules, or construct scripts that behave unexpectedly, tampering with the integrity of Bitcoin\'s transaction validation.',
    threatSource: ThreatSource.PROTOCOL,
    affectedComponents: [
      AffectedComponent.SCRIPT_ENGINE,
      AffectedComponent.CONSENSUS,
    ],
    vulnerability:
      'Taproot introduces significant new code paths in Bitcoin Core\'s consensus validation: Schnorr signature verification (libsecp256k1), Tapscript opcode semantics, witness version 1 handling, and key-path/script-path spending validation. Each new code path is a potential source of consensus bugs, particularly in edge cases involving malformed witnesses or unusual script constructions.',
    exploitScenario:
      'A security researcher discovers that a specific combination of Tapscript opcodes, when used with a particular witness structure, causes different Bitcoin Core versions to evaluate the script differently (consensus split). An attacker crafts a transaction exploiting this discrepancy: half the network considers it valid, the other half rejects it, causing a chain split. The attacker double-spends during the confusion. Alternatively, a batch Schnorr verification bug allows forged signatures to pass validation.',
    likelihood: 2 as const,
    likelihoodJustification:
      'Taproot underwent years of review before activation in November 2021. The libsecp256k1 library has been extensively tested and formally verified in parts. However, the Tapscript VM is relatively new compared to legacy Script, and complex interactions between opcodes may harbor undiscovered bugs. Rated Unlikely (2).',
    impact: 3 as const,
    impactJustification:
      'A Tapscript vulnerability would likely be caught early due to extensive fuzzing and testing. The blast radius depends on the bug: a consensus split would be severe but likely quickly patched via emergency release. A signature forgery would be more damaging but is less likely given libsecp256k1\'s maturity. Rated Moderate (3).',
    severityScore: calculateSeverityScore(2, 3),
    riskRating: getSeverityRating(calculateSeverityScore(2, 3)),
    fairEstimates: {
      threatEventFrequency: 0.2,
      vulnerability: 0.1,
      lossEventFrequency: 0.2 * 0.1,
      primaryLossUSD: 500_000_000,
      secondaryLossUSD: 5_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(0.2, 0.1, 500_000_000, 5_000_000_000),
    },
    nistStage: NistRmfStage.ASSESS,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-16-1',
        threatId: 'threat-16',
        title: 'Continuous Tapscript Fuzzing and Formal Verification',
        description:
          'Fund continuous differential fuzzing of Tapscript execution across multiple Bitcoin implementations (Core, btcd, rust-bitcoin) to detect consensus discrepancies. Expand formal verification of libsecp256k1 Schnorr signature code and critical Tapscript opcode implementations.',
        effectiveness: 75,
        estimatedCostUSD: 2_000_000,
        timelineMonths: 24,
        status: 'IN_PROGRESS',
        relatedBIPs: ['BIP-340', 'BIP-341', 'BIP-342'],
      },
    ],
    relatedBIPs: ['BIP-340', 'BIP-341', 'BIP-342'],
    evidenceSources: [
      {
        title: 'BIP-340: Schnorr Signatures for secp256k1',
        url: 'https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki',
        type: 'BIP',
      },
      {
        title: 'Security Analysis of Tapscript (Poelstra, 2020)',
        url: 'https://medium.com/blockstream/tapscript-new-opcodes-for-taproot-5e2e2e2e2e2e',
        type: 'RESEARCH',
      },
    ],
    dateIdentified: '2021-11-14',
    lastUpdated: '2025-07-10',
  },

  // -----------------------------------------------
  // 17. Energy FUD & ESG Pressure
  // -----------------------------------------------
  {
    id: 'threat-17',
    name: 'Energy FUD & ESG Pressure',
    description:
      'Environmental, Social, and Governance (ESG) advocates and media narratives portray Bitcoin mining as environmentally destructive, comparing its energy consumption to small countries. This narrative pressures institutional investors, regulators, and corporate treasuries to divest from or avoid Bitcoin, and motivates legislative efforts to ban or restrict proof-of-work mining.',
    strideCategory: STRIDECategory.DENIAL_OF_SERVICE,
    strideRationale:
      'Classified as Denial of Service because ESG pressure campaigns aim to deny Bitcoin miners access to energy, deny institutional investors the ability to hold Bitcoin, and deny the network participation from regulated entities. The goal is to make Bitcoin operationally or reputationally unfeasible.',
    threatSource: ThreatSource.SOCIAL_MEDIA,
    affectedComponents: [
      AffectedComponent.MINING,
    ],
    vulnerability:
      'Bitcoin\'s proof-of-work consensus mechanism inherently requires significant energy expenditure. While this energy provides security, the narrative around its environmental impact is easily weaponized because energy consumption is measurable and comparable to national electricity usage, making it emotionally compelling regardless of the nuances around renewable energy usage and stranded energy utilization.',
    exploitScenario:
      'A coordinated campaign by ESG advocacy groups publishes a viral report claiming Bitcoin consumes more energy than Argentina and produces more CO2 than New Zealand. Mainstream media amplifies the report without context. Institutional investors face pressure from shareholders and ESG rating agencies to divest Bitcoin holdings. Several US states introduce bills banning proof-of-work mining. The New York State moratorium on certain mining operations becomes a template for other jurisdictions. Bitcoin\'s price drops 15-20% as institutional capital exits.',
    likelihood: 4 as const,
    likelihoodJustification:
      'Energy FUD campaigns are actively ongoing. The New York State mining moratorium, EU Parliament\'s near-ban of proof-of-work, and continuous media coverage of Bitcoin\'s energy use demonstrate this is a present and persistent threat. ESG-driven divestment pressure is real and influential. Rated Likely (4).',
    impact: 2 as const,
    impactJustification:
      'While ESG pressure can cause short-term price drops and localized mining bans, Bitcoin mining has proven resilient by migrating to favorable jurisdictions (post-China ban). Mining increasingly uses renewable and stranded energy sources. The fundamental protocol is unaffected. The impact is primarily on price and geographic distribution of mining, not on Bitcoin\'s technical functionality. Rated Minor (2).',
    severityScore: calculateSeverityScore(4, 2),
    riskRating: getSeverityRating(calculateSeverityScore(4, 2)),
    fairEstimates: {
      threatEventFrequency: 24,
      vulnerability: 0.4,
      lossEventFrequency: 24 * 0.4,
      primaryLossUSD: 0,
      secondaryLossUSD: 50_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(24, 0.4, 0, 50_000_000_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-17-1',
        threatId: 'threat-17',
        title: 'Bitcoin Mining Energy Transparency Initiative',
        description:
          'Support transparent reporting of Bitcoin mining energy sources through the Bitcoin Mining Council and independent audits. Publish data demonstrating renewable energy percentage, methane capture mining, and stranded energy utilization to counter misleading narratives with verifiable data.',
        effectiveness: 50,
        estimatedCostUSD: 2_000_000,
        timelineMonths: 12,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'Cambridge Bitcoin Electricity Consumption Index',
        url: 'https://ccaf.io/cbnsi/cbeci',
        type: 'RESEARCH',
      },
      {
        title: 'Bitcoin Mining Council Global Survey Results',
        url: 'https://bitcoinminingcouncil.com',
        type: 'NEWS',
      },
    ],
    dateIdentified: '2017-11-15',
    lastUpdated: '2025-11-30',
  },

  // -----------------------------------------------
  // 18. Competing L1 Narratives
  // -----------------------------------------------
  {
    id: 'threat-18',
    name: 'Competing L1 Narratives',
    description:
      'Alternative Layer 1 blockchains (Ethereum, Solana, etc.) promote narratives that they will replace Bitcoin through superior technology (smart contracts, higher throughput, proof-of-stake efficiency). These narratives aim to redirect institutional capital, developer talent, and public attention away from Bitcoin, potentially fragmenting the cryptocurrency market and undermining Bitcoin\'s network effects.',
    strideCategory: STRIDECategory.DENIAL_OF_SERVICE,
    strideRationale:
      'Classified as Denial of Service because competing narratives aim to deny Bitcoin access to capital, developers, and mindshare. By capturing institutional investment and media attention, competing L1s seek to starve Bitcoin of the resources needed for ecosystem growth and adoption.',
    threatSource: ThreatSource.SOCIAL_MEDIA,
    affectedComponents: [
      AffectedComponent.P2P_NETWORK,
    ],
    vulnerability:
      'Bitcoin\'s conservative development approach and limited base-layer programmability create a narrative vulnerability. Competitors can point to higher transaction throughput, smart contract capabilities, and lower energy consumption as advantages. New investors without deep technical understanding may be swayed by marketing-driven comparisons.',
    exploitScenario:
      'A competing L1 raises billions in venture capital and deploys an aggressive marketing campaign claiming technological superiority. Major media outlets publish "Bitcoin Killer" narratives. Institutional investors, influenced by VC-funded research reports, allocate capital to the competitor at Bitcoin\'s expense. Developer talent migrates to the higher-funded ecosystem. Over several years, Bitcoin\'s developer community and institutional support base erode, weakening its network effect advantage.',
    likelihood: 3 as const,
    likelihoodJustification:
      'Competing L1 narratives are a constant presence in the cryptocurrency space. Every market cycle produces "Ethereum flippening" or "Bitcoin Killer" narratives. However, Bitcoin has maintained its dominance through multiple cycles, and no competitor has matched its decentralization, security track record, or network effects. Rated Possible (3).',
    impact: 2 as const,
    impactJustification:
      'Competing narratives cause short-term capital rotation but have not materially threatened Bitcoin\'s dominance over any multi-year period. Bitcoin\'s unique positioning as decentralized sound money is fundamentally different from smart contract platforms, making direct competition limited. The impact is primarily on relative market share rather than absolute value or functionality. Rated Minor (2).',
    severityScore: calculateSeverityScore(3, 2),
    riskRating: getSeverityRating(calculateSeverityScore(3, 2)),
    fairEstimates: {
      threatEventFrequency: 12,
      vulnerability: 0.1,
      lossEventFrequency: 12 * 0.1,
      primaryLossUSD: 0,
      secondaryLossUSD: 20_000_000_000,
      annualizedLossExpectancy: calculateFAIRRisk(12, 0.1, 0, 20_000_000_000),
    },
    nistStage: NistRmfStage.MONITOR,
    status: ThreatStatus.MONITORING,
    remediationStrategies: [
      {
        id: 'rem-18-1',
        threatId: 'threat-18',
        title: 'Bitcoin-Only Education and Institutional Research',
        description:
          'Fund independent research organizations and educational initiatives that articulate Bitcoin\'s unique value proposition: true decentralization, fixed supply, censorship resistance, and its role as a neutral monetary protocol. Counter competing narratives with data-driven analysis rather than rhetoric.',
        effectiveness: 35,
        estimatedCostUSD: 5_000_000,
        timelineMonths: 24,
        status: 'IN_PROGRESS',
        relatedBIPs: [],
      },
    ],
    relatedBIPs: [],
    evidenceSources: [
      {
        title: 'Bitcoin Dominance: A Long-Term Analysis of Market Cap Share',
        url: 'https://www.coingecko.com/en/global-charts',
        type: 'NEWS',
      },
      {
        title: 'Why Bitcoin Only: The Case Against Alternative Cryptocurrencies',
        url: 'https://bitcoin-only.com',
        type: 'WHITEPAPER',
      },
    ],
    dateIdentified: '2015-07-30',
    lastUpdated: '2025-10-22',
  },
];

// ===========================================
// Seed BIP Evaluations
// ===========================================

export const SEED_BIPS: BIPEvaluation[] = [
  {
    id: 'bip-eval-1',
    bipNumber: 'BIP-340/341/342',
    title: 'Taproot / Schnorr Signatures',
    summary:
      'The Taproot soft fork bundle (activated November 2021) introduces Schnorr signatures (BIP-340) for more efficient and private multi-signature schemes, Taproot (BIP-341) for Merkelized Alternative Script Trees (MAST) enabling complex spending conditions to appear as simple key-path spends, and Tapscript (BIP-342) for an upgraded script system. Together, these BIPs significantly improve privacy, efficiency, and smart contract capabilities on Bitcoin\'s base layer.',
    recommendation: BIPRecommendation.ESSENTIAL,
    necessityScore: 92,
    threatsAddressed: ['threat-1', 'threat-16'],
    mitigationEffectiveness: 75,
    communityConsensus: 95,
    implementationReadiness: 100,
    economicImpact:
      'Taproot reduces transaction sizes for multi-signature and complex script spending by 30-50%, lowering fees. It enables more efficient DLCs, Lightning channel opens/closes, and vault constructions. Schnorr signature aggregation provides the foundation for future cross-input signature aggregation (CISA), which could reduce block space usage by up to 30%.',
    adoptionPercentage: 55,
    status: 'ACTIVE',
    lastUpdated: '2025-09-15',
  },
  {
    id: 'bip-eval-2',
    bipNumber: 'BIP-141',
    title: 'Segregated Witness (SegWit)',
    summary:
      'Segregated Witness separates transaction signature data (witness) from the transaction structure, fixing transaction malleability, enabling the Lightning Network, and providing a block weight increase from 1MB to ~4MB effective capacity. Activated via soft fork in August 2017, SegWit is the most impactful protocol upgrade in Bitcoin\'s history after the initial release.',
    recommendation: BIPRecommendation.ESSENTIAL,
    necessityScore: 98,
    threatsAddressed: ['threat-3', 'threat-12'],
    mitigationEffectiveness: 95,
    communityConsensus: 92,
    implementationReadiness: 100,
    economicImpact:
      'SegWit enabled the Lightning Network, which processes millions of transactions per day with near-zero fees. Transaction fees for SegWit outputs are 30-40% lower than legacy outputs. SegWit adoption has reached ~85% of transactions, representing billions of dollars in cumulative fee savings.',
    adoptionPercentage: 85,
    status: 'ACTIVE',
    lastUpdated: '2025-01-10',
  },
  {
    id: 'bip-eval-3',
    bipNumber: 'BIP-119',
    title: 'CheckTemplateVerify (CTV)',
    summary:
      'CTV (OP_CHECKTEMPLATEVERIFY) is a proposed covenant opcode that allows a UTXO to commit to the exact transaction that can spend it, enabling trustless payment pools, non-interactive channel factories, congestion control via transaction batching, and simple vault constructions. CTV is one of the most discussed covenant proposals and has undergone multiple rounds of community review.',
    recommendation: BIPRecommendation.RECOMMENDED,
    necessityScore: 62,
    threatsAddressed: ['threat-10', 'threat-12'],
    mitigationEffectiveness: 55,
    communityConsensus: 45,
    implementationReadiness: 75,
    economicImpact:
      'CTV would enable significant fee savings through payment batching and congestion control (estimated 30-50% reduction in on-chain footprint for common use cases). Payment pools could bring self-custodial Lightning to millions of users currently priced out by on-chain costs. Vault constructions would reduce funds lost to phishing and key compromise.',
    adoptionPercentage: 0,
    status: 'PROPOSED',
    lastUpdated: '2025-08-20',
  },
  {
    id: 'bip-eval-4',
    bipNumber: 'BIP-300',
    title: 'Drivechains (Hashrate Escrows)',
    summary:
      'BIP-300 proposes a mechanism for creating sidechains secured by Bitcoin\'s proof-of-work through "hashrate escrows." Miners would vote on sidechain withdrawals over a 3-month period, enabling experimentation with alternative consensus rules, larger blocks, privacy features, and smart contracts on sidechains while keeping Bitcoin\'s base layer unchanged. The proposal is controversial due to concerns about miner extractable value and centralization.',
    recommendation: BIPRecommendation.OPTIONAL,
    necessityScore: 35,
    threatsAddressed: ['threat-18'],
    mitigationEffectiveness: 40,
    communityConsensus: 25,
    implementationReadiness: 50,
    economicImpact:
      'Drivechains could capture value currently flowing to competing L1s by enabling Bitcoin-secured sidechains for smart contracts, privacy, and scalability. However, concerns about miner centralization and MEV extraction on sidechains may offset benefits. The 3-month withdrawal period creates capital efficiency concerns for large users.',
    adoptionPercentage: 0,
    status: 'PROPOSED',
    lastUpdated: '2025-07-05',
  },
  {
    id: 'bip-eval-5',
    bipNumber: 'BIP-324',
    title: 'Version 2 P2P Encrypted Transport Protocol',
    summary:
      'BIP-324 defines an encrypted and authenticated transport protocol for Bitcoin\'s peer-to-peer network, replacing the current plaintext communication. The protocol provides confidentiality (preventing passive eavesdropping), optional authentication (preventing MITM attacks with known peers), and traffic shaping to resist traffic analysis by ISPs and state-level observers.',
    recommendation: BIPRecommendation.RECOMMENDED,
    necessityScore: 78,
    threatsAddressed: ['threat-5', 'threat-6', 'threat-7'],
    mitigationEffectiveness: 70,
    communityConsensus: 88,
    implementationReadiness: 90,
    economicImpact:
      'BIP-324 has minimal direct economic impact but significantly improves network resilience against partition attacks and surveillance, indirectly protecting the billions of dollars in value that depend on reliable P2P communication. The encrypted transport reduces the risk of state-level censorship and BGP hijacking attacks.',
    adoptionPercentage: 30,
    status: 'ACTIVE',
    lastUpdated: '2025-10-01',
  },
];

// ===========================================
// Seed FUD Analyses
// ===========================================

export const SEED_FUD: FUDAnalysis[] = [
  {
    id: 'fud-1',
    narrative: 'Quantum computers will break Bitcoin',
    category: FUDCategory.QUANTUM,
    validityScore: 15,
    status: 'PARTIALLY_VALID',
    evidenceFor: [
      'Shor\'s algorithm can theoretically derive ECDSA private keys from public keys in polynomial time on a sufficiently powerful quantum computer.',
      'Approximately 5-10 million BTC are in P2PK outputs where the public key is already exposed and immediately vulnerable to quantum attack.',
      'Nation-states (US, China, EU) are investing billions in quantum computing research with steady progress in qubit counts and error correction.',
    ],
    evidenceAgainst: [
      'Current quantum computers have ~1,500 physical qubits; breaking secp256k1 requires an estimated 2,500-4,000 logical qubits (millions of physical qubits with error correction).',
      'Most modern Bitcoin addresses use P2PKH/P2WPKH/P2TR where the public key is only revealed when spending, giving a commit-delay-reveal protection window.',
      'Post-quantum signature schemes (SPHINCS+, CRYSTALS-Dilithium) exist and can be deployed via soft fork when the threat becomes imminent.',
      'Bitcoin\'s developer community is actively researching post-quantum migration paths, and the network has demonstrated the ability to execute coordinated soft forks (SegWit, Taproot).',
    ],
    debunkSummary:
      'While quantum computing is a legitimate long-term concern, the threat is 10-20+ years away from being practically exploitable. Bitcoin has multiple defense paths including post-quantum signature migration, commit-delay-reveal protocols, and address hygiene practices. The narrative that quantum computers will suddenly "break" Bitcoin ignores the gradual nature of quantum computing advances and the cryptographic community\'s ability to respond proactively.',
    relatedThreats: ['threat-1'],
    priceImpactEstimate:
      'Quantum FUD narratives typically cause 2-5% short-term price dips when amplified by mainstream media, usually recovering within days. A genuine breakthrough in quantum computing could trigger a 15-25% correction until a clear migration plan is communicated.',
    lastSeen: '2025-10-15',
    lastUpdated: '2025-10-20',
  },
  {
    id: 'fud-2',
    narrative: 'Bitcoin will be banned by governments',
    category: FUDCategory.REGULATION,
    validityScore: 25,
    status: 'PARTIALLY_VALID',
    evidenceFor: [
      'China effectively banned Bitcoin mining and exchange operations in 2021, demonstrating that major economies can and will take aggressive regulatory action.',
      'The EU Parliament came close to banning proof-of-work mining in 2022, and several jurisdictions have implemented restrictive KYC/AML requirements.',
      'FATF Travel Rule implementation is making compliant Bitcoin usage increasingly surveilled and regulated across member nations.',
    ],
    evidenceAgainst: [
      'El Salvador adopted Bitcoin as legal tender in 2021, and several countries (Switzerland, UAE, Singapore) have created favorable regulatory frameworks demonstrating the opposite trend.',
      'The United States approved Bitcoin spot ETFs in January 2024, institutionally legitimizing Bitcoin investment at the highest regulatory level.',
      'Bitcoin\'s decentralized architecture makes a complete ban technically impossible to enforce; usage continued in China via VPNs and P2P exchanges after the ban.',
      'Game theory suggests that countries banning Bitcoin will lose economic competitiveness to Bitcoin-friendly jurisdictions, creating a regulatory race to the bottom.',
    ],
    debunkSummary:
      'While individual countries can and have restricted Bitcoin operations, a coordinated global ban is implausible given divergent national interests, Bitcoin\'s US ETF approval, and El Salvador\'s legal tender adoption. Bitcoin survived China\'s mining ban with hashrate recovering within months. The regulatory trend is increasingly toward framework development rather than prohibition, as evidenced by MiCA, US ETFs, and growing central bank engagement.',
    relatedThreats: ['threat-11'],
    priceImpactEstimate:
      'Major regulatory actions (China ban, SEC enforcement) have historically caused 20-40% price corrections over weeks, but the market has recovered and made new highs within 6-12 months each time. The US ETF approval marked a structural shift toward regulatory acceptance.',
    lastSeen: '2025-11-05',
    lastUpdated: '2025-11-10',
  },
  {
    id: 'fud-3',
    narrative: 'Bitcoin mining destroys the environment',
    category: FUDCategory.ENERGY,
    validityScore: 35,
    status: 'PARTIALLY_VALID',
    evidenceFor: [
      'Bitcoin mining consumes approximately 150-200 TWh annually, comparable to a mid-sized country like Poland or Egypt.',
      'Some mining operations use fossil fuel energy sources, contributing to carbon emissions. Early mining growth in China relied heavily on coal-powered electricity.',
      'The energy consumption is proportional to Bitcoin\'s price and mining profitability, meaning it will continue to grow with adoption.',
    ],
    evidenceAgainst: [
      'The Bitcoin Mining Council reports that ~60% of Bitcoin mining uses renewable energy sources, higher than almost any other industry globally.',
      'Bitcoin mining acts as a buyer of last resort for stranded renewable energy (hydroelectric in rural areas, flared natural gas, excess wind/solar), actually incentivizing renewable energy development.',
      'Methane capture mining converts potent greenhouse gases (84x CO2 warming potential) into CO2, providing a net environmental benefit at flare gas and landfill sites.',
      'Bitcoin\'s energy consumption secures a $1T+ monetary network; comparing it to country-level consumption without comparing to country-level economic output is misleading. The banking system, gold mining, and military-backed fiat currencies consume far more energy.',
    ],
    debunkSummary:
      'Bitcoin mining does consume significant energy, but the narrative that it "destroys the environment" is misleading. The majority of mining uses renewable energy, and Bitcoin mining increasingly serves as an incentive for renewable energy development and methane capture. The correct comparison is not Bitcoin vs. zero energy, but Bitcoin vs. the energy cost of alternative monetary systems (banking infrastructure, gold mining, military enforcement of fiat currencies), where Bitcoin compares favorably.',
    relatedThreats: ['threat-17'],
    priceImpactEstimate:
      'Energy FUD narratives create persistent background selling pressure (estimated 2-5% drag during peak media coverage) and have influenced regulatory action (NY moratorium). However, the improving data on renewable energy usage is gradually neutralizing this narrative among institutional investors.',
    lastSeen: '2025-12-01',
    lastUpdated: '2025-12-05',
  },
  {
    id: 'fud-4',
    narrative: 'Bitcoin can\'t scale for global payments',
    category: FUDCategory.SCALABILITY,
    validityScore: 40,
    status: 'PARTIALLY_VALID',
    evidenceFor: [
      'Bitcoin\'s base layer processes approximately 7 transactions per second, compared to Visa\'s 24,000 TPS capacity. A global payment system would require orders of magnitude more throughput.',
      'On-chain transaction fees can spike to $50-100+ during periods of high demand, making small-value payments economically impractical on the base layer.',
      'Block size is effectively limited to ~4MB (with SegWit), and there is strong community resistance to increasing it, constraining on-chain scalability.',
    ],
    evidenceAgainst: [
      'The Lightning Network provides Layer 2 scaling with millions of daily transactions, near-instant settlement, and sub-cent fees. Lightning capacity and adoption continue to grow exponentially.',
      'Bitcoin was designed as a settlement layer, not a retail payment network. Comparing base-layer TPS to Visa is a category error; Visa is also a Layer 2 system settling on the banking system.',
      'Technologies like channel factories, payment pools (enabled by CTV), and federated Chaumian mints (Fedimint, Cashu) provide additional scaling pathways without modifying the base protocol.',
      'The Lightning Network already supports streaming micropayments (fractions of a cent) that are impossible on any traditional payment system, demonstrating that Bitcoin actually scales beyond what legacy systems can achieve.',
    ],
    debunkSummary:
      'The scalability critique conflates base-layer throughput with total system capacity. Bitcoin\'s architecture intentionally limits base-layer throughput to maintain decentralization and security while scaling through layers (Lightning, sidechains, Fedimint). This is analogous to how the internet scales: TCP/IP has limited bandwidth, but application-layer protocols built on top enable massive throughput. Lightning Network already demonstrates that Bitcoin can support millions of instant, near-free transactions daily.',
    relatedThreats: ['threat-18'],
    priceImpactEstimate:
      'Scalability FUD has diminishing market impact as Lightning Network adoption grows. During the 2017 block size wars, it caused significant price volatility. Currently, it contributes to a modest 1-3% drag during periods of high on-chain fee spikes but is increasingly countered by visible Lightning growth metrics.',
    lastSeen: '2025-09-20',
    lastUpdated: '2025-09-25',
  },
  {
    id: 'fud-5',
    narrative: 'Altcoins will replace Bitcoin',
    category: FUDCategory.COMPETITION,
    validityScore: 10,
    status: 'DEBUNKED',
    evidenceFor: [
      'Some alternative blockchains offer features Bitcoin lacks: Turing-complete smart contracts (Ethereum), higher base-layer throughput (Solana), and built-in privacy (Monero).',
      'Bitcoin\'s market dominance has fluctuated between 40-70% over its history, showing that capital does flow to competitors during bull markets.',
    ],
    evidenceAgainst: [
      'Bitcoin\'s network effects (hashrate, node count, liquidity, brand recognition) are orders of magnitude larger than any competitor. First-mover advantage in money is more durable than in technology.',
      'Bitcoin dominance has recovered to 55-65% in every cycle, and no altcoin has sustained a challenge to Bitcoin\'s monetary premium over multiple market cycles.',
      'The "Bitcoin Killer" narrative has been recycled with different altcoins every cycle since 2013 (Litecoin, Ethereum, EOS, Solana) without any actually displacing Bitcoin.',
      'Bitcoin and smart contract platforms serve fundamentally different purposes: Bitcoin is a monetary asset (store of value, medium of exchange), while smart contract platforms are computing platforms. They are not direct competitors any more than gold competes with Amazon Web Services.',
    ],
    debunkSummary:
      'The "altcoins will replace Bitcoin" narrative fundamentally misunderstands Bitcoin\'s value proposition. Bitcoin\'s primary innovation is credible monetary policy (fixed supply, decentralized issuance) and censorship-resistant value transfer, not general-purpose computation. No altcoin has matched Bitcoin\'s decentralization, security track record, or Lindy effect. The narrative confuses feature competition (more features = better) with monetary competition (credibility and network effects = better), and has been empirically debunked across multiple market cycles.',
    relatedThreats: ['threat-18'],
    priceImpactEstimate:
      'Altcoin competition narratives cause temporary capital rotation during bull markets (5-15% relative underperformance vs altcoin indices during "alt seasons") but have zero long-term price impact. Bitcoin has recovered dominance and made new all-time highs after every "flippening" scare.',
    lastSeen: '2025-08-15',
    lastUpdated: '2025-08-20',
  },
];
