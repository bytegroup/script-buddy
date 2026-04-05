"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface FormState {
  email:    string;
  password: string;
}

interface FieldErrors {
  email?:    string;
  password?: string;
}

// ── Eye icon SVGs (inline — no FA dependency on client) ─────────────────────
const EyeOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
             a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
             a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Validation ───────────────────────────────────────────────────────────────
function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.email.trim())         errors.email    = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email))
                                  errors.email    = "Enter a valid email.";
  if (!form.password)             errors.password = "Password is required.";
  else if (form.password.length < 4)
                                  errors.password = "Password must be at least 4 characters.";
  return errors;
}

// ────────────────────────────────────────────────────────────────────────────
export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const nextUrl      = searchParams.get("next") ?? ROUTES.FEED;

  const [form,        setForm]        = useState<FormState>({ email: "", password: "" });
  const [errors,      setErrors]      = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string>("");
  const [loading,     setLoading]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
      // Clear field error on change
      setErrors(prev => ({ ...prev, [name]: undefined }));
      setServerError("");
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const result = await signIn("credentials", {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,   // handle redirect manually
      });

      if (result?.error) {
        setServerError("Invalid email or password. Please try again.");
        return;
      }

      // Success — navigate to intended destination
      router.push(nextUrl);
      router.refresh(); // force server components to re-render with new session
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
      {/* Background shapes */}
      <div className="_shape_one">
        <Image src="/assets/images/shape1.svg" alt="" width={200} height={200} className="_shape_img" />
        <Image src="/assets/images/dark_shape.svg" alt="" width={200} height={200} className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <Image src="/assets/images/shape2.svg" alt="" width={200} height={200} className="_shape_img"  loading="eager"/>
        <Image src="/assets/images/dark_shape2.svg" alt="" width={200} height={200} className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <Image src="/assets/images/shape3.svg" alt="" width={200} height={200} className="_shape_img" />
      </div>

      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">

            {/* Left — illustration */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  <Image
                    src="/assets/images/login.png"
                    alt="Login illustration"
                    width={700}
                    height={500}
                    className="_left_img"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right — form card */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">

                {/* Logo */}
                <div className="_social_login_left_logo _mar_b28">
                  <Image src="/assets/images/logo.svg" alt="Logo" width={160} height={48} className="_left_logo" />
                </div>

                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">
                  Login to your account
                </h4>

                {/* Google (UI only — not wired) */}
                <button type="button" className="_social_login_content_btn _mar_b40">
                  <Image src="/assets/images/google.svg" alt="Google" width={20} height={20} className="_google_img" />
                  <span>Or sign-in with google</span>
                </button>

                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="alert alert-danger auth-alert _mar_b14" role="alert">
                    {serverError}
                  </div>
                )}

                {/* Form */}
                <form className="_social_login_form" onSubmit={handleSubmit} noValidate>
                  <div className="row">

                    {/* Email */}
                    <div className="col-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8" htmlFor="login-email">
                          Email
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className={`form-control _social_login_input${errors.email ? " is-invalid" : ""}`}
                          autoComplete="email"
                          disabled={loading}
                        />
                        {errors.email && (
                          <span className="field-error">{errors.email}</span>
                        )}
                      </div>
                    </div>

                    {/* Password + eye toggle */}
                    <div className="col-12">
                      <div className="_social_login_form_input _mar_b14">
                        <label className="_social_login_label _mar_b8" htmlFor="login-password">
                          Password
                        </label>
                        <div className="password-wrapper">
                          <input
                            id="login-password"
                            type={showPass ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={`form-control _social_login_input${errors.password ? " is-invalid" : ""}`}
                            autoComplete="current-password"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="eye-toggle"
                            onClick={() => setShowPass(v => !v)}
                            aria-label={showPass ? "Hide password" : "Show password"}
                          >
                            {showPass ? <EyeClosedIcon /> : <EyeOpenIcon />}
                          </button>
                        </div>
                        {errors.password && (
                          <span className="field-error">{errors.password}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="row">
                    <div className="col-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_login_form_btn_link _btn1"
                          disabled={loading}
                          style={{ opacity: loading ? 0.7 : 1 }}
                        >
                          {loading ? "Logging in…" : "Login now"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Sign-up link */}
                <div className="row">
                  <div className="col-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Don&apos;t have an account?{" "}
                        <Link href={ROUTES.REGISTER}>Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
