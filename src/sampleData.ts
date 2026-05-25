export interface SampleTopic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  notes: string;
  recommendedTheme: string;
}

export const SAMPLE_TOPICS: SampleTopic[] = [
  {
    id: 'space-tourism',
    title: 'Space Tourism: OrbitX Future',
    subtitle: 'The Next Venture into Commercial Space Travel',
    description: 'An outline covering civilian orbital flight targets, spacecraft specs, and logistics.',
    recommendedTheme: 'midnight-tech',
    notes: `OrbitX Commercial Space Travel Initiative (2026 - 2030)
Executive Summary of Commercial Operations

The core mission of OrbitX is making low Earth orbital space flight accessible and comfortable for civilians, researchers, and global pioneers.

Key Metrics & Commercial Viability:
* Projected Market Value: Space Tourism size is expected to hit $12.5B by 2030, with a staggering 24% CAGR.
* Civilian Milestones: We plan to cross 500 successful passenger flights by Q4 2028.
* Current flight success rate sits at 99.8%.

Technological Core Infrastructure:
Phase 1: Orbital Capsule Propulsion. Our Phoenix-9 hybrid hydrogen rockets decrease orbital fuel burn by 35%. Phoenix-9 uses intelligent trajectory optimization.
Phase 2: Artificial Gravity Centrifuges. Introducing internal cabin spinning rings to maintain a comfortable 0.15G, minimizing space sickness by 80%.
Phase 3: Thermal Deflection Mesh. A flexible carbon-silicide shield that absorbs atmospheric reentry temperatures up to 2,800°F without needing active coolant.

Pros & Cons of Space Tourism:
- Pros: Drastic acceleration of space science, inspiration of new STEM generations, reusable rockets driving rocket logistics cost down to historically low levels.
- Cons: High initial orbital ticket price range ($180k+), atmospheric carbon emission debates, rigorous physical pre-flight G-force tolerance test.

Closing Thoughts:
"Space is no longer a destination of the state, it is the playground of human potential." - OrbitX Founders.
Ready for landing. Let us venture together.`
  },
  {
    id: 'ai-healthcare',
    title: 'AI in Healthcare Operations',
    subtitle: 'Streamlining Diagnostic Accuracy and Patient Records',
    description: 'An academic and operational perspective on AI models in medical databases.',
    recommendedTheme: 'academic-editorial',
    notes: `AI-Powered Diagnostics: The Clinical Frontline
Author: Dr. Sarah Lin, MD, PHD
Department of Health Informatics

Unstructured clinician write-ups, EHR data, and raw bio-images contain invaluable records. By applying specialized vision models, diagnostics times are falling rapidly.

Diagnostic Milestones:
* Diagnostic Speed: Medical LLMs reduce preliminary diagnostic scan analysis time from 4.5 hours down to just 18 seconds.
* Reduction of Errors: Secondary AI reviews decrease radiological false-negatives by 12.4% on average.
* Administrative Burden: Doctors spend 40% of their day writing records. Auto-transcription solves this.

Technical Workflow Breakdown:
Step 1: Raw Image Acquisition (X-Rays, MRI, CT Scans).
Step 2: Intelligent Multi-Modal Segmentation. Highlights suspected nodes and tissue micro-tears.
Step 3: Neural Cross-Referencing. Queries massive historical database repositories (PubMed, ClinicalTrials) for matched symptoms.
Step 4: Clinical Summary Generation. The model formats a neat diagnostic summary highlight draft for physician verification.

Before vs After Clinical Implementation:
- Before AI: Doctors manually analyze files while patients wait days for results, resulting in mental fatigue and increased clerical backlog.
- After AI: Rapid preliminary screening, instantaneous auto-suggested diagnostics, allowing physicians to focus entirely on direct patient care and bedside empathy.

"The ultimate metric of medicine isn't processing speed — it is human diagnostic precision combined with deep caregiver compassion." Lin Clinic`
  },
  {
    id: 'green-tea',
    title: 'Uji Matcha: Preserving Ritual',
    subtitle: 'From Field to Whisk — Crafting Organic Green Tea Systems',
    description: 'A beautiful matcha product overview detailing cultivation, shades, and preparation.',
    recommendedTheme: 'sage-pastel',
    notes: `Ceremonial Matcha Organic Agricultural Outline
The Art of Shade-Grown Tencha from Kyoto Fields

Matcha represents more than an active ingredient; it is a meticulously preserved ancient tradition of mindful preparation and clean, focused energy.

The Cultural Impact & Statistics:
* Shade Duration: Shaded for 25 to 30 days before spring picking to increase chlorophyll content by 300%.
* Energy Profile: L-Theanine provides stable, calm alert states for up to 6 hours without the crash of classic espresso.
* Rich Antioxidants: Contains 137 times more EGCG antioxidants than standard leaf green tea.

Traditional Preparation Steps:
1. Sifting the Tencha powder to eliminate microscopic clumps and ensure aeration.
2. Water Temperature Tuning. Water must reside at exactly 175°F to prevent burning the delicate amino acids.
3. Whisking via Chasen. A masterfully carved 120-prong bamboo whisk is swished in a high-speed 'W' motion.
4. Serving and Presentation in custom clay Chawan bowls.

Key Comparisons: Traditional Ceremony vs Instant Matcha:
- Traditional Matcha: Shade-grown, hand-picked once a year, stone milled at 30 RPM, vibrant jade hue, sweet umami flavor.
- Instant Matcha: Full sun cultivation, machine harvested, high heat pulverized, dull olive hue, bitter astringent profile.

A Zen Proverb:
"In the bubble of the tea, there lies a complete reflection of the boundless sky." whisk with intention.`
  }
];
