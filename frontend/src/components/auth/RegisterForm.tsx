"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

interface FormState {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
}

interface FieldErrors {
  firstName?: string;
  lastName?:  string;
  email?:     string;
  password?:  string;
}

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

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required.";
  if (!form.lastName.trim())  errors.lastName  = "Last name is required.";
  if (!form.email.trim())     errors.email     = "Email is required.";
  else if (!/\S+@\S+\.\S+/.test(form.email))
                              errors.email     = "Enter a valid email.";
  if (!form.password)         errors.password  = "Password is required.";
  else if (form.password.length < 4)
                              errors.password  = "Password must be at least 4 characters.";
  return errors;
}

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName:  "",
    email:     "",
    password:  "",
  });
  const [errors,        setErrors]        = useState<FieldErrors>({});
  const [serverError,   setServerError]   = useState<string>("");
  const [successMsg,    setSuccessMsg]    = useState<string>("");
  const [loading,       setLoading]       = useState(false);
  const [showPass,      setShowPass]      = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
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
      // POST to our Next.js API route which proxies to backend
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
          email:     form.email.trim().toLowerCase(),
          password:  form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle field-level errors from server
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.message ?? "Registration failed. Please try again.");
        }
        return;
      }

      setSuccessMsg("Account created! Redirecting to login…");
      setTimeout(() => router.push(ROUTES.LOGIN), 1500);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      {/* Background shapes */}
      <div className="_shape_one">
        <Image src="/assets/images/shape1.svg" alt="" width={200} height={200} className="_shape_img" />
        <Image src="/assets/images/dark_shape.svg" alt="" width={200} height={200} className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <Image src="/assets/images/shape2.svg" alt="" width={200} height={200} className="_shape_img" loading="eager"/>
        <Image src="/assets/images/dark_shape2.svg" alt="" width={200} height={200} className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        <Image src="/assets/images/shape3.svg" alt="" width={200} height={200} className="_shape_img" />
      </div>

      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">

            {/* Left — illustration */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <Image
                    src="/assets/images/registration.png"
                    alt="Registration illustration"
                    width={700}
                    height={500}
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right — form card */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">

                {/* Logo */}
                <div className="_social_registration_right_logo _mar_b28">
                  <Image src="/assets/images/logo.svg" alt="Logo" width={160} height={48} className="_right_logo" />
                </div>

                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                  Registration
                </h4>

                {/* Google (UI only) */}
                <button type="button" className="_social_registration_content_btn _mar_b40">
                  <Image src="/assets/images/google.svg" alt="Google" width={20} height={20} className="_google_img" />
                  <span>Register with google</span>
                </button>

                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                {/* Alerts */}
                {serverError && (
                  <div className="alert alert-danger auth-alert _mar_b14" role="alert">
                    {serverError}
                  </div>
                )}
                {successMsg && (
                  <div className="alert alert-success auth-alert _mar_b14" role="alert">
                    {successMsg}
                  </div>
                )}

                {/* Form */}
                <form className="_social_registration_form" onSubmit={handleSubmit} noValidate>
                  <div className="row">

                    {/* First Name */}
                    <div className="col-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-firstName">
                          First Name
                        </label>
                        <input
                          id="reg-firstName"
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          className={`form-control _social_registration_input${errors.firstName ? " is-invalid" : ""}`}
                          autoComplete="given-name"
                          disabled={loading}
                        />
                        {errors.firstName && (
                          <span className="field-error">{errors.firstName}</span>
                        )}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="col-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-lastName">
                          Last Name
                        </label>
                        <input
                          id="reg-lastName"
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          className={`form-control _social_registration_input${errors.lastName ? " is-invalid" : ""}`}
                          autoComplete="family-name"
                          disabled={loading}
                        />
                        {errors.lastName && (
                          <span className="field-error">{errors.lastName}</span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-email">
                          Email
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className={`form-control _social_registration_input${errors.email ? " is-invalid" : ""}`}
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
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8" htmlFor="reg-password">
                          Password
                        </label>
                        <div className="password-wrapper">
                          <input
                            id="reg-password"
                            type={showPass ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min. 4 characters"
                            className={`form-control _social_registration_input${errors.password ? " is-invalid" : ""}`}
                            autoComplete="new-password"
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
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          disabled={loading}
                          style={{ opacity: loading ? 0.7 : 1 }}
                        >
                          {loading ? "Creating…" : "Register"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Sign-in link */}
                <div className="row">
                  <div className="col-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{" "}
                        <Link href={ROUTES.LOGIN}>Login here</Link>
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
