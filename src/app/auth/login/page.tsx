"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthActions } from "@/hooks/useAuthActions";
import AuthForm from "@/components/auth/AuthForm";
import { useRouter } from "next/navigation"; // ✅ import router

const schema = yup
  .object({
    email: yup
      .string()
      .email("Invalid email")
      .required("Email is required")
      .default(""),
    password: yup.string().required("Password is required").default(""),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export default function LoginPage() {
  const { logIn, error, loading } = useAuthActions();
  const router = useRouter(); // ✅ initialize router

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await logIn(data.email, data.password);
      alert("Login successful!");
      router.push("/main/dashboard"); // ✅ redirect after login
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Log In to PRP</h1>
      <AuthForm
        onSubmit={handleSubmit(onSubmit)}
        fields={[
          {
            label: "Email",
            name: "email",
            type: "email",
            register,
            error: errors.email,
          },
          {
            label: "Password",
            name: "password",
            type: "password",
            register,
            error: errors.password,
          },
        ]}
        submitText="Log In"
        loading={loading}
        globalError={error}
      />
    </div>
  );
}
