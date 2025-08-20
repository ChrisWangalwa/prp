"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function Button({
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
