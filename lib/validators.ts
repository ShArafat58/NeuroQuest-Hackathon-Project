import { z } from "zod";

// Helper for dynamic age check (13 to 25 years old from today)
const ageValidation = (date: Date) => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age >= 13 && age <= 25;
};

// Password criteria: min 8 chars, at least 1 letter and 1 number
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .refine(
    (val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val),
    "Password must contain at least 1 letter and 1 number"
  );

// 6-digit OTP code validation
const otpCodeSchema = z
  .string()
  .length(6, "Code must be exactly 6 digits")
  .regex(/^\d+$/, "Code must contain numbers only");

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be under 100 characters"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address"),
    birthdate: z
      .string()
      .min(1, "Birthdate is required")
      .refine(
        (val) => {
          const date = new Date(val);
          return !isNaN(date.getTime()) && ageValidation(date);
        },
        {
          message: "You must be between 13 and 25 years old to join NeuroQuest.",
        }
      ),
    password: passwordSchema,
    confirm_password: z.string(),
    version: z.enum(["bangla", "english"], {
      message: "Please select a version",
    }),
    current_class: z.enum(["ssc", "hsc_1", "hsc_2", "ielts", "medical"], {
      message: "Please select your current class",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    code: otpCodeSchema,
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const verifyEmailSchema = z.object({
  code: otpCodeSchema,
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string()
    .min(8, "Password must be at least 8 characters")
    .refine(val => /[a-zA-Z]/.test(val) && /[0-9]/.test(val),
      "Password must contain at least 1 letter and 1 number"),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const changeClassSchema = z.object({
  new_class: z.enum(['ssc', 'hsc_1', 'hsc_2', 'ielts', 'medical']),
});

export const changeVersionSchema = z.object({
  new_version: z.enum(['bangla', 'english']),
});

export const selectionSchema = z.object({
  subject_id: z.string().uuid(),
  chapter_id: z.string().uuid(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeClassInput = z.infer<typeof changeClassSchema>;
export type ChangeVersionInput = z.infer<typeof changeVersionSchema>;
export type SelectionInput = z.infer<typeof selectionSchema>;
