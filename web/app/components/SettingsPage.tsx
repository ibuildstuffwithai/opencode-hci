"use client";

import { useStore } from "../store";

const NAMING_OPTIONS = ["camelCase", "snake_case", "PascalCase", "kebab-case"];
const STYLE_OPTIONS = ["functional", "class-based", "mixed"];
const FRAMEWORK_OPTIONS = ["React", "Vue", "Svelte", "Angular", "Next.js", "Express", "Fastify"];
const TESTING_OPTIONS = ["unit + integration", "unit only", "e2e focused", "TDD", "minimal"];
const LANGUAGE_OPTIONS = ["TypeScript", "JavaScript", "Python", "Go", "Rust"];

export function SettingsPage() {
  const setView = useStore((s) => s.setView);
  const preferences = useStore((s) => s.preferences);
  const updatePreferences = useStore((s) => s.updatePreferences);
  const addToast = useStore((s) => s.addToast);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface">
        <button
          onClick={() => setView("landing")}
          className="text-muted hover:text-foreground transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="w-px h-4 bg-border" />
        <div>
          <h1 className="text-sm font-semibold text-foreground">⚙️ Settings & Preferences</h1>
          <p className="text-[10px] text-muted">Configure your coding DNA — the agent adapts to these</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Coding Style */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-1">🧬 Coding DNA</h2>
            <p className="text-xs text-muted mb-4">These preferences shape how the agent writes code for you</p>

            <div className="space-y-4">
              {/* Language */}
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">Preferred Language</label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updatePreferences({ preferredLanguage: opt })}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        preferences.preferredLanguage === opt
                          ? "bg-accent text-foreground shadow-lg shadow-accent/20"
                          : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framework */}
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">Preferred Framework</label>
                <div className="flex flex-wrap gap-2">
                  {FRAMEWORK_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updatePreferences({ framework: opt })}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        preferences.framework === opt
                          ? "bg-accent text-foreground shadow-lg shadow-accent/20"
                          : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Naming Convention */}
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">Naming Convention</label>
                <div className="flex flex-wrap gap-2">
                  {NAMING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updatePreferences({ namingConvention: opt })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                        preferences.namingConvention === opt
                          ? "bg-accent text-foreground shadow-lg shadow-accent/20"
                          : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Style */}
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">Code Style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updatePreferences({ codeStyle: opt })}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        preferences.codeStyle === opt
                          ? "bg-accent text-foreground shadow-lg shadow-accent/20"
                          : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Testing */}
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">Testing Approach</label>
                <div className="flex flex-wrap gap-2">
                  {TESTING_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updatePreferences({ testingApproach: opt })}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        preferences.testingApproach === opt
                          ? "bg-accent text-foreground shadow-lg shadow-accent/20"
                          : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Formatting */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-1">📐 Formatting</h2>
            <p className="text-xs text-muted mb-4">Fine-tune formatting preferences</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Tab Size</p>
                  <p className="text-[10px] text-muted">Number of spaces per indent</p>
                </div>
                <div className="flex items-center gap-1">
                  {[2, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => updatePreferences({ tabSize: n })}
                      className={`w-8 h-8 rounded-lg text-xs font-mono transition-all ${
                        preferences.tabSize === n
                          ? "bg-accent text-foreground"
                          : "bg-surface-hover text-muted hover:text-foreground"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Semicolons</p>
                  <p className="text-[10px] text-muted">Append semicolons to statements</p>
                </div>
                <button
                  onClick={() => updatePreferences({ semicolons: !preferences.semicolons })}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    preferences.semicolons ? "bg-accent" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      preferences.semicolons ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                <div>
                  <p className="text-xs font-medium text-foreground">Trailing Commas</p>
                  <p className="text-[10px] text-muted">Add trailing commas in multi-line</p>
                </div>
                <button
                  onClick={() => updatePreferences({ trailingCommas: !preferences.trailingCommas })}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    preferences.trailingCommas ? "bg-accent" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      preferences.trailingCommas ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Learned Patterns */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-1">🧠 Learned Patterns</h2>
            <p className="text-xs text-muted mb-4">Patterns the agent has picked up from your interactions</p>

            {preferences.learnedPatterns.length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-xl border border-border">
                <span className="text-3xl mb-3 block">🧠</span>
                <p className="text-sm text-muted">No patterns learned yet</p>
                <p className="text-[10px] text-muted mt-1">Start a coding session and the agent will learn your style</p>
              </div>
            ) : (
              <div className="space-y-1">
                {preferences.learnedPatterns.slice(-10).map((p, i) => (
                  <div key={i} className="px-3 py-2 bg-surface rounded-lg border border-border text-xs text-gray-400">
                    {p}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Save */}
          <div className="flex justify-end pb-8">
            <button
              onClick={() => {
                addToast("success", "Preferences Saved", "Your coding DNA has been updated");
                setView("landing");
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-purple text-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
