"use client";
import React from "react";
import {
  FieldError,
  UseFormRegister,
  FieldValues,
  Path,
} from "react-hook-form";

type FieldConfig<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  type: string;
  register: UseFormRegister<T>;
  error?: FieldError;
};

export type AuthFormProps<T extends FieldValues = any> = {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  fields: FieldConfig<T>[];
  submitText: string;
  loading: boolean;
  globalError: string | null;
  successMessage?: string | null;
};

export default function AuthForm<T extends FieldValues>({
  onSubmit,
  fields,
  submitText,
  loading,
  globalError,
  successMessage,
}: AuthFormProps<T>) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          {field.type !== "checkbox" && (
            <label className="block text-sm font-medium">{field.label}</label>
          )}
          <input
            type={field.type}
            {...field.register(field.name)}
            className={`mt-1 block w-full p-2 border rounded ${
              field.error ? "border-red-500" : "border-gray-300"
            }`}
          />
          {field.type === "checkbox" && (
            <label className="ml-2 text-sm">{field.label}</label>
          )}
          {field.error && (
            <p className="text-red-500 text-sm">{field.error.message}</p>
          )}
        </div>
      ))}

      {/* ✅ Success or error messages */}
      {successMessage && (
        <p className="text-green-600 font-medium">{successMessage}</p>
      )}
      {globalError && !successMessage && (
        <p className="text-red-600 font-medium">{globalError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : submitText}
      </button>
    </form>
  );
}
