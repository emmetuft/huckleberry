# Huckleberry Feature: Topographic Knowledge Map

## Objective

Implement a new visualization mode for the Huckleberry canvas called **Topographic View**.

The purpose of this view is **not** to replace the existing node graph, but to overlay a visualization that helps users understand the _state of collective knowledge_ around a decision.

Traditional graphs answer:

> "How are things connected?"

Topographic View should answer:

> "Where is our understanding deep, shallow, incomplete, or missing?"

The visualization should help teams identify blind spots, weak reasoning, and underdeveloped areas of a decision.

---

# High-Level Concept

Every node acts as a source that contributes to a continuous scalar field (similar to terrain elevation).

Instead of visualizing individual importance scores, render a smooth topographic landscape over the canvas.

The terrain should be generated procedurally from node metadata.

Think of this like a heat map transformed into a topographic elevation map.

---

# Terrain Meaning

## Elevation

Elevation represents **Contribution**.

Contribution measures how much a node influences the current decision or goal.

Higher contribution = taller terrain.

Lower contribution = flatter terrain.

Nearby nodes should blend together so related concepts form mountain ranges rather than isolated spikes.

---

## Terrain Width

The spread (sigma) of each hill represents **Knowledge Maturity**.

A mature concept should influence a larger surrounding area.

An immature concept should produce a narrow peak.

Examples:

Wide hill:

- discussed many times
- referenced by many nodes
- supported by evidence
- understood by many people

Narrow hill:

- recently created
- only one contributor
- little discussion
- sparse evidence

---

## Surface Smoothness

Terrain roughness represents uncertainty.

Smooth terrain:

- high confidence
- consistent evidence
- stable understanding

Jagged terrain:

- conflicting information
- weak evidence
- unresolved questions
- active debate

This can be implemented with procedural displacement or controlled noise.

---

# Metrics

Each node should expose the following values.

```ts
interface KnowledgeMetrics {
  contribution: number; // 0-1
  maturity: number; // 0-1
  confidence: number; // 0-1
  consensus: number; // 0-1
  freshness: number; // 0-1
}
```

These values should remain independent.

Do not collapse them into a single score.

---

# Terrain Generation

Generate a continuous scalar field.

Each node contributes a Gaussian hill.

Suggested formula:

height(x,y) =
Σ(contribution \* gaussian(distance, sigma))

Where:

sigma = lerp(minSigma, maxSigma, maturity)

Example:

High contribution
Low maturity

→ tall narrow mountain

High contribution
High maturity

→ broad mountain

Low contribution
High maturity

→ gentle rolling hill

Low contribution
Low maturity

→ almost invisible bump

Terrain should blend naturally between nearby nodes.

---

# Contour Rendering

Generate contour lines from the scalar field.

Higher elevations should contain more contour rings.

Contour spacing should remain constant.

Use smooth interpolation.

Avoid contour artifacts.

Rendering style:

- subtle
- monochrome
- semi-transparent
- non-distracting

The node graph must remain readable underneath.

---

# Coverage Visualization

One of the primary goals is helping users identify gaps.

A node may be highly influential but poorly understood.

Represent this visually.

Possible implementation:

Reduce hill width when maturity is low.

or

Increase terrain steepness.

or

Add subtle edge fractures.

or

Add procedural erosion.

Do NOT rely solely on color.

The shape of the terrain should communicate the information.

---

# Missing Knowledge

Support "knowledge gaps."

The AI may infer concepts that should exist but currently do not.

Example:

Decision:
Launch in Europe

Expected supporting concepts:

- Pricing
- Localization
- Legal review
- Customer demand
- Revenue forecast

If Revenue Forecast does not exist:

Create a terrain depression instead of a node.

The valley represents expected-but-missing knowledge.

Hovering the valley should display:

"Expected supporting analysis missing."

These valleys should naturally attract attention.

---

# Interaction

Hovering terrain should reveal:

Contribution

Knowledge maturity

Confidence

Consensus

Freshness

Supporting evidence count

Discussion count

Contributors

Referenced documents

---

Clicking terrain should select the nearest node.

---

# View Modes

Topographic View should be a visualization layer.

Users should be able to toggle:

- Graph
- Topography

---

# Perspective Filters

Support future filtering.

Terrain should be recomputed using only information visible to a selected audience.

Examples:

Engineering

Product

Leadership

Marketing

Sales

This enables users to compare organizational understanding across teams.

---

# Performance

The terrain should update interactively as nodes move.

Target:

60 FPS while dragging nodes.

Suggested implementation:

- GPU fragment shader
- WebGL
- WebGPU
- Render texture
- Marching Squares (for contours)

Avoid expensive CPU contour recomputation every frame.

---

# Visual Style

The visualization should resemble a calm editorial topographic map rather than a scientific heat map.

Goals:

- minimal
- elegant
- organic
- quiet
- information dense

Avoid:

- rainbow gradients
- harsh neon colors
- excessive labels
- cluttered contour lines

The visualization should feel like exploring the "terrain of organizational understanding."

---

# Future Enhancements (Do Not Implement Yet)

Design the architecture so these features can be added later:

1. Animated terrain changes as meetings occur.

2. Time slider showing knowledge evolution.

3. AI-generated valleys representing inferred missing reasoning.

4. Perspective mode showing different terrain for Engineering vs Marketing vs Leadership.

5. Decision readiness overlay.

6. Consensus overlay.

7. Confidence overlay.

---

# Guiding Design Principle

This visualization is not intended to measure node popularity or graph centrality.

Its purpose is to externalize the team's collective mental model.

Users should be able to answer questions such as:

- What parts of this decision are well understood?
- Which ideas are still immature?
- Where are we making assumptions?
- What areas need more evidence?
- What knowledge is missing entirely?
- Where should the team focus next?

The visualization should make these answers immediately apparent through the shape of the terrain, without requiring users to inspect individual node metrics.
