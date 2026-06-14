"use client";
import React, { useState, useEffect, FormEvent } from "react";
import "./login.css";

const API_BASE_URL = "/api";

export default function Login() {
  const [activeForm, setActiveForm] = useState<"login" | "register">("login");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [userType, setUserType] = useState("");
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: string }>({
    show: false,
    title: "",
    message: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAccountOption, setShowCreateAccountOption] = useState(false);

  const slides = [
    {
      image: "/static/assets/slider_collab.png",
      title: "Collaborative Learning",
      description: "Study groups, pair programming, and real-time collaboration with peers across your campus.",
    },
    {
      image: "/static/assets/slider_ai.png",
      title: "AI-Powered Tutors",
      description: "Receive personalized guidance, automated grading, and smart suggestions directly from our AI systems.",
    },
    {
      image: "/static/assets/slider_coding.png",
      title: "Real-time Coding",
      description: "Execute code in over 7 languages instantly with our integrated browser-based IDE and assignments playground.",
    },
    {
      image: "/static/assets/slider_game.png",
      title: "Gamified Experience",
      description: "Challenges, badges, and leaderboards to keep you motivated. Join engaging quests and level up your skills.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.altKey && (e.key === "v" || e.key === "V")) {
        setShowCreateAccountOption((prev) => {
          const newState = !prev;
          showToast(
            `Create Account option is now ${newState ? "visible" : "hidden"}`,
            "Emergency Access",
            "info"
          );
          return newState;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (message: string, title = "Success!", type = "success") => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const togglePassword = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string).trim();
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    if (!username || !password) {
      showToast("Please enter both Username and password", "Validation Error", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password, device_info: navigator.userAgent }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user_data", JSON.stringify(data.user));

        const hasLocalTheme =
          localStorage.getItem("admin_theme") ||
          localStorage.getItem("theme") ||
          localStorage.getItem("student_theme") ||
          localStorage.getItem("faculty_theme") ||
          localStorage.getItem("hod_theme");

        if (data.user && data.user.theme && !hasLocalTheme) {
          localStorage.setItem("theme", data.user.theme);
        }

        if (rememberMe) {
          localStorage.setItem("rememberEmail", username);
        } else {
          localStorage.removeItem("rememberEmail");
        }

        showToast(`Welcome ${data.user?.full_name || username}!`, "Login Successful", "success");

        setTimeout(() => {
          const type = data.user?.user_type?.toLowerCase() || "student";
          const dashboardMap: Record<string, string> = {
            student: "/student_dashboard",
            staff: "/faculty_dashboard",
            faculty: "/faculty_dashboard",
            hod: "/hod_dashboard",
            admin: "/admin",
            parent: "/parent_dashboard",
            alumni: "/alumni_dashboard",
            recruiter: "/recruiter_dashboard",
            guest: "/guest_dashboard",
          };
          window.location.href = dashboardMap[type] || "/student_dashboard";
        }, 2000);
      } else {
        showToast(data.detail || "Invalid email or password", "Login Failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Cannot connect to server. Please check backend.", "Network Error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const firstName = (formData.get("firstName") as string).trim();
    const lastName = (formData.get("lastName") as string).trim();
    const email = (formData.get("email") as string).trim();
    const username = (formData.get("username") as string).trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const type = formData.get("userType") as string;
    const department = formData.get("department") as string;
    const phone = formData.get("phone") as string;

    if (!firstName || !lastName) {
      showToast("Please enter your full name", "Validation Error", "error");
      return;
    }
    if (!email || !/^.+@.+\..+$/.test(email)) {
      showToast("Please enter a valid email address", "Validation Error", "error");
      return;
    }
    if (!username) {
      showToast("Please enter a username", "Validation Error", "error");
      return;
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters", "Validation Error", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "Validation Error", "error");
      return;
    }
    if (!type) {
      showToast("Please select user type", "Validation Error", "error");
      return;
    }

    const nonDeptUsers = ["admin", "guest", "parent", "alumni", "recruiter"];
    if (!nonDeptUsers.includes(type) && !department) {
      showToast("Please select department", "Validation Error", "error");
      return;
    }

    const registrationData: any = {
      email,
      username,
      password,
      full_name: `${firstName} ${lastName}`.trim(),
      user_type: type,
      department: formData.get("department") || undefined,
    };

    if (type === "student") {
      registrationData.roll_number = formData.get("rollNumber") || undefined;
      const year = formData.get("year");
      if (year) registrationData.year = parseInt(year as string);
    } else if (type === "faculty" || type === "staff") {
      registrationData.faculty_id = formData.get("facultyId") || undefined;
    } else if (type === "hod") {
      registrationData.hod_id = formData.get("hodId") || undefined;
    } else if (type === "parent") {
      registrationData.student_roll_number = formData.get("studentRollNumber") || undefined;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      if (response.ok) {
        showToast("Account created successfully!", "🎉 Registration Successful!", "success");
        setTimeout(() => {
          setActiveForm("login");
        }, 2000);
      } else {
        let errorMessage = "Registration failed";
        if (data.detail) {
          errorMessage = Array.isArray(data.detail) ? data.detail.map((err: any) => err.msg || err).join(", ") : data.detail.error || data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        }
        showToast(errorMessage as string, "Registration Failed", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Cannot connect to server.", "Network Error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-body">
      {/* Background effects */}
      <div className="bg-blur bg-1"></div>
      <div className="bg-blur bg-2"></div>
      <div className="bg-blur bg-3"></div>

      <div className="container">
        {/* Left side - Branding */}
        <div className="brand-section">
          <button
            className="slider-btn slider-prev"
            style={{ display: currentSlide === 0 ? "none" : "flex" }}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            className="slider-btn slider-next"
            style={{ display: currentSlide === slides.length - 1 ? "none" : "flex" }}
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          <div
            className="slider-container"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="slide"
                style={{ backgroundImage: `url('${slide.image}')` }}
              >
                <div className="slide-content">
                  <div className="logo" style={{ justifyContent: "center", marginBottom: "30px" }}>
                    <div className="logo-icon" style={{ background: "var(--primary)" }}>
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="logo-text">EduSync 4.0</div>
                  </div>
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-nav">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`slider-dot ${currentSlide === idx ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
              ></div>
            ))}
          </div>
        </div>

        {/* Right side - Forms */}
        <div className="form-section">
          <div className="form-header">
            <h1>{activeForm === "login" ? "Welcome Back!" : "Create Account"}</h1>
            <p>
              {activeForm === "login"
                ? "Sign in to access your personalized dashboard"
                : "Join EduSync 4.0 community"}
            </p>
          </div>

          {activeForm === "login" ? (
            <form className="form-container" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-group">
                  <i className="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    placeholder="Enter your username"
                    defaultValue={typeof window !== "undefined" ? localStorage.getItem("rememberEmail") || "" : ""}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword["login"] ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePassword("login")}
                  >
                    <i className={showPassword["login"] ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    defaultChecked={typeof window !== "undefined" ? !!localStorage.getItem("rememberEmail") : false}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-link">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="submit-btn">
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </button>

              <div
                className="switch-form"
                style={{ display: showCreateAccountOption ? "block" : "none" }}
              >
                Don't have an account?
                <span className="switch-link" onClick={() => setActiveForm("register")}>
                  Create Account
                </span>
              </div>
            </form>
          ) : (
            <form className="form-container" onSubmit={handleRegisterSubmit}>
              <div className="name-group">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <div className="input-group">
                    <i className="fas fa-user input-icon"></i>
                    <input type="text" className="form-input" name="firstName" placeholder="John" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <div className="input-group">
                    <i className="fas fa-user input-icon"></i>
                    <input type="text" className="form-input" name="lastName" placeholder="Doe" required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-group">
                  <i className="fas fa-envelope input-icon"></i>
                  <input type="email" className="form-input" name="email" placeholder="john.doe@college.edu" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-group">
                  <i className="fas fa-user input-icon"></i>
                  <input type="text" className="form-input" name="username" placeholder="Choose a username" required />
                </div>
              </div>

              <div className="select-group">
                <div className="form-group">
                  <label className="form-label">User Type</label>
                  <div className="input-group">
                    <i className="fas fa-user-tag input-icon"></i>
                    <select
                      className="form-input"
                      name="userType"
                      required
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                    >
                      <option value="">Select Type</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="hod">HOD</option>
                      <option value="admin">Admin</option>
                    </select>
                    <i className="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <div className="input-group">
                    <i className="fas fa-building input-icon"></i>
                    <select className="form-input" name="department">
                      <option value="">Select Department</option>
                      <option value="AD">Artificial Intelligence & Data Science</option>
                      <option value="CSE">Computer Science & Engineering</option>
                      <option value="IT">Information Technology</option>
                      <option value="ECE">Electronics & Communication</option>
                      <option value="EEE">Electrical & Electronics</option>
                      <option value="MECH">Mechanical Engineering</option>
                      <option value="CIVIL">Civil Engineering</option>
                      <option value="ADMIN">Administration</option>
                    </select>
                    <i className="fas fa-chevron-down select-icon"></i>
                  </div>
                </div>
              </div>

              {userType === "student" && (
                <div className="user-type-fields" style={{ display: "block" }}>
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <div className="input-group">
                      <i className="fas fa-id-card input-icon"></i>
                      <input type="text" className="form-input" name="rollNumber" placeholder="CS2024001" required={userType === "student"} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <div className="input-group">
                      <i className="fas fa-calendar-alt input-icon"></i>
                      <select className="form-input" name="year" required={userType === "student"}>
                        <option value="">Select Year</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                      </select>
                      <i className="fas fa-chevron-down select-icon"></i>
                    </div>
                  </div>
                </div>
              )}

              {userType === "faculty" && (
                <div className="user-type-fields" style={{ display: "block" }}>
                  <div className="form-group">
                    <label className="form-label">Faculty ID</label>
                    <div className="input-group">
                      <i className="fas fa-id-badge input-icon"></i>
                      <input type="text" className="form-input" name="facultyId" placeholder="FAC2024001" required={userType === "faculty"} />
                    </div>
                  </div>
                </div>
              )}

              {userType === "hod" && (
                <div className="user-type-fields" style={{ display: "block" }}>
                  <div className="form-group">
                    <label className="form-label">HOD ID</label>
                    <div className="input-group">
                      <i className="fas fa-id-badge input-icon"></i>
                      <input type="text" className="form-input" name="hodId" placeholder="HOD2024001" required={userType === "hod"} />
                    </div>
                  </div>
                </div>
              )}

              {userType === "parent" && (
                <div className="user-type-fields" style={{ display: "block" }}>
                  <div className="form-group">
                    <label className="form-label">Student Roll Number (Optional)</label>
                    <div className="input-group">
                      <i className="fas fa-user-graduate input-icon"></i>
                      <input type="text" className="form-input" name="studentRollNumber" placeholder="CS2024001" />
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-group">
                  <i className="fas fa-phone input-icon"></i>
                  <input type="tel" className="form-input" name="phone" placeholder="+91 9876543210" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword["register"] ? "text" : "password"}
                    className="form-input"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePassword("register")}
                  >
                    <i className={showPassword["register"] ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <i className="fas fa-lock input-icon"></i>
                  <input
                    type={showPassword["confirm"] ? "text" : "password"}
                    className="form-input"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePassword("confirm")}
                  >
                    <i className={showPassword["confirm"] ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="remember-me">
                  <input type="checkbox" name="terms" required />
                  <span>
                    I agree to the <a href="#" className="forgot-link">Terms & Conditions</a> and <a href="#" className="forgot-link">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button type="submit" className="submit-btn">
                <i className="fas fa-user-plus"></i>
                Create Account
              </button>

              <div className="switch-form">
                Already have an account?
                <a className="switch-link" onClick={() => setActiveForm("login")}>
                  Sign In
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? "show" : ""} toast-${toast.type}`}>
        <div className="toast-progress" style={{ animation: toast.show ? "progress-anim 5s linear" : "none" }}></div>
        <div className="toast-content">
          <div className="toast-icon">
            <i
              className={`fas ${
                toast.type === "success"
                  ? "fa-check-circle"
                  : toast.type === "error"
                  ? "fa-exclamation-circle"
                  : "fa-info-circle"
              }`}
            ></i>
          </div>
          <div className="toast-details">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast((prev) => ({ ...prev, show: false }))}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <div className={`loading-overlay ${isLoading ? "active" : ""}`}>
        <div className="loader"></div>
        <div className="loading-text">Processing...</div>
      </div>
    </div>
  );
}
