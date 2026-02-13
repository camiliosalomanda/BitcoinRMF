export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          password_hash: string;
          role: 'admin' | 'analyst' | 'user';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          password_hash: string;
          role?: 'admin' | 'analyst' | 'user';
        };
        Update: {
          email?: string;
          name?: string | null;
          password_hash?: string;
          role?: 'admin' | 'analyst' | 'user';
        };
      };
      threats: {
        Row: {
          id: string;
          name: string;
          description: string;
          stride_category: string;
          stride_rationale: string | null;
          threat_source: string;
          affected_components: string[];
          vulnerability: string | null;
          exploit_scenario: string | null;
          likelihood: number;
          likelihood_justification: string | null;
          impact: number;
          impact_justification: string | null;
          severity_score: number;
          risk_rating: string;
          fair_tef: number | null;
          fair_vulnerability: number | null;
          fair_lef: number | null;
          fair_primary_loss_usd: number | null;
          fair_secondary_loss_usd: number | null;
          fair_ale: number | null;
          nist_stage: string;
          status: string;
          related_bips: string[];
          evidence_sources: unknown;
          created_by: string | null;
          date_identified: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          stride_category: string;
          threat_source: string;
          likelihood: number;
          impact: number;
          stride_rationale?: string | null;
          affected_components?: string[];
          vulnerability?: string | null;
          exploit_scenario?: string | null;
          likelihood_justification?: string | null;
          impact_justification?: string | null;
          fair_tef?: number | null;
          fair_vulnerability?: number | null;
          fair_lef?: number | null;
          fair_primary_loss_usd?: number | null;
          fair_secondary_loss_usd?: number | null;
          fair_ale?: number | null;
          nist_stage?: string;
          status?: string;
          related_bips?: string[];
          evidence_sources?: unknown;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['threats']['Insert']>;
      };
      remediation_strategies: {
        Row: {
          id: string;
          threat_id: string;
          title: string;
          description: string | null;
          effectiveness: number | null;
          estimated_cost_usd: number | null;
          timeline_months: number | null;
          status: string;
          related_bips: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          threat_id: string;
          title: string;
          description?: string | null;
          effectiveness?: number | null;
          estimated_cost_usd?: number | null;
          timeline_months?: number | null;
          status?: string;
          related_bips?: string[];
        };
        Update: Partial<Database['public']['Tables']['remediation_strategies']['Insert']>;
      };
      bip_evaluations: {
        Row: {
          id: string;
          bip_number: string;
          title: string;
          summary: string | null;
          recommendation: string | null;
          necessity_score: number | null;
          threats_addressed: string[];
          mitigation_effectiveness: number | null;
          community_consensus: number | null;
          implementation_readiness: number | null;
          economic_impact: string | null;
          adoption_percentage: number | null;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bip_number: string;
          title: string;
          summary?: string | null;
          recommendation?: string | null;
          necessity_score?: number | null;
          threats_addressed?: string[];
          mitigation_effectiveness?: number | null;
          community_consensus?: number | null;
          implementation_readiness?: number | null;
          economic_impact?: string | null;
          adoption_percentage?: number | null;
          status?: string;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['bip_evaluations']['Insert']>;
      };
      fud_analyses: {
        Row: {
          id: string;
          narrative: string;
          category: string;
          validity_score: number | null;
          status: string;
          evidence_for: string[];
          evidence_against: string[];
          debunk_summary: string | null;
          related_threats: string[];
          price_impact_estimate: string | null;
          last_seen: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          narrative: string;
          category: string;
          validity_score?: number | null;
          status?: string;
          evidence_for?: string[];
          evidence_against?: string[];
          debunk_summary?: string | null;
          related_threats?: string[];
          price_impact_estimate?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['fud_analyses']['Insert']>;
      };
    };
  };
}
