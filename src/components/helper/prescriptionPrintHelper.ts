import { EPrescriptionDetails } from "@/types/receptionist.types";
import moment from "moment";

export const generatePrescriptionHTML = (
  prescriptionData: EPrescriptionDetails
): string => {
  return `
    <html>
      <head>
        <title>Medical Prescription</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Times New Roman', serif;
            line-height: 1.4;
            color: #000;
            background: white;
            font-size: 12px;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
            min-height: 100vh;
          }
          
          .prescription-header {
            text-align: center;
            border: 3px solid oklch(0.7568 0.1624 51.44);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          }
          
          .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          
          .clinic-tagline {
            font-size: 12px;
            font-style: italic;
            color: #64748b;
            margin-bottom: 10px;
          }
          
          .clinic-details {
            font-size: 11px;
            color: #374151;
          }
          
          .prescription-id {
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            background: oklch(0.7568 0.1624 51.44);
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 1px;
          }
          
          .patient-doctor-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-box {
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 15px;
            background: #f8fafc;
          }
          
          .info-title {
            font-size: 14px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            border-bottom: 2px solid oklch(0.7568 0.1624 51.44);
            padding-bottom: 5px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          
          .info-content {
            font-size: 12px;
            line-height: 1.6;
          }
          
          .info-label {
            font-weight: bold;
            color: #374151;
            display: inline-block;
            width: 80px;
          }
          
          .prescription-symbol {
            font-size: 72px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            text-align: center;
            margin: 20px 0;
            font-family: 'Times New Roman', serif;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            border-bottom: 3px solid oklch(0.7568 0.1624 51.44);
            padding: 8px 0;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .diagnosis-section, .investigations-section, .medications-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .diagnosis-item {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 0 5px 5px 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Table Styles */
          .prescription-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid oklch(0.7568 0.1624 51.44);
            border-radius: 8px;
            overflow: hidden;
            page-break-inside: auto;
            break-inside: auto;
          }
          
          .prescription-table th {
            background: oklch(0.7568 0.1624 51.44);
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: avoid;
            break-after: avoid;
          }
          
          .prescription-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
            vertical-align: top;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .prescription-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .prescription-table thead {
            display: table-header-group;
          }
          
          .prescription-table tbody {
            display: table-row-group;
          }
          
          .prescription-table tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .prescription-table tr:hover {
            background: #f1f5f9;
          }
          
          .medication-name {
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            font-size: 12px;
          }
          
          .medication-instructions {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 4px;
            padding: 6px;
            margin-top: 5px;
            font-size: 10px;
          }
          
          .investigation-status {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-verified {
            background: #dcfce7;
            color: #166534;
          }
          
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          
          .status-completed {
            background: #dbeafe;
            color: oklch(0.7568 0.1624 51.44);
          }
          
          .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
            border-top: 2px solid oklch(0.7568 0.1624 51.44);
            padding-top: 20px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .doctor-signature {
            text-align: center;
          }
          
          .signature-line {
            border-top: 2px solid #374151;
            margin: 40px 0 10px 0;
            position: relative;
          }
          
          .signature-text {
            font-size: 11px;
            color: #6b7280;
          }
          
          .doctor-name {
            font-size: 14px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            margin-bottom: 5px;
          }
          
          .date-time {
            text-align: right;
            font-size: 11px;
            color: #6b7280;
          }
          
          .prescription-footer {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            border: 2px dashed oklch(0.7568 0.1624 51.44);
            border-radius: 10px;
            background: #f0f9ff;
          }
          
          .verification-text {
            font-size: 10px;
            color: oklch(0.7568 0.1624 51.44);
            font-weight: bold;
          }
          
          .care-instructions {
            background: #f0fdf4;
            border: 1px solid #22c55e;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .care-title {
            font-weight: bold;
            color: #166534;
            margin-bottom: 8px;
          }
          
          /* Visit Summary Styles */
          .visit-summary-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .visit-summary-content {
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            background: #f8fafc;
          }
          
          .visit-item {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .visit-item:last-child {
            border-bottom: none;
          }
          
          .visit-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 6px;
            font-size: 12px;
          }
          
          .visit-value {
            color: #1f2937;
            font-size: 11px;
            line-height: 1.5;
          }
          
          .critical-section {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
          }
          
          .critical-section .visit-item {
            border-bottom: none;
            padding: 0;
          }
          
          .critical-status {
            display: inline-block;
            margin-right: 20px;
            vertical-align: top;
          }
          
          .critical-remarks {
            display: inline-block;
            vertical-align: top;
            flex: 1;
          }
          
          .critical-badge {
            background: #dc2626;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .followup-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
          }
          
          .followup-date, .followup-instructions {
            margin: 0;
          }
          
          .followup-section .visit-item {
            border-bottom: none;
            padding: 0;
          }
          
          /* Page break utilities */
          .page-break-before {
            page-break-before: always;
            break-before: page;
          }
          
          .page-break-after {
            page-break-after: always;
            break-after: page;
          }
          
          .page-break-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              padding: 0;
              margin: 0;
              font-size: 11px;
              line-height: 1.3;
              background: white !important;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            
            /* Ensure content doesn't break inappropriately */
            .prescription-header {
              border: 3px solid oklch(0.7568 0.1624 51.44) !important;
              background: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-after: avoid;
              break-after: avoid;
            }
            
            .patient-doctor-section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .prescription-symbol {
              page-break-before: avoid;
              page-break-after: avoid;
              break-before: avoid;
              break-after: avoid;
            }
            
            /* Table print optimizations */
            .prescription-table {
              page-break-before: auto;
              page-break-after: auto;
              page-break-inside: auto;
              break-before: auto;
              break-after: auto;
              break-inside: auto;
            }
            
            .prescription-table thead {
              display: table-header-group;
            }
            
            .prescription-table tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .prescription-table th {
              background: oklch(0.7568 0.1624 51.44) !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Section specific page breaks */
            .section-title {
              color: oklch(0.7568 0.1624 51.44) !important;
              border-bottom-color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
              page-break-after: avoid;
              break-after: avoid;
              orphans: 3;
              widows: 3;
            }
            
            .diagnosis-section,
            .medications-section,
            .investigations-section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .diagnosis-item {
              background: #fef2f2 !important;
              border-left-color: #ef4444 !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .clinic-name {
              color: #1e40af !important;
              -webkit-print-color-adjust: exact;
            }
            
            .prescription-id {
              background: #1e40af !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
            }
            
            .clinic-name {
              color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
            }
            
            .prescription-id {
              background: oklch(0.7568 0.1624 51.44) !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .prescription-table tr:nth-child(even) {
              background: #f8fafc !important;
              -webkit-print-color-adjust: exact;
            }
            
            .medication-instructions {
              background: #fef3c7 !important;
              border-color: #f59e0b !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .care-instructions {
              background: #f0fdf4 !important;
              border-color: #22c55e !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Visit Summary Print Styles */
            .visit-summary-section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .visit-summary-content {
              background: #f8fafc !important;
              border-color: #e2e8f0 !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .visit-item {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .critical-section {
              background: #fef2f2 !important;
              border-color: #fca5a5 !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .critical-badge {
              background: #dc2626 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
            }
            
            .followup-section {
              background: #f0f9ff !important;
              border-color: #bfdbfe !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .prescription-footer {
              background: #f0f9ff !important;
              border-color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .signature-section {
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-before: auto;
              break-before: auto;
            }
            
            .status-verified {
              background: #dcfce7 !important;
              color: #166534 !important;
              -webkit-print-color-adjust: exact;
            }
            
            .status-pending {
              background: #fef3c7 !important;
              color: #92400e !important;
              -webkit-print-color-adjust: exact;
            }
            
            .status-completed {
              background: #dbeafe !important;
              color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
            }
            
            /* Orphans and widows control */
            p, div {
              orphans: 2;
              widows: 2;
            }
            
            h1, h2, h3, h4, h5, h6, .section-title {
              orphans: 3;
              widows: 3;
            }
          }
          }
        </style>
      </head>
      <body>
        <!-- Clinic Header -->
        <div class="prescription-header">
          <div class="clinic-name">${
            prescriptionData.practitioner?.user?.tenant?.name ||
            "Medical Clinic"
          }</div>
          <div class="clinic-tagline">Complete Healthcare Solutions</div>
          <div class="clinic-details">
            ${
              prescriptionData.practitioner?.user?.tenant?.contact?.[0]?.telecom
                ?.map((contact) => contact.value)
                .join(" | ") || "Contact Information"
            }
          </div>
        </div>

        <!-- Prescription ID -->
        <div class="prescription-id">
          Prescription ID: ${
            prescriptionData.medication_request?.medication_display_id || "N/A"
          }
          <div style="font-size: 12px; margin-top: 5px;">
            Issued: ${moment(
              prescriptionData.medication_request?.authored_on
            ).format("MMMM DD, YYYY")}
          </div>
        </div>

        <!-- Patient and Doctor Information -->
        <div class="patient-doctor-section">
          <div class="info-box">
            <div class="info-title">Patient Information</div>
            <div class="info-content">
              <div><span class="info-label">Name:</span> ${
                prescriptionData.patient?.user?.name || "N/A"
              }</div>
              <div><span class="info-label">Gender:</span> ${
                prescriptionData.patient?.gender || "N/A"
              }</div>
              <div><span class="info-label">Patient ID:</span> ${
                prescriptionData.patient?.patient_display_id || "N/A"
              }</div>
              <div><span class="info-label">Date:</span> ${moment().format(
                "DD/MM/YYYY"
              )}</div>
            </div>
          </div>
          
          <div class="info-box">
            <div class="info-title">Doctor Information</div>
            <div class="info-content">
              <div><span class="info-label">Dr.</span> ${
                prescriptionData.practitioner?.user?.name || "N/A"
              }</div>
              <div><span class="info-label">License:</span> ${
                prescriptionData.practitioner?.practitioner_display_id || "N/A"
              }</div>
              <div><span class="info-label">Email:</span> ${
                prescriptionData.practitioner?.user?.email || "N/A"
              }</div>
            </div>
          </div>
        </div>

        <!-- Visit Summary Section -->
        ${
          prescriptionData.visit_note?.summary ||
          prescriptionData.visit_note?.chief_complaint ||
          prescriptionData.visit_note?.provisional_diagnosis ||
          prescriptionData.visit_note?.critical ||
          prescriptionData.visit_note?.criticality_remark ||
          prescriptionData.visit_note?.followup_date ||
          prescriptionData.visit_note?.follow_up
            ? `
        <div class="visit-summary-section">
          <div class="section-title">Visit Summary</div>
          <div class="visit-summary-content">
            ${
              prescriptionData.visit_note.summary
                ? `
              <div class="visit-item">
                <div class="visit-label">Summary:</div>
                <div class="visit-value">${prescriptionData.visit_note.summary}</div>
              </div>
            `
                : ""
            }
            
            ${
              prescriptionData.visit_note.chief_complaint
                ? `
              <div class="visit-item">
                <div class="visit-label">Patient's Reported Problem:</div>
                <div class="visit-value">${prescriptionData.visit_note.chief_complaint}</div>
              </div>
            `
                : ""
            }
            
            ${
              prescriptionData.visit_note.provisional_diagnosis
                ? `
              <div class="visit-item">
                <div class="visit-label">Provisional Diagnosis:</div>
                <div class="visit-value">${prescriptionData.visit_note.provisional_diagnosis}</div>
              </div>
            `
                : ""
            }
            
            ${
              prescriptionData.visit_note.critical ||
              prescriptionData.visit_note.criticality_remark
                ? `
              <div class="visit-item critical-section">
                ${
                  prescriptionData.visit_note.critical
                    ? `
                  <div class="critical-status">
                    <div class="visit-label">Status:</div>
                    <div class="critical-badge">CRITICAL CASE</div>
                  </div>
                `
                    : ""
                }
                ${
                  prescriptionData.visit_note.criticality_remark
                    ? `
                  <div class="critical-remarks">
                    <div class="visit-label">Remarks:</div>
                    <div class="visit-value">${prescriptionData.visit_note.criticality_remark}</div>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }
            
            ${
              prescriptionData.visit_note.followup_date ||
              prescriptionData.visit_note.follow_up
                ? `
              <div class="visit-item followup-section">
                ${
                  prescriptionData.visit_note.followup_date
                    ? `
                  <div class="followup-date">
                    <div class="visit-label">Next Visit:</div>
                    <div class="visit-value">${moment(
                      prescriptionData.visit_note.followup_date
                    ).format("MMMM DD, YYYY")}</div>
                  </div>
                `
                    : ""
                }
                ${
                  prescriptionData.visit_note.follow_up
                    ? `
                  <div class="followup-instructions">
                    <div class="visit-label">Follow-up Instructions:</div>
                    <div class="visit-value">${prescriptionData.visit_note.follow_up}</div>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }
          </div>
        </div>
        `
            : ""
        }

        <!-- Diagnosis -->
        ${
          prescriptionData.visit_note?.assessments?.length
            ? `
        <div class="diagnosis-section">
          <div class="section-title">Diagnosis</div>
          ${prescriptionData.visit_note.assessments
            .map(
              (assessment) => `
            <div class="diagnosis-item">
              <strong>Condition:</strong> ${
                assessment.description || "No description"
              }<br>
              <strong>Severity:</strong> ${assessment.severity || "N/A"}
            </div>
          `
            )
            .join("")}
        </div>
        `
            : ""
        }

        <!-- Medications Table -->
        ${
          prescriptionData.medication_request?.medications?.length
            ? `
        <div class="medications-section">
          <div class="section-title">Prescribed Medications</div>
          <table class="prescription-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 20%;">Medication Name</th>
                <th style="width: 10%;">Strength</th>
                <th style="width: 10%;">Form</th>
                <th style="width: 10%;">Route</th>
                <th style="width: 12%;">Frequency</th>
                <th style="width: 10%;">Duration</th>
                <th style="width: 23%;">Instructions & Notes</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptionData.medication_request.medications
                .map(
                  (medication, index) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${
                    index + 1
                  }</td>
                  <td>
                    <div class="medication-name">${medication.name}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">
                      Timing: ${
                        [
                          medication.timing?.morning && "Morning",
                          medication.timing?.afternoon && "Afternoon",
                          medication.timing?.evening && "Evening",
                          medication.timing?.night && "Night",
                        ]
                          .filter(Boolean)
                          .join(", ") || "N/A"
                      }
                    </div>
                  </td>
                  <td>${medication.strength || "N/A"}</td>
                  <td>${medication.form || "N/A"}</td>
                  <td>${medication.route || "N/A"}</td>
                  <td>${medication.frequency || "N/A"}</td>
                  <td>${medication.duration || "N/A"} days</td>
                  <td>
                    ${
                      medication.dosage_instruction
                        ? `<div style="font-size: 10px; margin-bottom: 3px;"><strong>Instructions:</strong> ${medication.dosage_instruction}</div>`
                        : ""
                    }
                    ${
                      medication.note?.info
                        ? `
                      <div class="medication-instructions">
                        <strong>Note:</strong> ${medication.note.info}
                      </div>
                    `
                        : ""
                    }
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- Investigations Table -->
        ${
          prescriptionData.lab_tests?.length
            ? `
        <div class="investigations-section">
          <div class="section-title">Investigations Ordered</div>
          <table class="prescription-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 30%;">Test Name</th>
                <th style="width: 15%;">Priority</th>
                <th style="width: 15%;">Status</th>
                <th style="width: 20%;">Ordered On</th>
                <th style="width: 15%;">Notes</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptionData.lab_tests
                .map(
                  (test, index) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${
                    index + 1
                  }</td>
                  <td>
                    <div style="font-weight: bold; color: oklch(0.7568 0.1624 51.44);">${
                      test.test_display
                    }</div>
                  </td>
                  <td style="text-transform: capitalize;">${
                    test.priority || "N/A"
                  }</td>
                  <td>
                    <span class="investigation-status ${
                      test.status === "verified"
                        ? "status-verified"
                        : test.status === "pending"
                        ? "status-pending"
                        : "status-completed"
                    }">
                      ${test.status || "N/A"}
                    </span>
                  </td>
                  <td>
                    ${
                      test.authored_on
                        ? moment(test.authored_on).format(
                            "DD MMM YYYY, hh:mm A"
                          )
                        : "N/A"
                    }
                  </td>
                  <td style="font-size: 10px;">
                    ${
                      test.notes?.length
                        ? test.notes
                            .map((note) => note.text || "N/A")
                            .join(", ")
                        : "-"
                    }
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- Signature Section -->
        <div class="signature-section">
          <div class="doctor-signature">
            <div class="signature-line"></div>
            <div class="doctor-name">Dr. ${
              prescriptionData.practitioner?.user?.name || "N/A"
            }</div>
            <div class="signature-text">Doctor's Signature</div>
          </div>
          <div class="date-time">
            <div>Date: ${moment(
              prescriptionData.medication_request?.authored_on
            ).format("DD/MM/YYYY")}</div>
            <div>Time: ${moment(
              prescriptionData.medication_request?.authored_on
            ).format("hh:mm A")}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="prescription-footer">
          <div class="verification-text">
            This is a digitally generated prescription. For verification, contact the clinic.<br>
            Prescription ID: ${
              prescriptionData.medication_request?.medication_display_id ||
              "N/A"
            }
          </div>
        </div>
      </body>
    </html>
  `;
};

export const handlePrintPrescription = (
  prescriptionData: EPrescriptionDetails
): void => {
  if (!prescriptionData) {
    console.error("No prescription data available for printing");
    return;
  }

  const printWindow = window.open("", "", "width=800,height=600");

  if (printWindow) {
    const htmlContent = generatePrescriptionHTML(prescriptionData);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  } else {
    console.error("Unable to open print window");
  }
};
