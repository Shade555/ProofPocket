import { Project, Requirement, DocumentMetadata, EvidenceMatch } from "@/types";

export const SYNTHETIC_INSTRUCTIONS = `APPLICATION INSTRUCTIONS: 2026 APEX GLOBAL LEADERS FELLOWSHIP
Application Deadline: November 15, 2026.
Review Cycle: Fall 2026

All applicants must submit an evidence-backed application packet with the following materials:

1. Official or Unofficial University Academic Transcript:
Must verify current or completed undergraduate studies with a cumulative GPA of at least 3.50 on a 4.0 scale.

2. Comprehensive Curriculum Vitae (CV) or Resume:
Must detail academic background, relevant leadership roles, community impact, and technical accomplishments.

3. Two Confidential Letters of Recommendation:
Must be authored by academic professors or professional research mentors on official letterhead with contact details.

4. Valid Government-Issued Photo Identification:
Passport, National Identity Card, or Driver's License verifying full legal name and date of birth.

5. Proof of Current Semester Enrollment:
An official letter or verification issued by the University Registrar verifying active matriculation for Fall 2026.

OPTIONAL SUPPLEMENT:
6. Financial Need Statement or Pell Grant Documentation:
A signed 1-page statement outlining financial barriers or providing official grant eligibility documentation.
`;

export const SYNTHETIC_REQUIREMENTS: Requirement[] = [
  {
    id: "req_transcript_gpa",
    title: "University Academic Transcript (GPA ≥ 3.50)",
    description: "Official or unofficial transcript confirming undergraduate studies and a minimum cumulative GPA of 3.50 / 4.00.",
    documentType: "Academic Transcript",
    mandatory: true,
    deadline: "2026-11-15",
    validationRules: [
      { field: "gpa", rule: "not_empty", description: "Must list cumulative GPA" },
      { field: "institution", rule: "not_empty", description: "Must show accredited university name" }
    ],
    evidenceNeeded: "Transcript stating institution name, student name, degree program, and cumulative GPA >= 3.50.",
    status: "satisfied",
    sourceQuote: "1. Official or Unofficial University Academic Transcript: Must verify current or completed undergraduate studies with a cumulative GPA of at least 3.50 on a 4.0 scale."
  },
  {
    id: "req_resume_cv",
    title: "Curriculum Vitae (CV) or Resume",
    description: "Comprehensive CV detailing academic background, leadership experience, and technical projects.",
    documentType: "Resume / CV",
    mandatory: true,
    deadline: "2026-11-15",
    validationRules: [
      { field: "personName", rule: "not_empty", description: "Must match applicant legal identity" }
    ],
    evidenceNeeded: "Curriculum Vitae highlighting academic achievements, leadership experience, and contact information.",
    status: "satisfied",
    sourceQuote: "2. Comprehensive Curriculum Vitae (CV) or Resume: Must detail academic background, relevant leadership roles..."
  },
  {
    id: "req_two_rec_letters",
    title: "Two Confidential Letters of Recommendation",
    description: "Two signed recommendation letters from university faculty or professional research supervisors.",
    documentType: "Recommendation Letter",
    mandatory: true,
    deadline: "2026-11-15",
    validationRules: [
      { field: "quantity", rule: "contains", expected: "2", description: "Two distinct recommendation letters required" }
    ],
    evidenceNeeded: "Two separate signed letters from faculty or mentors. Currently only one letter has been uploaded.",
    status: "partially_satisfied",
    uncertaintyExplanation: "Only 1 recommendation letter found (Prof. Aris Patel). The instructions explicitly require 2 letters. Second letter is missing.",
    sourceQuote: "3. Two Confidential Letters of Recommendation: Must be authored by academic professors or professional research mentors..."
  },
  {
    id: "req_gov_photo_id",
    title: "Valid Government-Issued Photo Identification",
    description: "Passport, National ID, or Driver's License verifying full legal name and date of birth.",
    documentType: "Government ID / Passport",
    mandatory: true,
    deadline: "2026-11-15",
    validationRules: [
      { field: "personName", rule: "not_empty", description: "Must state full legal name" },
      { field: "identifier", rule: "not_empty", description: "Must contain official document number" }
    ],
    evidenceNeeded: "Valid government ID showing full name matching other documents and valid expiration date.",
    status: "satisfied",
    sourceQuote: "4. Valid Government-Issued Photo Identification: Passport, National Identity Card, or Driver's License..."
  },
  {
    id: "req_proof_enrollment",
    title: "Proof of Fall 2026 Enrollment (Registrar Certified)",
    description: "Official verification letter or document issued by the Registrar verifying active Fall 2026 semester enrollment.",
    documentType: "Enrollment Verification",
    mandatory: true,
    deadline: "2026-11-15",
    validationRules: [
      { field: "semester", rule: "contains", expected: "Fall 2026", description: "Must verify Fall 2026 registration" },
      { field: "issuer", rule: "contains", expected: "Registrar", description: "Must be issued or signed by the Registrar's Office" }
    ],
    evidenceNeeded: "Registrar-certified enrollment certificate for Fall 2026. Uploaded document is a tuition billing receipt from Spring 2026.",
    status: "needs_review",
    uncertaintyExplanation: "Uploaded document 'Spring_Tuition_Receipt_2026.pdf' is an accounts billing receipt for Spring 2026. It does not certify Fall 2026 enrollment nor is it from the University Registrar.",
    sourceQuote: "5. Proof of Current Semester Enrollment: An official letter or verification issued by the University Registrar verifying active matriculation for Fall 2026."
  },
  {
    id: "req_financial_need",
    title: "Financial Need Statement (Optional)",
    description: "Optional 1-page financial statement or Pell Grant documentation.",
    documentType: "Financial Aid Statement",
    mandatory: false,
    deadline: "2026-11-15",
    validationRules: [],
    evidenceNeeded: "Signed 1-page financial explanation or official award notice.",
    status: "missing",
    uncertaintyExplanation: "No matching document uploaded. As an optional item, it will not prevent packet export, but will be listed in the missing items report.",
    sourceQuote: "OPTIONAL SUPPLEMENT: 6. Financial Need Statement or Pell Grant Documentation: A signed 1-page statement outlining financial barriers..."
  }
];

export const SYNTHETIC_DOCUMENTS: DocumentMetadata[] = [
  {
    id: "doc_synth_transcript",
    projectId: "proj_synthetic_demo",
    originalFilename: "Alex_Mercer_Academic_Transcript_2026.pdf",
    safeFilename: "Alex_Mercer_Academic_Transcript_2026.pdf",
    suggestedFilename: "01_Academic_Transcript_Alex_Mercer.pdf",
    mimeType: "application/pdf",
    sizeBytes: 245120,
    uploadedAt: "2026-10-25T14:20:00Z",
    pageCount: 2,
    extractionMethod: "pdf-text",
    rawText: `METROPOLITAN STATE UNIVERSITY OF TECHNOLOGY
OFFICIAL ACADEMIC TRANSCRIPT
Student Name: Alex Mercer
Student ID: MST-994821
Degree Program: Bachelor of Science in Artificial Intelligence Systems
College of Engineering & Computer Science
Cumulative GPA: 3.84 / 4.00
Standing: Dean's Honor Roll (Summa Cum Laude Track)
Units Completed: 104 Credit Hours
Date Issued: September 28, 2026`,
    textSnippet: "Student Name: Alex Mercer | Cumulative GPA: 3.84 / 4.00 | Dean's Honor Roll | Units Completed: 104 Credit Hours",
    extractedFields: {
      personName: { value: "Alex Mercer", confidence: 0.98, evidenceSnippet: "Student Name: Alex Mercer" },
      institution: { value: "Metropolitan State University of Technology", confidence: 0.99, evidenceSnippet: "METROPOLITAN STATE UNIVERSITY OF TECHNOLOGY" },
      gpa: { value: "3.84", confidence: 0.97, evidenceSnippet: "Cumulative GPA: 3.84 / 4.00" },
      degree: { value: "B.S. Artificial Intelligence Systems", confidence: 0.95, evidenceSnippet: "Degree Program: Bachelor of Science in Artificial Intelligence Systems" }
    }
  },
  {
    id: "doc_synth_resume",
    projectId: "proj_synthetic_demo",
    originalFilename: "Alex_Mercer_Curriculum_Vitae_2026.pdf",
    safeFilename: "Alex_Mercer_Curriculum_Vitae_2026.pdf",
    suggestedFilename: "02_Curriculum_Vitae_Alex_Mercer.pdf",
    mimeType: "application/pdf",
    sizeBytes: 118400,
    uploadedAt: "2026-10-25T14:21:00Z",
    pageCount: 2,
    extractionMethod: "pdf-text",
    rawText: `ALEX MERCER
Email: alex.mercer.dev@example.edu | Phone: (555) 019-4820
San Francisco, CA | GitHub: github.com/alexmercer-demo

EDUCATION:
Metropolitan State University of Technology - B.S. Artificial Intelligence (GPA 3.84)

EXPERIENCE & LEADERSHIP:
- President & Technical Lead, Open Weights AI Club (2025 - Present)
  * Organized workshops on Gemma 2 open models for 350+ student researchers.
- Lead Contributor, ProofPocket Open Source Paperwork Assistant (2026)
  * Engineered evidence extraction pipeline with deterministic schema verification.
- Research Assistant, Autonomous Reasoning Lab (2024 - 2026)
  * Co-authored evaluation benchmarking on semantic document triage.`,
    textSnippet: "Alex Mercer | B.S. Artificial Intelligence (GPA 3.84) | President & Technical Lead, Open Weights AI Club | Research Assistant",
    extractedFields: {
      personName: { value: "Alex Mercer", confidence: 0.99, evidenceSnippet: "ALEX MERCER" },
      leadershipRole: { value: "President, Open Weights AI Club", confidence: 0.95, evidenceSnippet: "President & Technical Lead, Open Weights AI Club" },
      email: { value: "alex.mercer.dev@example.edu", confidence: 0.98, evidenceSnippet: "Email: alex.mercer.dev@example.edu" }
    }
  },
  {
    id: "doc_synth_rec_letter",
    projectId: "proj_synthetic_demo",
    originalFilename: "Recommendation_Letter_Prof_Patel.pdf",
    safeFilename: "Recommendation_Letter_Prof_Patel.pdf",
    suggestedFilename: "03_Letter_of_Recommendation_Prof_Patel.pdf",
    mimeType: "application/pdf",
    sizeBytes: 184200,
    uploadedAt: "2026-10-25T14:22:00Z",
    pageCount: 1,
    extractionMethod: "pdf-text",
    rawText: `METROPOLITAN STATE UNIVERSITY OF TECHNOLOGY
DEPARTMENT OF COMPUTER SCIENCE & DATA SYSTEMS

CONFIDENTIAL LETTER OF RECOMMENDATION
To: Selection Committee, Apex Global Leaders Fellowship
Subject: Recommendation for Alex Mercer

Dear Selection Committee,
I am writing with great enthusiasm to recommend Alex Mercer for the Apex Global Leaders Fellowship.
As their undergraduate research supervisor in the Autonomous Reasoning Lab over the past two years,
I have observed Alex's exceptional analytical rigor, ethical integrity, and dedication to open-weight AI accessibility.

Alex ranks in the top 1% of students I have taught over the past fifteen years. They have my highest recommendation.

Sincerely,
Prof. Aris Patel, Ph.D.
Associate Professor of Computer Science
Director, Autonomous Reasoning Lab
Email: a.patel@msut.example.edu`,
    textSnippet: "Confidential Letter of Recommendation for Alex Mercer | Prof. Aris Patel, Ph.D. | Top 1% of students",
    extractedFields: {
      recommenderName: { value: "Prof. Aris Patel, Ph.D.", confidence: 0.98, evidenceSnippet: "Prof. Aris Patel, Ph.D. - Associate Professor" },
      applicantName: { value: "Alex Mercer", confidence: 0.97, evidenceSnippet: "Subject: Recommendation for Alex Mercer" },
      institution: { value: "Metropolitan State University of Technology", confidence: 0.99, evidenceSnippet: "DEPARTMENT OF COMPUTER SCIENCE & DATA SYSTEMS" }
    }
  },
  {
    id: "doc_synth_passport",
    projectId: "proj_synthetic_demo",
    originalFilename: "Passport_Scan_Alex_Mercer.jpg",
    safeFilename: "Passport_Scan_Alex_Mercer.jpg",
    suggestedFilename: "04_Government_ID_Alex_Mercer.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 420800,
    uploadedAt: "2026-10-25T14:23:00Z",
    pageCount: 1,
    extractionMethod: "ocr",
    rawText: `PASSPORT / PASSEPORT
REPUBLIC OF VERIDIA
Type: P  Code: VRD  Passport No: V88294103
Surname: MERCER
Given Names: ALEX JORDAN
Nationality: VERIDIAN
Date of Birth: 14 APR 2002
Sex: M
Place of Birth: PACIFICA
Date of Issue: 22 JAN 2022
Date of Expiration: 21 JAN 2032
Authority: PASSPORT OFFICE CENTRAL`,
    textSnippet: "REPUBLIC OF VERIDIA PASSPORT | Surname: MERCER, Given Names: ALEX JORDAN | Passport No: V88294103 | Expiry: 2032",
    extractedFields: {
      personName: { value: "Alex Jordan Mercer", confidence: 0.96, evidenceSnippet: "Surname: MERCER Given Names: ALEX JORDAN" },
      identifier: { value: "V88294103", confidence: 0.95, evidenceSnippet: "Passport No: V88294103" },
      expirationDate: { value: "2032-01-21", confidence: 0.93, evidenceSnippet: "Date of Expiration: 21 JAN 2032" }
    }
  },
  {
    id: "doc_synth_tuition",
    projectId: "proj_synthetic_demo",
    originalFilename: "Spring_Tuition_Receipt_2026.pdf",
    safeFilename: "Spring_Tuition_Receipt_2026.pdf",
    suggestedFilename: "05_Tuition_Billing_Receipt_Spring_2026.pdf",
    mimeType: "application/pdf",
    sizeBytes: 98200,
    uploadedAt: "2026-10-25T14:24:00Z",
    pageCount: 1,
    extractionMethod: "pdf-text",
    rawText: `METROPOLITAN STATE UNIVERSITY OF TECHNOLOGY
STUDENT FINANCIAL SERVICES & BURSAR OFFICE

PAYMENT RECEIPT - SPRING TERM 2026
Student: Alex Mercer (MST-994821)
Transaction Date: January 12, 2026
Term: Spring 2026 Semester
Amount Paid: $4,250.00 USD
Payment Status: PAID IN FULL - DIRECT DEPOSIT
Authorized by: Bursar Cashier Station 4`,
    textSnippet: "BURSAR PAYMENT RECEIPT | Spring Term 2026 | Paid in full | Authorized by Bursar",
    extractedFields: {
      personName: { value: "Alex Mercer", confidence: 0.94, evidenceSnippet: "Student: Alex Mercer (MST-994821)" },
      documentType: { value: "Tuition Payment Receipt", confidence: 0.96, evidenceSnippet: "PAYMENT RECEIPT - SPRING TERM 2026" },
      semester: { value: "Spring 2026", confidence: 0.98, evidenceSnippet: "Term: Spring 2026 Semester" }
    }
  }
];

export const SYNTHETIC_MATCHES: EvidenceMatch[] = [
  {
    id: "match_synth_1",
    requirementId: "req_transcript_gpa",
    documentId: "doc_synth_transcript",
    documentFilename: "Alex_Mercer_Academic_Transcript_2026.pdf",
    supportingExcerpt: "Student Name: Alex Mercer | Cumulative GPA: 3.84 / 4.00 | Dean's Honor Roll (Summa Cum Laude Track) | Units Completed: 104 Credit Hours",
    pageReference: 1,
    explanation: "Transcript from Metropolitan State University of Technology confirms cumulative GPA of 3.84, which exceeds the required 3.50 minimum.",
    confidence: "high",
    status: "satisfied",
    userDecision: "confirmed",
    missingFields: []
  },
  {
    id: "match_synth_2",
    requirementId: "req_resume_cv",
    documentId: "doc_synth_resume",
    documentFilename: "Alex_Mercer_Curriculum_Vitae_2026.pdf",
    supportingExcerpt: "ALEX MERCER - B.S. Artificial Intelligence (GPA 3.84) | President & Technical Lead, Open Weights AI Club | Research Assistant, Autonomous Reasoning Lab",
    pageReference: 1,
    explanation: "Curriculum Vitae provides full academic history, leadership roles, and technical project experience.",
    confidence: "high",
    status: "satisfied",
    userDecision: "confirmed",
    missingFields: []
  },
  {
    id: "match_synth_3",
    requirementId: "req_two_rec_letters",
    documentId: "doc_synth_rec_letter",
    documentFilename: "Recommendation_Letter_Prof_Patel.pdf",
    supportingExcerpt: "Confidential Letter of Recommendation for Alex Mercer by Prof. Aris Patel, Ph.D., Associate Professor of Computer Science.",
    pageReference: 1,
    explanation: "Letter from Prof. Aris Patel satisfies recommendation letter #1. However, the instructions mandate two (2) separate letters. A second recommendation letter is missing.",
    confidence: "medium",
    status: "partially_satisfied",
    userDecision: "pending",
    missingFields: ["Second Recommendation Letter (Recommender #2)"],
    conflictingEvidence: "Found only 1 recommendation letter in uploaded document bundle."
  },
  {
    id: "match_synth_4",
    requirementId: "req_gov_photo_id",
    documentId: "doc_synth_passport",
    documentFilename: "Passport_Scan_Alex_Mercer.jpg",
    supportingExcerpt: "PASSPORT REPUBLIC OF VERIDIA | Surname: MERCER, Given Names: ALEX JORDAN | Passport No: V88294103 | Expiration Date: 21 JAN 2032",
    pageReference: 1,
    explanation: "Government passport photo page validates legal name and birthdate, valid through 2032.",
    confidence: "high",
    status: "satisfied",
    userDecision: "confirmed",
    missingFields: []
  },
  {
    id: "match_synth_5",
    requirementId: "req_proof_enrollment",
    documentId: "doc_synth_tuition",
    documentFilename: "Spring_Tuition_Receipt_2026.pdf",
    supportingExcerpt: "STUDENT FINANCIAL SERVICES PAYMENT RECEIPT - SPRING TERM 2026 | Term: Spring 2026 Semester | Amount Paid: $4,250.00",
    pageReference: 1,
    explanation: "Uploaded document is a financial cashier receipt for Spring Term 2026, whereas the requirement demands official Registrar enrollment verification for Fall 2026. Needs human review and replacement with a Registrar letter.",
    confidence: "low",
    status: "needs_review",
    userDecision: "pending",
    missingFields: ["Registrar Official Stamp / Certification", "Fall 2026 Semester Term"],
    conflictingEvidence: "Document is for Spring 2026 bursar receipt, not Fall 2026 Registrar enrollment certificate."
  },
  {
    id: "match_synth_6",
    requirementId: "req_financial_need",
    documentId: null,
    documentFilename: null,
    supportingExcerpt: null,
    pageReference: null,
    explanation: "No uploaded document matches the optional Financial Need Statement or Pell Grant verification.",
    confidence: "none",
    status: "missing",
    userDecision: "pending",
    missingFields: ["Financial Statement or Pell Grant Documentation"]
  }
];

export const SYNTHETIC_PROJECT: Project = {
  id: "proj_synthetic_demo",
  name: "Apex Global Leaders Fellowship 2026",
  instructionsText: SYNTHETIC_INSTRUCTIONS,
  deadline: "2026-11-15",
  notes: "Demo project demonstrating satisfied, partially satisfied, missing, and ambiguous/needs-review documents.",
  status: "ready_for_review",
  createdAt: "2026-10-25T14:00:00Z",
  updatedAt: "2026-10-25T14:30:00Z",
  documents: SYNTHETIC_DOCUMENTS,
  requirements: SYNTHETIC_REQUIREMENTS,
  matches: SYNTHETIC_MATCHES,
  isSyntheticDemo: true,
  stats: {
    totalRequirements: 6,
    satisfied: 3,
    partiallySatisfied: 1,
    missing: 1,
    needsReview: 1,
    estimatedTimeSavedMinutes: 45
  }
};
