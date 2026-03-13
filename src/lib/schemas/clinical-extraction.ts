import { z } from "zod";

// ─── ACTION CENTER SCHEMA ──────────────────────────────────────────────────────

const actionTypeSchema = z.enum([
  "imprimir",
  "whatsapp",
  "assinar",
  "sistema",
  "automacao",
]);

const actionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  action: actionTypeSchema,
  defaultChecked: z.boolean(),
});

const actionGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  items: z.array(actionItemSchema),
});

export const actionCenterSchema = z.object({
  groups: z.array(actionGroupSchema),
});

// ─── SOAP DOCUMENT SCHEMA ─────────────────────────────────────────────────────

const contentItemSchema = z.object({
  text: z.string(),
  bold: z.array(z.string()).readonly(),
});

const contentSegmentSchema = z.object({
  type: z.enum(["paragraph", "list"]),
  items: z.array(contentItemSchema).readonly(),
});

const soapLetterSchema = z.enum(["S", "O", "A", "P"]);

const soapSectionSchema = z.object({
  id: z.string(),
  letter: soapLetterSchema,
  title: z.string(),
  subtitle: z.string(),
  content: contentSegmentSchema,
});

export const soapDocumentSchema = z.object({
  date: z.string(),
  patient: z.string(),
  companion: z.string(),
  sessionId: z.string(),
  sections: z.array(soapSectionSchema).readonly(),
});

// ─── DIAGNOSTIC SCHEMA ────────────────────────────────────────────────────────

const diagnosisTierSchema = z.enum(["high", "medium", "low"]);

const signalAccentSchema = z.enum(["primary", "secondary", "muted"]);

const signalSchema = z.object({
  id: z.string(),
  label: z.string(),
  domain: z.string(),
  criterion: z.string(),
  reasoning: z.string(),
  hypothesisSummary: z.string(),
  quote: z.string(),
  audioTimer: z.string(),
  accent: signalAccentSchema,
});

const diagnosisSchema = z.object({
  id: z.string(),
  cid: z.string(),
  label: z.string(),
  probability: z.number().min(0).max(100),
  tier: diagnosisTierSchema,
  signalIds: z.array(z.string()),
});

export const diagnosticSchema = z.object({
  diagnoses: z.array(diagnosisSchema),
  signals: z.array(signalSchema),
});

// ─── CLINICAL EXTRACTION SCHEMA (output do Step 1 da pipeline) ───────────────

export const extractionSchema = z.object({
  consultationType: z.enum(["first", "followup", "emergency"]),
  complaints: z.array(z.string()),
  findings: z.array(z.string()),
  medications: z.array(
    z.object({
      name: z.string(),
      dose: z.string().optional(),
      action: z.enum(["maintain", "adjust", "start", "stop"]),
    })
  ),
  gaps: z.array(z.string()),
  completenessScore: z.number().min(0).max(1),
});

// ─── RE-EXPORTS (schemas individuais de sub-entidades) ────────────────────────

export { actionGroupSchema, actionItemSchema, actionTypeSchema };
export { soapSectionSchema, soapLetterSchema, contentSegmentSchema, contentItemSchema };
export { diagnosisSchema, signalSchema, diagnosisTierSchema, signalAccentSchema };
