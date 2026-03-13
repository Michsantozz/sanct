import { z } from "zod";
import {
  extractionSchema,
  soapDocumentSchema,
  actionCenterSchema,
  diagnosticSchema,
  actionGroupSchema,
  actionItemSchema,
  actionTypeSchema,
  soapSectionSchema,
  soapLetterSchema,
  contentSegmentSchema,
  contentItemSchema,
  diagnosisSchema,
  signalSchema,
  diagnosisTierSchema,
  signalAccentSchema,
} from "./clinical-extraction";

// ─── TOP-LEVEL TYPES ──────────────────────────────────────────────────────────

export type ClinicalExtraction = z.infer<typeof extractionSchema>;
export type SOAPDocument = z.infer<typeof soapDocumentSchema>;
export type ActionCenterData = z.infer<typeof actionCenterSchema>;
export type DiagnosticData = z.infer<typeof diagnosticSchema>;

// ─── SUB-ENTITY TYPES ─────────────────────────────────────────────────────────

export type ActionType = z.infer<typeof actionTypeSchema>;
export type ActionItem = z.infer<typeof actionItemSchema>;
export type ActionGroup = z.infer<typeof actionGroupSchema>;

export type SOAPLetter = z.infer<typeof soapLetterSchema>;
export type SOAPSection = z.infer<typeof soapSectionSchema>;
export type ContentSegment = z.infer<typeof contentSegmentSchema>;
export type ContentItem = z.infer<typeof contentItemSchema>;

export type DiagnosisTier = z.infer<typeof diagnosisTierSchema>;
export type SignalAccent = z.infer<typeof signalAccentSchema>;
export type Diagnosis = z.infer<typeof diagnosisSchema>;
export type Signal = z.infer<typeof signalSchema>;
