import { EPrescriptionDetails } from "@/types/receptionist.types";
import moment from "moment";

// Helper function to convert image to base64 for reliable printing
const getImageAsBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return "";
  }
};

export const generatePrescriptionHTML = (
  prescriptionData: EPrescriptionDetails,
  logoBase64?: string
): string => {
  const logoUrl = logoBase64 || `${window.location.origin}/mm.svg`;
  console.log(logoUrl);

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
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .header-left {
            display: flex;
            align-items: center;
          }
          
          .clinic-logo {
            width: 120px;
            height: 120px;
            margin-right: 20px;
          }
          
          .clinic-info {
            text-align: left;
          }
          
          .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }
          
          .clinic-tagline {
            font-size: 12px;
            font-style: italic;
            color: #64748b;
          }
          
          .header-right {
            text-align: right;
            font-size: 11px;
            color: #374151;
            line-height: 1.5;
          }
          
          .prescription-id {
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            background: oklch(0.7568 0.1624 51.44);
            color: white;
            border-radius: 8px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 1px;
          }
          
          .patient-section {
            margin-bottom: 25px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .patient-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .detail-item {
            display: flex;
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-weight: bold;
            color: #374151;
            min-width: 100px;
            margin-right: 10px;
          }
          
          .detail-value {
            color: #1f2937;
          }
          
          .clinical-info-section {
            margin-bottom: 25px;
          }
          
          .clinical-item {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8fafc;
            border-left: 4px solid oklch(0.7568 0.1624 51.44);
            border-radius: 0 5px 5px 0;
          }
          
          .clinical-label {
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            margin-bottom: 5px;
            font-size: 13px;
          }
          
          .clinical-value {
            color: #1f2937;
            font-size: 12px;
            line-height: 1.5;
          }
          
          .followup-item {
            background: #f0f9ff;
            border-left-color: #3b82f6;
          }
          
          .investigations-section {
            margin-bottom: 25px;
          }
          
          .test-list {
            padding: 0;
            margin-top: 15px;
          }
          
          .test-item {
            padding: 8px 0;
            font-size: 13px;
            display: flex;
            align-items: flex-start;
          }
          
          .test-item:last-child {
            border-bottom: none;
          }
          
          .test-name {
            font-weight: normal;
            color: #000;
            margin-left: 10px;
          }
          
          .medications-section {
            margin-bottom: 25px;
          }
          
          .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border: 2px solid oklch(0.7568 0.1624 51.44);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .medication-table th {
            background: oklch(0.7568 0.1624 51.44);
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .medication-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
            vertical-align: top;
          }
          
          .medication-table tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .medication-table tr:last-child td {
            border-bottom: none;
          }
          
          .medication-name-cell {
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
          
          .doctor-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid oklch(0.7568 0.1624 51.44);
          }
          
          .doctor-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .doctor-info {
            text-align: left;
          }
          
          .doctor-name {
            font-size: 16px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            margin-bottom: 5px;
          }
          
          .doctor-license {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          .doctor-email {
            font-size: 11px;
            color: #6b7280;
          }
          
          .signature-date {
            text-align: right;
          }
          
          .signature-line {
            border-top: 2px solid #374151;
            margin: 20px 0 10px 0;
            width: 200px;
            margin-left: auto;
          }
          
          .signature-text {
            font-size: 11px;
            color: #6b7280;
            text-align: center;
          }
          
          .date-time-info {
            font-size: 12px;
            color: #374151;
            text-align: right;
          }
          
          
          .prescription-footer {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            border: 1px dashed oklch(0.7568 0.1624 51.44);
            border-radius: 8px;
            background: #f0f9ff;
            font-size: 10px;
            color: oklch(0.7568 0.1624 51.44);
          }
          
          .prescription-symbol {
            font-size: 24px;
            font-weight: bold;
            color: oklch(0.7568 0.1624 51.44);
            text-align: left;
            margin: 10px 0 5px 0;
            font-family: 'Times New Roman', serif;
            display: inline-block;
          }
          
          /* Print styles */
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
            
            .prescription-header {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .patient-section,
            .clinical-info-section,
            .investigations-section,
            .medications-section,
            .doctor-section {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .clinical-item,
            .medication-item {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            .section-title {
              page-break-after: avoid;
              break-after: avoid;
            }
            
            .clinic-name {
              color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
            }
            
            .prescription-id {
              background: oklch(0.7568 0.1624 51.44) !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
            }
            
            .patient-section {
              background: #f9fafb !important;
              -webkit-print-color-adjust: exact;
            }
            
            .clinical-item {
              background: #f8fafc !important;
              border-left-color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
            }
            
            .followup-item {
              background: #f0f9ff !important;
              border-left-color: #3b82f6 !important;
              -webkit-print-color-adjust: exact;
            }
            
            .medication-table {
              page-break-inside: auto;
              break-inside: auto;
            }
            
            .medication-table th {
              background: oklch(0.7568 0.1624 51.44) !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
            }
            
            .test-list {
              -webkit-print-color-adjust: exact;
            }
            
            .medication-instructions {
              background: #fef3c7 !important;
              border-color: #f59e0b !important;
              -webkit-print-color-adjust: exact;
            }
            
            .prescription-footer {
              background: #f0f9ff !important;
              border-color: oklch(0.7568 0.1624 51.44) !important;
              -webkit-print-color-adjust: exact;
            }
          }
          }
        </style>
      </head>
      <body>
        <!-- Header with Logo and Clinic Details -->
        <div class="prescription-header">
          <div class="header-left">
            <img src="${logoUrl}" alt="Clinic Logo" class="clinic-logo" />
          </div>
          <div class="header-right">
            <div><strong>Contact:</strong> ${
              prescriptionData.practitioner?.user?.tenant?.contact?.[0]?.telecom
                ?.map((contact: any) => contact.value)
                .join(" | ") || "Contact Information"
            }</div>
            <div><strong>Email:</strong> ${
              prescriptionData.practitioner?.user?.email || "Email Address"
            }</div>
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

        <!-- Patient Details -->
        <div class="patient-section">
          <div class="section-title">Patient Information</div>
          <div class="patient-details">
            <div>
              <div class="detail-item">
                <div class="detail-label">Name:</div>
                <div class="detail-value">${
                  prescriptionData.patient?.user?.name || "N/A"
                }</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Gender:</div>
                <div class="detail-value">${
                  prescriptionData.patient?.gender || "N/A"
                }</div>
              </div>
            </div>
            <div>
              <div class="detail-item">
                <div class="detail-label">Patient ID:</div>
                <div class="detail-value">${
                  prescriptionData.patient?.patient_display_id || "N/A"
                }</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${moment().format("DD/MM/YYYY")}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clinical Information -->
        <div class="clinical-info-section">
          ${
            prescriptionData.visit_note?.provisional_diagnosis
              ? `
            <div class="clinical-item">
              <div class="clinical-label">Provisional Diagnosis:</div>
              <div class="clinical-value">${prescriptionData.visit_note.provisional_diagnosis}</div>
            </div>
          `
              : ""
          }
          
          ${
            prescriptionData.visit_note?.chief_complaint
              ? `
            <div class="clinical-item">
              <div class="clinical-label">Patient's Reported Problem:</div>
              <div class="clinical-value">${prescriptionData.visit_note.chief_complaint}</div>
            </div>
          `
              : ""
          }
          
          ${
            prescriptionData.visit_note?.followup_date
              ? `
            <div class="clinical-item followup-item">
              <div class="clinical-label">Follow-up Date:</div>
              <div class="clinical-value">${moment(
                prescriptionData.visit_note.followup_date
              ).format("MMMM DD, YYYY")}</div>
            </div>
          `
              : ""
          }
        </div>

        <!-- Investigations -->
        ${
          prescriptionData.lab_tests?.length
            ? `
        <div class="investigations-section">
          <div class="section-title">Investigations Ordered</div>
          <div class="test-list">
            ${prescriptionData.lab_tests
              .map(
                (test: any, index: number) => `
              <div class="test-item">
                <span style="font-weight: bold; color: #000; margin-right: 10px;">${
                  index + 1
                }.</span>
                <span class="test-name">${test.test_display}</span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
        `
            : ""
        }

        <!-- Medications -->
        ${
          prescriptionData.medication_request?.medications?.length
            ? `
        <div class="medications-section">
          <div class="prescription-symbol">℞</div>
          <div class="section-title">Prescribed Medications</div>
          <table class="medication-table">
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">Medication Name</th>
                <th style="width: 12%;">Strength</th>
                <th style="width: 10%;">Form</th>
                <th style="width: 10%;">Route</th>
                <th style="width: 12%;">Frequency</th>
                <th style="width: 8%;">Duration</th>
                <th style="width: 18%;">Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptionData.medication_request.medications
                .map(
                  (medication: any, index: number) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${
                    index + 1
                  }</td>
                  <td class="medication-name-cell">
                    ${medication.name}
                    <div style="font-size: 10px; color: #6b7280; margin-top: 3px; font-weight: normal;">
                      ${
                        [
                          medication.timing?.morning && "Morning",
                          medication.timing?.afternoon && "Afternoon",
                          medication.timing?.evening && "Evening",
                          medication.timing?.night && "Night",
                        ]
                          .filter(Boolean)
                          .join(", ") || "As directed"
                      }
                    </div>
                  </td>
                  <td>${medication.strength || "N/A"}</td>
                  <td>${medication.form || "N/A"}</td>
                  <td>${medication.route || "N/A"}</td>
                  <td>${medication.frequency || "N/A"}</td>
                  <td>${medication.duration || "N/A"} days</td>
                  <td style="font-size: 10px;">
                    ${medication.dosage_instruction || "Take as directed"}
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

        <!-- Doctor Details and Signature -->
        <div class="doctor-section">
          <div class="doctor-details">
            <div class="doctor-info">
              <div class="doctor-name">Dr. ${
                prescriptionData.practitioner?.user?.name || "N/A"
              }</div>
              <div class="doctor-license">License No: ${
                prescriptionData.practitioner?.practitioner_display_id || "N/A"
              }</div>
              <div class="doctor-email">Email: ${
                prescriptionData.practitioner?.user?.email || "N/A"
              }</div>
            </div>
            <div class="signature-date">
              <div class="signature-line"></div>
              <div class="signature-text">Digital Signature</div>
              <div class="date-time-info">
                <div>Date: ${moment(
                  prescriptionData.medication_request?.authored_on
                ).format("DD/MM/YYYY")}</div>
                <div>Time: ${moment(
                  prescriptionData.medication_request?.authored_on
                ).format("hh:mm A")}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="prescription-footer">
          This is a digitally generated prescription. For verification, contact the clinic.<br>
          Prescription ID: ${
            prescriptionData.medication_request?.medication_display_id || "N/A"
          }
        </div>
      </body>
    </html>
  `;
};

export const handlePrintPrescription = async (
  prescriptionData: EPrescriptionDetails
): Promise<void> => {
  if (!prescriptionData) {
    console.error("No prescription data available for printing");
    return;
  }

  try {
    // Convert logo to base64 for reliable printing
    const logoBase64 = await getImageAsBase64(
      `${window.location.origin}/mm.svg`
    );

    const printWindow = window.open("", "", "width=800,height=600");

    if (printWindow) {
      const htmlContent = generatePrescriptionHTML(
        prescriptionData,
        logoBase64
      );
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for images to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      console.error("Unable to open print window");
    }
  } catch (error) {
    console.error("Error preparing prescription for printing:", error);

    // Fallback: try printing without base64 conversion
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      const htmlContent = generatePrescriptionHTML(prescriptionData);
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  }
};
