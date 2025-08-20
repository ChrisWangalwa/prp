"use client";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return <div className="bg-white shadow-md rounded-lg p-6">{children}</div>;
}
