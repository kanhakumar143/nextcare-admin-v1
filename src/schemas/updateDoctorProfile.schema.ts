import * as z from "zod";

// Individual schema components
export const qualificationSchema = z.object({
  year: z
    .string()
    .min(4, "Year must be 4 digits")
    .max(4, "Year must be 4 digits")
    .regex(/^\d{4}$/, "Year must be a valid 4-digit number"),
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
});

// Telecom schema for dynamic contact information
export const telecomSchema = z.object({
  system: z.enum(["phone", "email"]),
  value: z.string(), // Allow empty for primary (read-only) contacts
  use: z.enum(["mobile", "work", "home"]).optional(),
  rank: z.union([z.literal(1), z.literal(0)]), // 1 = primary, 0 = secondary
  period: z.any().optional().nullable(),
});

// Main profile update schema
export const profileUpdateSchema = z.object({
  // Personal Information
  prefix: z.string().optional(),
  given: z.string().min(1, "First name is required"),
  family: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female", "other"]),
  birth_date: z.string().min(1, "Birth date is required"),

  // Dynamic Contact Information
  telecom: z
    .array(telecomSchema)
    .refine(
      (telecoms) => {
        // Only validate secondary contacts for required values
        const secondaryContacts = telecoms.filter((t) => t.rank === 0);
        return secondaryContacts.every(
          (contact) => contact.value.trim() !== ""
        );
      },
      {
        message: "Secondary contact values cannot be empty",
      }
    )
    .refine(
      (telecoms) => {
        // Validate secondary phone numbers
        const secondaryPhones = telecoms.filter(
          (t) => t.system === "phone" && t.rank === 0
        );
        return secondaryPhones.every(
          (phone) =>
            /^[+]?[\d\s\-\(\)]*$/.test(phone.value) && phone.value.length >= 10
        );
      },
      {
        message: "Invalid secondary phone number format or length",
      }
    )
    .refine(
      (telecoms) => {
        // Validate secondary email addresses
        const secondaryEmails = telecoms.filter(
          (t) => t.system === "email" && t.rank === 0
        );
        return secondaryEmails.every(
          (email) => z.string().email().safeParse(email.value).success
        );
      },
      {
        message: "Invalid secondary email format",
      }
    ),

  // Professional Information
  qualifications: z
    .array(qualificationSchema)
    .min(1, "At least one qualification is required"),
});

// Type inference
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type QualificationData = z.infer<typeof qualificationSchema>;
export type TelecomData = z.infer<typeof telecomSchema>;
