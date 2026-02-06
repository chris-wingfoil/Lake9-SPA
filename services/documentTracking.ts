// Firebase Document Tracking - Add to Firestore for internal document management
// Run this after security team approves the document

import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './config/firebase';

const db = getFirestore(app);

// Document metadata for tracking
const securityComplianceDoc = {
  documentId: 'security-compliance-audit-2025-01',
  title: 'Lake9 SPA - Security Compliance & Audit Documentation',
  type: 'security_compliance',
  version: '1.0.0',
  status: 'submitted', // pending, approved, requires_changes
  
  // Links
  githubUrl: 'https://github.com/chris-wingfoil/Lake9-SPA/blob/master/SECURITY_COMPLIANCE_AUDIT.md',
  githubCommit: '78bc0c1',
  pdfUrl: null, // Add after converting to PDF
  
  // Dates
  createdDate: serverTimestamp(),
  submittedDate: new Date('2025-01-XX'), // Update with actual date
  approvedDate: null,
  nextReviewDate: new Date('2025-04-XX'), // Quarterly review
  
  // Approval workflow
  approvers: [
    {
      role: 'Security Team Lead',
      email: 'security-lead@company.com',
      status: 'pending',
      approvedDate: null,
      comments: null
    },
    {
      role: 'Compliance Officer',
      email: 'compliance@company.com',
      status: 'pending',
      approvedDate: null,
      comments: null
    },
    {
      role: 'CTO/Technical Lead',
      email: 'cto@company.com',
      status: 'pending',
      approvedDate: null,
      comments: null
    }
  ],
  
  // Content summary
  sections: [
    'Executive Summary',
    'Application Overview',
    'Security Architecture',
    'Authentication & Authorization',
    'Data Security & Privacy',
    'API Security',
    'Infrastructure & Hosting',
    'Third-Party Dependencies',
    'Compliance & Standards',
    'Security Testing & Monitoring',
    'Incident Response',
    'Risk Assessment',
    'Appendix'
  ],
  
  // Key findings
  securityPosture: 'acceptable_for_production',
  complianceStandards: ['OWASP Top 10', 'GDPR', 'CCPA'],
  criticalFindings: 0,
  highPriorityRecommendations: 3,
  mediumPriorityRecommendations: 3,
  
  // Recommendations tracking
  recommendations: {
    priority1: [
      {
        item: 'Add Content Security Policy (CSP) header',
        status: 'pending',
        estimatedHours: 1,
        assignee: null
      },
      {
        item: 'Enable Firebase App Check',
        status: 'pending',
        estimatedHours: 2,
        assignee: null
      },
      {
        item: 'Set up monitoring alerts',
        status: 'pending',
        estimatedHours: 1,
        assignee: null
      }
    ],
    priority2: [
      {
        item: 'Third-party penetration test',
        status: 'pending',
        estimatedCost: '$5,000-$10,000',
        assignee: null
      },
      {
        item: 'Implement rate limiting per user',
        status: 'pending',
        estimatedHours: 4,
        assignee: null
      },
      {
        item: 'Add audit logging for sensitive actions',
        status: 'pending',
        estimatedHours: 2,
        assignee: null
      }
    ]
  },
  
  // Application info
  application: {
    name: 'Lake9 Stock Price Art Generator',
    version: '1.0.0',
    productionUrl: 'https://lake9-dev.web.app',
    githubRepo: 'https://github.com/chris-wingfoil/Lake9-SPA',
    environment: 'production',
    deploymentDate: new Date('2025-01-XX') // Update with actual date
  },
  
  // Metadata
  submittedBy: 'development-team',
  reviewCycle: 'quarterly',
  documentClassification: 'internal_confidential',
  
  // Notes
  notes: 'Initial security compliance submission for production deployment',
  
  // Audit trail
  auditTrail: [
    {
      action: 'document_created',
      timestamp: serverTimestamp(),
      user: 'dev-team',
      details: 'Created security compliance documentation'
    },
    {
      action: 'submitted_for_review',
      timestamp: serverTimestamp(),
      user: 'dev-team',
      details: 'Submitted to security team for approval'
    }
  ]
};

// Function to add document to Firestore
export async function trackSecurityDocument() {
  try {
    const docRef = await addDoc(collection(db, 'internal_documents'), securityComplianceDoc);
    console.log('Document tracking added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Function to update approval status
export async function updateApprovalStatus(
  documentId: string,
  approverRole: string,
  status: 'approved' | 'requires_changes',
  comments?: string
) {
  const db = getFirestore(app);
  const docRef = doc(db, 'internal_documents', documentId);
  
  // Update specific approver
  const updates = {
    [`approvers.${approverRole}.status`]: status,
    [`approvers.${approverRole}.approvedDate`]: serverTimestamp(),
    [`approvers.${approverRole}.comments`]: comments || null,
    'auditTrail': arrayUnion({
      action: `approval_${status}`,
      timestamp: serverTimestamp(),
      user: approverRole,
      details: comments || `Document ${status}`
    })
  };
  
  await updateDoc(docRef, updates);
  console.log(`Approval status updated for ${approverRole}`);
}

// Example usage:
// trackSecurityDocument();

export default {
  trackSecurityDocument,
  updateApprovalStatus
};
