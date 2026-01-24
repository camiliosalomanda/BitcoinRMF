import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* Gradient orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px] bg-violet-500/15 rounded-full blur-[80px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/25">
            B
          </div>
          <span className="text-xl font-semibold tracking-tight">BizAI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link 
            href="/dashboard" 
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/10"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI-Powered Executive Suite
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Your AI
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              C-Suite Team
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Strategic AI executives that collaborate to run your business. 
            Get CFO-level financial insights, CMO marketing strategy, and more—all working together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Start with AI CFO
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Executive Cards */}
        <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              role: "CFO",
              title: "Chief Financial Officer",
              icon: "💰",
              color: "emerald",
              status: "Available",
              features: ["Cash flow forecasting", "Budget management", "Financial insights"],
            },
            {
              role: "CMO",
              title: "Chief Marketing Officer",
              icon: "📈",
              color: "violet",
              status: "Available",
              features: ["Marketing strategy", "Campaign planning", "Brand positioning"],
            },
            {
              role: "COO",
              title: "Chief Operating Officer",
              icon: "⚙️",
              color: "amber",
              status: "Available",
              features: ["Operations optimization", "Process improvement", "Vendor management"],
            },
            {
              role: "CTO",
              title: "Chief Technology Officer",
              icon: "💻",
              color: "blue",
              status: "Available",
              features: ["Tech strategy", "Security & architecture", "Tool evaluation"],
            },
            {
              role: "CHRO",
              title: "Chief HR Officer",
              icon: "👥",
              color: "pink",
              status: "Available",
              features: ["Talent strategy", "Culture building", "Hiring guidance"],
            },
            {
              role: "CCO",
              title: "Chief Compliance Officer",
              icon: "⚖️",
              color: "indigo",
              status: "Available",
              features: ["Regulatory compliance", "Risk management", "Policy guidance"],
            },
          ].map((exec) => (
            <div
              key={exec.role}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
                exec.status === "Available"
                  ? "bg-gradient-to-b from-white/[0.08] to-transparent border-white/10 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              {/* Status badge */}
              <div className={`absolute top-4 right-4 px-2 py-1 rounded-md text-xs font-medium ${
                exec.status === "Available" 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-white/10 text-gray-500"
              }`}>
                {exec.status}
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4">{exec.icon}</div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-1">{exec.role}</h3>
              <p className="text-gray-500 text-sm mb-4">{exec.title}</p>

              {/* Features */}
              <ul className="space-y-2">
                {exec.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      exec.status === "Available" ? "bg-emerald-400" : "bg-gray-600"
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Hover action for available */}
              {exec.status === "Available" && (
                <Link
                  href="/dashboard"
                  className="mt-6 block w-full py-3 text-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium transition-all"
                >
                  Chat with {exec.role}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Collaboration Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Executives That
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent"> Collaborate</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-12">
            Your AI executives communicate with each other—CFO reviews marketing budgets, 
            COO flags operational bottlenecks, CHRO aligns hiring with growth plans.
          </p>

          {/* Collaboration diagram */}
          <div className="relative max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-violet-500/10 to-pink-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <span className="text-2xl">💰</span>
                  <p className="text-sm font-medium mt-2">CFO</p>
                </div>
                <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                  <span className="text-2xl">📈</span>
                  <p className="text-sm font-medium mt-2">CMO</p>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <span className="text-2xl">⚙️</span>
                  <p className="text-sm font-medium mt-2">COO</p>
                </div>
                <div className="p-4 bg-pink-500/10 rounded-xl border border-pink-500/20">
                  <span className="text-2xl">👥</span>
                  <p className="text-sm font-medium mt-2">CHRO</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <span className="text-2xl">🔗</span>
                <p className="text-sm font-medium mt-2">Orchestration Layer</p>
                <p className="text-xs text-gray-500 mt-1">Routes decisions & maintains shared context</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-md flex items-center justify-center font-bold text-xs">
              B
            </div>
            <span>BizAI Platform</span>
          </div>
          <p className="text-gray-600 text-sm">
            AI executives for small businesses
          </p>
        </div>
      </footer>
    </div>
  );
}
