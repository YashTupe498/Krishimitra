import type { Grievance } from '../types/grievance';

export const DEMO_GRIEVANCES: Grievance[] = [
  {
    id: "KM-2026-004281",
    farmerId: "demo-farmer-id",
    category: "BUYER",
    title: "Buyer Payment Issue",
    description: "My payment has not been received after delivery.",
    priority: "HIGH",
    status: "UNDER_REVIEW",
    location: "Nashik District, Maharashtra",
    createdAt: "2026-08-31T08:30:00Z",
    updatedAt: "2026-08-31T09:15:00Z",
    evidence: ["invoice_4281.pdf", "delivery_proof.jpg"],
    classificationSummary: "Payment remains pending after produce delivery.",
    classificationReasons: [
      "Payment remains pending after delivery",
      "Transaction amount has been reported",
      "Buyer has been identified"
    ],
    details: {
      buyerName: "Maharashtra Agro Traders",
      pendingAmount: 42500,
      transactionDate: "2026-08-25",
      deliveryDate: "2026-08-25",
      referenceNumber: "MAT-9921",
    },
    timeline: [
      {
        status: "SUBMITTED",
        title: "Submitted",
        description: "Grievance has been submitted to KrishiMitra.",
        timestamp: "2026-08-31T08:30:00Z",
        state: "COMPLETED"
      },
      {
        status: "REGISTERED",
        title: "Registered",
        description: "Grievance registered in KrishiMitra Demo system.",
        timestamp: "2026-08-31T08:31:00Z",
        state: "COMPLETED"
      },
      {
        status: "UNDER_REVIEW",
        title: "Under Review",
        description: "Awaiting further details or resolution actions.",
        timestamp: "2026-08-31T09:15:00Z",
        state: "CURRENT"
      },
      {
        status: "RESOLVED",
        title: "Resolution",
        description: "Pending",
        timestamp: "",
        state: "PENDING"
      }
    ],
    resolutionGuidance: {
      whatHappened: "Payment for the delivered produce remains pending.",
      why: "The buyer transaction appears unresolved after delivery.",
      whatToDo: "Keep your invoice, delivery proof and buyer communication.",
      recommendedAction: "Contact the buyer using your transaction reference and retain proof of communication.",
      resolutionChannel: "Buyer / Market Transaction Resolution"
    }
  },
  {
    id: "KM-2026-004102",
    farmerId: "demo-farmer-id",
    category: "GOVERNMENT_SCHEME",
    title: "Government Scheme",
    description: "My subsidy has not been received.",
    priority: "MEDIUM",
    status: "RESOLVED",
    location: "Nashik District, Maharashtra",
    createdAt: "2026-08-15T10:00:00Z",
    updatedAt: "2026-08-28T14:30:00Z",
    evidence: ["application_form.pdf"],
    classificationSummary: "Subsidy application is delayed beyond expected timeline.",
    classificationReasons: [
      "Government scheme application confirmed",
      "Expected timeline exceeded"
    ],
    details: {
      schemeName: "PM-KISAN",
      applicationNumber: "PMK-992144",
      expectedBenefit: 2000,
    },
    timeline: [
      {
        status: "SUBMITTED",
        title: "Submitted",
        description: "Grievance has been submitted.",
        timestamp: "2026-08-15T10:00:00Z",
        state: "COMPLETED"
      },
      {
        status: "REGISTERED",
        title: "Registered",
        description: "Grievance registered in KrishiMitra Demo system.",
        timestamp: "2026-08-15T10:01:00Z",
        state: "COMPLETED"
      },
      {
        status: "UNDER_REVIEW",
        title: "Under Review",
        description: "Issue was reviewed.",
        timestamp: "2026-08-16T11:00:00Z",
        state: "COMPLETED"
      },
      {
        status: "RESOLVED",
        title: "Resolution",
        description: "Subsidy processed successfully by relevant department.",
        timestamp: "2026-08-28T14:30:00Z",
        state: "CURRENT"
      }
    ],
    resolutionGuidance: {
      whatHappened: "Subsidy payment was delayed.",
      why: "Administrative backlog at the processing office.",
      whatToDo: "Check your linked bank account statement.",
      recommendedAction: "No further action needed as the issue is resolved.",
      resolutionChannel: "Relevant Government Scheme / Department"
    }
  },
  {
    id: "KM-2026-003987",
    farmerId: "demo-farmer-id",
    category: "MARKET",
    title: "Market Transaction",
    description: "Observed price at APMC was lower than the expected modal price.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    location: "Nashik District, Maharashtra",
    createdAt: "2026-08-28T09:00:00Z",
    updatedAt: "2026-08-29T10:00:00Z",
    evidence: ["auction_slip.jpg"],
    classificationSummary: "Discrepancy between reported market intelligence and actual APMC price.",
    classificationReasons: [
      "Price difference reported",
      "Impacts immediate sale opportunity"
    ],
    details: {
      market: "Pimpalgaon Baswant APMC",
      crop: "Onion",
      observedPrice: 3800,
      expectedPrice: 4200,
      date: "2026-08-28"
    },
    timeline: [
      {
        status: "SUBMITTED",
        title: "Submitted",
        description: "Grievance has been submitted.",
        timestamp: "2026-08-28T09:00:00Z",
        state: "COMPLETED"
      },
      {
        status: "REGISTERED",
        title: "Registered",
        description: "Grievance registered in KrishiMitra Demo system.",
        timestamp: "2026-08-28T09:01:00Z",
        state: "COMPLETED"
      },
      {
        status: "IN_PROGRESS",
        title: "In Progress",
        description: "Investigating price discrepancy with APMC data.",
        timestamp: "2026-08-29T10:00:00Z",
        state: "CURRENT"
      },
      {
        status: "RESOLVED",
        title: "Resolution",
        description: "Pending",
        timestamp: "",
        state: "PENDING"
      }
    ],
    resolutionGuidance: {
      whatHappened: "You received a lower price than expected at the market.",
      why: "Quality variations or rapid intraday market fluctuations.",
      whatToDo: "Keep your auction slip securely.",
      recommendedAction: "Monitor market trends closely for the next 48 hours.",
      resolutionChannel: "APMC Grievance Cell"
    }
  },
  {
    id: "KM-2026-003745",
    farmerId: "demo-farmer-id",
    category: "LOGISTICS",
    title: "Transport / Logistics",
    description: "Transport vehicle is delayed by more than 24 hours.",
    priority: "MEDIUM",
    status: "SUBMITTED",
    location: "Nashik District, Maharashtra",
    createdAt: "2026-08-30T16:00:00Z",
    updatedAt: "2026-08-30T16:00:00Z",
    evidence: [],
    classificationSummary: "Logistics delay affecting produce delivery.",
    classificationReasons: [
      "Moderate logistics problem reported",
      "Delay exceeds 24 hours"
    ],
    details: {
      pickupLocation: "Farm, Niphad",
      destination: "Pimpalgaon APMC",
      expectedDeliveryDate: "2026-08-29"
    },
    timeline: [
      {
        status: "SUBMITTED",
        title: "Submitted",
        description: "Grievance has been submitted.",
        timestamp: "2026-08-30T16:00:00Z",
        state: "CURRENT"
      },
      {
        status: "REGISTERED",
        title: "Registered",
        description: "Pending",
        timestamp: "",
        state: "PENDING"
      },
      {
        status: "UNDER_REVIEW",
        title: "Under Review",
        description: "Pending",
        timestamp: "",
        state: "PENDING"
      },
      {
        status: "RESOLVED",
        title: "Resolution",
        description: "Pending",
        timestamp: "",
        state: "PENDING"
      }
    ],
    resolutionGuidance: {
      whatHappened: "Your transport vehicle has not arrived on time.",
      why: "Possible vehicle breakdown or scheduling conflict.",
      whatToDo: "Ensure your produce remains in a shaded/cool area.",
      recommendedAction: "Contact the transport provider or arrange alternative logistics if urgent.",
    }
  }
];
