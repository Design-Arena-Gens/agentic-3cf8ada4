import { ExampleExplorer } from "@/components/ExampleExplorer";
import { examples } from "@/lib/examples";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-zinc-100">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(236,72,153,0.18),transparent_40%)]" />
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-24 sm:pt-28 lg:px-10">
          <header className="max-w-3xl space-y-4">
            <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-200/80">
              Interactive Backpropagation Lab
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Explore Backpropagation Through Curated Neural Network Examples
            </h1>
            <p className="text-lg text-zinc-200/90">
              Step through forward and backward passes, monitor gradients, and
              inspect weights for logic gates, classification, and regression
              tasks. The interactive explorer highlights how hidden units react
              while the loss curve guides convergence intuition.
            </p>
          </header>
          <main className="mb-24 space-y-16">
            <ExampleExplorer examples={examples} />
          </main>
        </div>
      </div>
    </div>
  );
}
