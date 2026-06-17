"use client"

import { useWorkspaceStore } from "@/lib/stores/workspace"
import type { ModelDefinition, ModelFeature } from "@/lib/workspace/modelRegistry"
import { cn } from "@/lib/utils"

/**
 * Reusable model selector + feature controls for Image/Video Output nodes.
 *
 * Reads `modelId` and `modelParams` from the node's data, lets the user pick
 * a model from a dropdown, and renders model-specific feature controls
 * (aspect ratio, resolution, duration, etc.) below the dropdown.
 *
 * To add a new model feature, add it to the model's `features` array in
 * modelRegistry.ts — this component will automatically render the controls.
 */
export function ModelSelector({
  nodeId,
  modelId,
  modelParams,
  models,
  onChangeModel,
  onChangeParam
}: {
  nodeId: string
  modelId: string | undefined
  modelParams: Record<string, string> | undefined
  models: ModelDefinition[]
  onChangeModel: (modelId: string) => void
  onChangeParam: (key: string, value: string) => void
}) {
  const selected = models.find((m) => m.id === modelId) ?? models[0]

  function handleModelChange(value: string) {
    const model = models.find((m) => m.id === value)
    if (!model) return
    // When switching models, reset params to the new model's defaults
    const defaultParams: Record<string, string> = {}
    model.features.forEach((f) => {
      defaultParams[f.key] = f.defaultValue
    })
    onChangeModel(value)
    // Apply defaults by updating each param individually
    Object.entries(defaultParams).forEach(([key, value]) => {
      onChangeParam(key, value)
    })
  }

  function handleFeatureChange(feature: ModelFeature, value: string) {
    onChangeParam(feature.key, value)
  }

  return (
    <div className="space-y-2">
      {/* Model dropdown */}
      <div>
        <p className="mb-1 text-[10px] uppercase tracking-[0.06em] text-text-muted">Model</p>
        <select
          value={selected?.id ?? ""}
          onChange={(event) => {
            event.stopPropagation()
            handleModelChange(event.target.value)
          }}
          onClick={(event) => event.stopPropagation()}
          className="h-8 w-full rounded border border-border-subtle bg-background px-2 text-xs text-text-primary outline-none focus:border-accent-cyan"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id} disabled={!model.available}>
              {model.label}{!model.available ? " (reserved)" : ""}
            </option>
          ))}
        </select>
        {selected ? (
          <p className="mt-0.5 text-[9px] text-text-muted">{selected.description}</p>
        ) : null}
      </div>

      {/* Feature controls — rendered dynamically from the model's features array */}
      {selected?.features.map((feature) => {
        const currentValue = modelParams?.[feature.key] ?? feature.defaultValue
        return (
          <div key={feature.key}>
            <p className="mb-1 text-[10px] uppercase tracking-[0.06em] text-text-muted">{feature.label}</p>
            <div className="flex flex-wrap gap-1">
              {feature.options.map((option) => {
                const active = currentValue === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleFeatureChange(feature, option.value)
                    }}
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] transition",
                      active
                        ? "border-accent-cyan bg-accent-cyan-dim text-accent-cyan"
                        : "border-border-subtle text-text-muted hover:border-border-strong hover:text-text-secondary"
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
