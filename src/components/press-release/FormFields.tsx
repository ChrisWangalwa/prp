"use client";
import { FieldValues, UseFormRegister, Path } from "react-hook-form";
import { useState } from "react";

interface FormFieldsProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  errors: any;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormFields<T extends FieldValues>({
  register,
  errors,
  onFileChange,
}: FormFieldsProps<T>) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-4">
      {/* Headline */}
      <div>
        <label className="block text-sm font-medium">Headline</label>
        <input
          type="text"
          {...register("headline" as Path<T>)}
          className={`mt-1 block w-full p-2 border rounded ${
            errors.headline ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.headline && (
          <p className="text-red-500 text-sm">{errors.headline.message}</p>
        )}
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium">Summary</label>
        <textarea
          {...register("summary" as Path<T>)}
          className={`mt-1 block w-full p-2 border rounded ${
            errors.summary ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.summary && (
          <p className="text-red-500 text-sm">{errors.summary.message}</p>
        )}
      </div>

      {/* Evidence Files */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Evidence Files{" "}
          <span className="text-gray-500 text-sm">(optional)</span>
        </label>
        <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,application/pdf"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <p className="text-gray-500 text-sm text-center px-4">
            📎 Drag & drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">
            (JPEG, PNG, PDF — max 5MB each)
          </p>
        </div>

        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
            {selectedFiles.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        )}

        {errors.files && (
          <p className="text-red-500 text-sm mt-1">{errors.files.message}</p>
        )}
      </div>
    </div>
  );
}
