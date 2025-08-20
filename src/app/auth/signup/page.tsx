"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthActions } from "@/hooks/useAuthActions";
import AuthForm from "@/components/auth/AuthForm";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/config/firebase";

const emailSchema = yup.object({
  fullName: yup.string().required("Full name is required").default(""),
  email: yup
    .string()
    .email("Invalid email")
    .matches(
      /@[\w-]+\.(com|org|africa|co\.ke)$/i,
      "Must use official organization email"
    )
    .required("Email is required")
    .default(""),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .required("Password is required")
    .default(""),
  agree: yup
    .boolean()
    .oneOf([true], "You must agree to the terms")
    .required()
    .default(false),
});

const endorsementSchema = yup.object({
  userEmail: yup
    .string()
    .email("Invalid email")
    .matches(
      /@[\w-]+\.(com|org|co\.ke)$/i,
      "Must use official organization email"
    )
    .required("Your email is required")
    .default(""),
  endorserEmail: yup
    .string()
    .email("Invalid email")
    .required("Endorser email is required")
    .default(""),
  organization: yup.string().required("Organization is required").default(""),
});

const inviteSchema = yup.object({
  inviteCode: yup.string().required("Invite code is required").default(""),
});

type EmailFormData = yup.InferType<typeof emailSchema>;
type EndorsementFormData = yup.InferType<typeof endorsementSchema>;
type InviteFormData = yup.InferType<typeof inviteSchema>;

export default function SignupPage() {
  const { signUp, error, loading } = useAuthActions();
  const [activeTab, setActiveTab] = useState("email");
  const emailForm = useForm<EmailFormData>({
    resolver: yupResolver(emailSchema),
  });
  const endorsementForm = useForm<EndorsementFormData>({
    resolver: yupResolver(endorsementSchema),
  });
  const inviteForm = useForm<InviteFormData>({
    resolver: yupResolver(inviteSchema),
  });
  const [endorsementError, setEndorsementError] = useState<string | null>(null);
  const [endorsementLoading, setEndorsementLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName);
      alert("Signup successful! Please verify your email.");
    } catch (err) {
      console.error(err);
    }
  };

  const onEndorsementSubmit = async (data: EndorsementFormData) => {
    setEndorsementLoading(true);
    setEndorsementError(null);
    try {
      const requestEndorsement = httpsCallable(functions, "requestEndorsement");
      await requestEndorsement({
        userEmail: data.userEmail,
        endorserEmail: data.endorserEmail,
        organization: data.organization,
      });
      alert("Endorsement request sent!");
    } catch (err: any) {
      setEndorsementError(err.message || "Failed to request endorsement");
    } finally {
      setEndorsementLoading(false);
    }
  };

  const onInviteSubmit = async (data: InviteFormData) => {
    setInviteLoading(true);
    setInviteError(null);
    try {
      const verifyInviteCode = httpsCallable(functions, "verifyInviteCode");
      await verifyInviteCode({ inviteCode: data.inviteCode });
      alert("Invite code verified! Proceed with signup.");
    } catch (err: any) {
      setInviteError(err.message || "Invalid invite code");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">
        Join a Verified, Truthful Network of Communication PRofessionals
      </h1>
      <div className="flex mb-4 border-b">
        <button
          className={`flex-1 p-2 ${
            activeTab === "email" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("email")}
        >
          Sign Up with Email
        </button>
        <button
          className={`flex-1 p-2 ${
            activeTab === "endorsement"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("endorsement")}
        >
          Request Endorsement
        </button>
        <button
          className={`flex-1 p-2 ${
            activeTab === "invite" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("invite")}
        >
          Use Invite Code
        </button>
      </div>
      {activeTab === "email" && (
        <AuthForm
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          fields={[
            {
              label: "Full Name",
              name: "fullName",
              type: "text",
              register: emailForm.register,
              error: emailForm.formState.errors.fullName,
            },
            {
              label: "Official Organization Email",
              name: "email",
              type: "email",
              register: emailForm.register,
              error: emailForm.formState.errors.email,
            },
            {
              label: "Password",
              name: "password",
              type: "password",
              register: emailForm.register,
              error: emailForm.formState.errors.password,
            },
            {
              label: "I agree to the terms of service",
              name: "agree",
              type: "checkbox",
              register: emailForm.register,
              error: emailForm.formState.errors.agree,
            },
          ]}
          submitText="Sign Up"
          loading={loading}
          globalError={error}
        />
      )}
      {activeTab === "endorsement" && (
        <AuthForm
          onSubmit={endorsementForm.handleSubmit(onEndorsementSubmit)}
          fields={[
            {
              label: "Your Email",
              name: "userEmail",
              type: "email",
              register: endorsementForm.register,
              error: endorsementForm.formState.errors.userEmail,
            },
            {
              label: "Endorser Email",
              name: "endorserEmail",
              type: "email",
              register: endorsementForm.register,
              error: endorsementForm.formState.errors.endorserEmail,
            },
            {
              label: "Your Organization",
              name: "organization",
              type: "text",
              register: endorsementForm.register,
              error: endorsementForm.formState.errors.organization,
            },
          ]}
          submitText="Request Endorsement"
          loading={endorsementLoading}
          globalError={endorsementError}
        />
      )}
      {activeTab === "invite" && (
        <AuthForm
          onSubmit={inviteForm.handleSubmit(onInviteSubmit)}
          fields={[
            {
              label: "Invite Code",
              name: "inviteCode",
              type: "text",
              register: inviteForm.register,
              error: inviteForm.formState.errors.inviteCode,
            },
          ]}
          submitText="Verify Invite Code"
          loading={inviteLoading}
          globalError={inviteError}
        />
      )}
    </div>
  );
}
