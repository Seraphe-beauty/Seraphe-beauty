"use client";

import { validatePassword } from "@/components/lib/validation/password";

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({
  password,
}: PasswordRequirementsProps) {
  const rules = validatePassword(password);

  const requirements = [
    { key: "minLength", label: "At least 12 characters" },
    { key: "uppercase", label: "One uppercase letter (A–Z)" },
    { key: "lowercase", label: "One lowercase letter (a–z)" },
    { key: "number", label: "One number (0–9)" },
    {
      key: "specialCharacter",
      label: "One special character (e.g. @, #, !)",
    },
  ] as const;

  return (
    <ul className="mt-2 space-y-1 text-xs">
      {requirements.map(({ key, label }) => {
        const valid = rules[key];

        return (
          <li key={key} className={valid ? "text-green-600" : "text-gray-500"}>
            <span aria-hidden="true">{valid ? "✓" : "○"}</span> {label}
          </li>
        );
      })}
    </ul>
  );
}
