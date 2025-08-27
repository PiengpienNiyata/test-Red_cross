export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const glossaryData: GlossaryTerm[] = [
  {
    term: "Remission",
    definition: `<p>In a medical context, remission refers to a state in which the signs and symptoms of a disease have completely disappeared, either temporarily or permanently.</p>`,
  },
  {
    term: "True Remission",
    definition: `<p>True remission is defined as the occurrence of molecular normalization in the originating cells of a disease, accompanied by the complete disappearance of clinical signs and symptoms sustained for a duration longer than the onset timeframe of the designated disease.</p>
    <p>When the signs and symptoms of the disease have completely disappeared — and last for a longer period than it normally takes for the disease to evolve.</p>
    <p>It helps in distinguishing between other type of remission (e.g., symptom relief) and true remission.</p>
    
    <strong>Example: Melasma</strong>
    <ul>
        <li><strong>Onset timeframe:</strong> Pigment develops within 1–2 months after UV exposure or hormonal trigger.</li>
        <li>If a treatment clears the pigment, but it comes back within 1 month, this is not true remission.</li>
        <li>But if the skin remains clear for more than 2 months (longer than it took to appear), this supports true clinical remission.</li>
    </ul>
    <strong>Example: Acne</strong>
    <ul>
        <li><strong>Onset:</strong> Inflammatory lesions may develop over 2 weeks after comedone formation.</li>
        <li>True remission means no recurrence of lesions for more than 2–3 weeks, ideally longer.</li>
    </ul>`,
  },
  {
    term: "Unstable Remission",
    definition: `<p>The unstable remission is defined as the status in which the occurrence of the true remission being happened while the source of causative signal persisted.</p>`,
  },
  {
    term: "Molecular Stages / Types",
    definition: `
    <strong>Molecular Stages of the Disease:</strong>
    <p>The natural progression of a disease in which all stages are molecularly driven by the same originating cell and core signal, differing only in intensity and duration over time.</p>
    <p><em>Example: Early vs late lesions, acute vs fibrotic phases.</em></p>
    <br/>
    <strong>Molecular Types of the Disease:</strong>
    <p>Distinct clusters of disease presentations that share the same originating cell and base molecular trigger, but are further influenced by additional, subtype-specific signals that give rise to different clinical behaviors or lesion patterns.</p>`,
  },
  {
    term: "Molecular Clinico-Pathological Cascade (Molecular Cascade)",
    definition:
      "<p>A sequence of molecular signals initiated by a primary signal that drives the originating cell, leading to the development of clinical or pathological characteristics. This cascade may also trigger subsequent signals, aligning with diagnostic criteria based on clinical or histological features.</p>",
  },
  {
    term: "Autocrine Signaling",
    definition: `
      <p>A signaling mechanism in which a single cell produces and responds to its own signaling molecules.</p>
      <p>The signal binds to receptors on the same cell that secreted it.</p>
      <p>This typically involves only one cell type in both signal emission and response.</p>
      <br/>
      <p><em>Example: A tumor cell releasing growth factors that act back on itself to promote proliferation.</em></p>
    `,
  },
  {
    term: "Paracrine Signaling",
    definition: `
      <p>A mechanism which one cell secretes signaling molecules that act on neighboring or nearby cells.</p>
      <p>Involves one or more cell type(s) within the same tissue or microenvironment.</p>
      <p>Signals usually act over adjacent cell(s).</p>
      <br/>
      <p><em>Example: Immune cells secreting cytokines that activate nearby endothelial or stromal cells.</em></p>
    `,
  },
  {
    term: "Endocrine Signaling",
    definition: `
      <p>A long-distance communication method where a cell (often in a gland) releases hormones into the bloodstream, which travel to and affect distant cells of different types.</p>
      <p>Involves two or more cell types, typically in separate organs or tissues.</p>
      <br/>
      <p><em>Example: Pituitary cells releasing hormones that affect liver or reproductive tissues.</em></p>
    `,
  },
  {
    term: "Contradiction",
    definition: `<p>If different types or stages of a disease show contradictory responses (exhibit divergent responses) to the same treatment, or exhibit distinct molecular signatures, it raises the possibility that: What we call one disease might represent separate disease entities with converging symptoms, or the disease is heterogeneous, and our current classification (by name or type) may be oversimplified or incorrect.</p>
    <p>Within the RIRM framework, this contradiction prompts three actions:</p>
    <ol>
        <li>Re-examine treatment effects in each subtype to map precisely which molecular nodes are altered.</li>
        <li>Interrogate divergent triggers, cells of origin, and signalling cascades that might account for the split response.</li>
        <li>Entertain the “syndrome” hypothesis—i.e., that the disease label encompasses a family of related but separate conditions.</li>
    </ol>`,
  },
];