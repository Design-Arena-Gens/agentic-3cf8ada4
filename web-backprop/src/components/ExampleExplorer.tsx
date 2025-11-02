/* eslint-disable react/no-array-index-key */
"use client";

import { useMemo, useState } from "react";
import type { BackpropExample } from "@/lib/examples";

interface ExampleExplorerProps {
  examples: BackpropExample[];
}

const formatNumber = (value: number, digits = 4) =>
  Number.parseFloat(value.toFixed(digits)).toString();

const LossChart = ({
  history,
}: {
  history: BackpropExample["result"]["history"];
}) => {
  const width = 520;
  const height = 160;

  const { points, maxLoss, minLoss } = useMemo(() => {
    const localMax = Math.max(...history.map((frame) => frame.loss));
    const localMin = Math.min(...history.map((frame) => frame.loss));
    if (history.length === 1) {
      return {
        points: `0,${height} ${width},${height}`,
        maxLoss: localMax,
        minLoss: localMin,
      };
    }
    const computedPoints = history
      .map((frame, index) => {
        const x = (index / (history.length - 1)) * width;
        const y =
          height -
          ((frame.loss - localMin) / (localMax - localMin || 1)) * height;
        return `${x},${Number.isFinite(y) ? y : height}`;
      })
      .join(" ");

    return { points: computedPoints, maxLoss: localMax, minLoss: localMin };
  }, [height, width, history]);

  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900">Loss Curve</h3>
        <span className="text-sm text-zinc-500">
          {`min: ${formatNumber(minLoss)}, max: ${formatNumber(maxLoss)}`}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label="Loss curve across epochs"
      >
        <defs>
          <linearGradient id="lossGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.3)" />
            <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="rgb(37, 99, 235)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
        <polyline
          fill="url(#lossGradient)"
          stroke="none"
          points={`${points} ${width},${height} 0,${height}`}
        />
      </svg>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-zinc-900">Epochs</p>
          <p className="text-zinc-600">{history.length}</p>
        </div>
        {history[0]?.accuracy !== undefined && (
          <div>
            <p className="font-medium text-zinc-900">Final Accuracy</p>
            <p className="text-zinc-600">
              {formatNumber(history[history.length - 1]?.accuracy ?? 0, 3)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PredictionsTable = ({
  example,
}: {
  example: BackpropExample;
}) => (
  <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-zinc-900">
        Final Predictions
      </h3>
      <span className="text-sm text-zinc-500">
        {example.result.predictions.length} samples
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-3 py-2">Sample</th>
            <th className="px-3 py-2">Inputs</th>
            <th className="px-3 py-2">Target</th>
            <th className="px-3 py-2">Output</th>
            <th className="px-3 py-2">Loss</th>
            {example.result.predictions[0]?.correct !== undefined && (
              <th className="px-3 py-2">Correct</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {example.result.predictions.map((prediction, index) => (
            <tr key={index} className="text-zinc-700">
              <td className="px-3 py-2 font-medium text-zinc-900">
                {prediction.label ?? `Sample ${index + 1}`}
              </td>
              <td className="px-3 py-2">
                {prediction.inputs.map((value) => formatNumber(value)).join(", ")}
              </td>
              <td className="px-3 py-2">
                {prediction.target.map((value) => formatNumber(value)).join(", ")}
              </td>
              <td className="px-3 py-2">
                {prediction.output.map((value) => formatNumber(value)).join(", ")}
              </td>
              <td className="px-3 py-2">{formatNumber(prediction.loss, 5)}</td>
              {prediction.correct !== undefined && (
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      prediction.correct
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {prediction.correct ? "Yes" : "No"}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const WeightsPanel = ({
  example,
}: {
  example: BackpropExample;
}) => {
  const { finalWeights } = example.result;
  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-zinc-900">
        Final Parameter Snapshot
      </h3>
      <section>
        <h4 className="text-sm font-medium text-zinc-900">Hidden Layer (W1)</h4>
        <div className="mt-2 grid gap-1 text-sm text-zinc-700 md:grid-cols-2">
          {finalWeights.w1.map((row, idx) => (
            <div key={idx} className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                Neuron {idx + 1}
              </p>
              <p>{row.map((value) => formatNumber(value)).join("  ")}</p>
              <p className="text-xs text-zinc-500">
                Bias: {formatNumber(finalWeights.b1[idx])}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h4 className="text-sm font-medium text-zinc-900">Output Layer (W2)</h4>
        <div className="mt-2 grid gap-1 text-sm text-zinc-700 md:grid-cols-2">
          {finalWeights.w2.map((row, idx) => (
            <div key={idx} className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs font-semibold uppercase text-zinc-500">
                Output {idx + 1}
              </p>
              <p>{row.map((value) => formatNumber(value)).join("  ")}</p>
              <p className="text-xs text-zinc-500">
                Bias: {formatNumber(finalWeights.b2[idx])}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const TracePanel = ({
  example,
}: {
  example: BackpropExample;
}) => {
  const snapshots = useMemo(() => {
    const traces = example.result.sampleTraces;
    if (traces.length === 0) return [];
    const first = traces[0];
    const mid = traces[Math.floor(traces.length / 2)];
    const last = traces[traces.length - 1];
    return [first, mid, last];
  }, [example.result.sampleTraces]);

  if (snapshots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-blue-900">
          Backpropagation Walkthrough
        </h3>
        <span className="text-sm text-blue-700">
          Sample #{example.config.traceSampleIndex! + 1}
        </span>
      </div>
      <p className="text-sm text-blue-800">
        Three checkpoints showing how gradients evolve for a single training
        sample throughout learning.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {snapshots.map((snapshot, idx) => (
          <div
            key={`${snapshot.epoch}-${idx}`}
            className="space-y-3 rounded-lg border border-blue-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Epoch {snapshot.epoch + 1}
              </p>
              <p className="text-xs text-blue-700">
                Loss {formatNumber(snapshot.loss, 6)}
              </p>
            </div>
            <section>
              <p className="text-xs font-semibold uppercase text-blue-700">
                Forward Pass
              </p>
              <ul className="mt-1 space-y-1 text-xs text-blue-800">
                <li>
                  Inputs:{" "}
                  {snapshot.forward.inputs
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
                <li>
                  Hidden pre-activation:{" "}
                  {snapshot.forward.hiddenPre
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
                <li>
                  Hidden activation:{" "}
                  {snapshot.forward.hiddenAct
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
                <li>
                  Output:{" "}
                  {snapshot.forward.outputAct
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
                <li>
                  Target:{" "}
                  {snapshot.forward.target
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
              </ul>
            </section>
            <section>
              <p className="text-xs font-semibold uppercase text-blue-700">
                Backward Pass
              </p>
              <ul className="mt-1 space-y-1 text-xs text-blue-800">
                <li>
                  Output delta:{" "}
                  {snapshot.backward.outputDelta
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
                <li>
                  Hidden delta:{" "}
                  {snapshot.backward.hiddenDelta
                    .map((value) => formatNumber(value))
                    .join(", ")}
                </li>
                <li>
                  W2 update:{" "}
                  {snapshot.backward.weightUpdates.w2[0]
                    ?.map((value) => formatNumber(value))
                    .join("  ")}
                </li>
                <li>
                  W1 update:{" "}
                  {snapshot.backward.weightUpdates.w1[0]
                    ?.map((value) => formatNumber(value))
                    .join("  ")}
                </li>
              </ul>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
};

export function ExampleExplorer({ examples }: ExampleExplorerProps) {
  const [selectedExampleId, setSelectedExampleId] = useState(examples[0]?.id);
  const selectedExample = useMemo(
    () => examples.find((example) => example.id === selectedExampleId)!,
    [examples, selectedExampleId]
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {examples.map((example) => {
          const active = selectedExampleId === example.id;
          return (
            <button
              key={example.id}
              type="button"
              onClick={() => setSelectedExampleId(example.id)}
              className={`rounded-2xl border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                active
                  ? "border-blue-500 bg-blue-50 shadow"
                  : "border-zinc-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <p className="text-sm font-semibold text-zinc-900">
                {example.title}
              </p>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                {example.description}
              </p>
              <div className="mt-4 space-y-1 text-xs text-zinc-500">
                <p>
                  Inputs {example.architecture.inputs} · Hidden{" "}
                  {example.architecture.hidden} · Outputs{" "}
                  {example.architecture.outputs}
                </p>
                <p>Epochs {example.config.epochs}</p>
              </div>
            </button>
          );
        })}
      </div>

      <section className="space-y-5">
        <header className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {selectedExample.title}
              </h2>
              <p className="text-sm text-zinc-600">
                {selectedExample.description}
              </p>
            </div>
            <div className="rounded-full bg-zinc-100 px-4 py-1 text-sm text-zinc-600">
              η {selectedExample.config.learningRate} · epochs{" "}
              {selectedExample.config.epochs}
            </div>
          </div>
          <ul className="grid gap-3 text-sm text-zinc-700 md:grid-cols-3">
            {selectedExample.highlights.map((highlight, idx) => (
              <li
                key={idx}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </header>

        <LossChart history={selectedExample.result.history} />

        <TracePanel example={selectedExample} />

        <PredictionsTable example={selectedExample} />

        <WeightsPanel example={selectedExample} />
      </section>
    </div>
  );
}

