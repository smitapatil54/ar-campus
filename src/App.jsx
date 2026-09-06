import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUp,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Coffee,
  Compass,
  DoorOpen,
  GraduationCap,
  HeartPulse,
  Home,
  Info,
  LayoutDashboard,
  Library,
  ListChecks,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  PauseCircle,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Route,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Campus3D from "./Campus3D";

/* =========================================================
   CONSTANTS
========================================================= */

const LOGO_PATH = "/Chill Campus logo.jpeg";
const OFFICIAL_DOMAIN = "@mhssce.ac.in";
const DEMO_OTP = "123456";

function getFacultyTitle(faculty) {
  if (faculty?.gender === "Male") return "Mr.";
  if (faculty?.gender === "Female") return "Ms.";
  if (faculty?.title) return faculty.title;
  if (faculty?.name?.toLowerCase().includes("fardeen")) return "Mr.";
  return "Ms.";
}

const ROOM_GEOFENCES = {
  "IT-302": {
    lat: 19.0019,
    lng: 73.9396,
    radius: 45,
  },
  "IT-301": {
    lat: 19.0022,
    lng: 73.9398,
    radius: 45,
  },
  "IT-303": {
    lat: 19.0024,
    lng: 73.9394,
    radius: 45,
  },
  "IT Lab": {
    lat: 19.0026,
    lng: 73.9397,
    radius: 50,
  },
  "AI Lab": {
    lat: 19.0028,
    lng: 73.9395,
    radius: 50,
  },
};

const TIMETABLE = [
  {
    day: "Monday",
    time: "09:00 AM",
    subject: "Database Management System",
    teacher: "Mehta",
    title: "Prof.",
    room: "IT-302",
  },
  {
    day: "Monday",
    time: "11:00 AM",
    subject: "UI/UX",
    teacher: "Fardeen",
    title: "Mr.",
    room: "IT Lab",
  },
  {
    day: "Tuesday",
    time: "10:00 AM",
    subject: "Data Structures",
    teacher: "Patil",
    title: "Prof.",
    room: "IT-301",
  },
  {
    day: "Tuesday",
    time: "01:00 PM",
    subject: "Computer Networks",
    teacher: "Khan",
    title: "Prof.",
    room: "IT-302",
  },
  {
    day: "Wednesday",
    time: "09:00 AM",
    subject: "Software Engineering",
    teacher: "Joshi",
    title: "Prof.",
    room: "IT-303",
  },
  {
    day: "Wednesday",
    time: "11:00 AM",
    subject: "Artificial Intelligence",
    teacher: "Deshmukh",
    title: "Prof.",
    room: "AI Lab",
  },
  {
    day: "Thursday",
    time: "10:00 AM",
    subject: "Operating Systems",
    teacher: "Kulkarni",
    title: "Prof.",
    room: "IT-301",
  },
  {
    day: "Thursday",
    time: "02:00 PM",
    subject: "Web Technology",
    teacher: "Shah",
    title: "Prof.",
    room: "IT Lab",
  },
  {
    day: "Friday",
    time: "09:00 AM",
    subject: "Cloud Computing",
    teacher: "Rao",
    title: "Prof.",
    room: "IT-302",
  },
];

/* =========================================================
   DEMO STUDENTS
========================================================= */

const INITIAL_STUDENTS = [
  {
    id: 1,
    roll: "241431",
    name: "Abubakkar",
    location: "inside",
    lat: 19.00191,
    lng: 73.93961,
    attendance: "Pending",
  },
  {
    id: 2,
    roll: "241436",
    name: "Jainabbi",
    location: "inside",
    lat: 19.00192,
    lng: 73.93959,
    attendance: "Pending",
  },
  {
    id: 3,
    roll: "241437",
    name: "Smita",
    location: "inside",
    lat: 19.00189,
    lng: 73.93958,
    attendance: "Pending",
  },
  {
    id: 4,
    roll: "241440",
    name: "Samad",
    location: "inside",
    lat: 19.00188,
    lng: 73.93963,
    attendance: "Pending",
  },
  {
    id: 5,
    roll: "241442",
    name: "Ayesha",
    location: "outside",
    lat: 19.0034,
    lng: 73.9411,
    attendance: "Pending",
  },
  {
    id: 6,
    roll: "241445",
    name: "Rehan",
    location: "outside",
    lat: 19.0041,
    lng: 73.9383,
    attendance: "Pending",
  },
  {
    id: 7,
    roll: "241448",
    name: "Fardeen",
    location: "outside",
    lat: 19.0005,
    lng: 73.9375,
    attendance: "Pending",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function distanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function speak(text) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getTeacherGreeting(teacher) {
  const nextLecture =
    TIMETABLE.find(
      (item) =>
        item.teacher.toLowerCase() === teacher.name.toLowerCase()
    ) || TIMETABLE[1];

  return `${getGreeting()}, ${getFacultyTitle(teacher)} ${teacher.name}. Welcome back. You have your ${nextLecture.subject} lecture at ${nextLecture.time} in the ${nextLecture.room}. Would you like me to guide you there?`;
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function Logo({ className = "" }) {
  return (
    <img
      src={LOGO_PATH}
      alt="Chill Campus"
      className={`campus-logo ${className}`}
    />
  );
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      className="icon-button"
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="theme-switcher">
      <button
        className={theme === "sky" ? "theme-active" : ""}
        onClick={() => setTheme("sky")}
      >
        <span className="theme-dot sky-dot" />
        Sky
      </button>

      <button
        className={theme === "rose" ? "theme-active" : ""}
        onClick={() => setTheme("rose")}
      >
        <span className="theme-dot rose-dot" />
        Rose
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={20} />
      </div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return <section className={`glass-card ${className}`}>{children}</section>;
}

/* =========================================================
   LANDING
========================================================= */

function LandingPage({ theme, setTheme, onStart }) {
  return (
    <div className="landing">
      <div className="landing-orb orb-one" />
      <div className="landing-orb orb-two" />

      <header className="landing-header">
        <div className="brand">
          <Logo />
          <div>
            <strong>3D CAMPUS</strong>
            <span>SMART CAMPUS EXPERIENCE</span>
          </div>
        </div>

        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </header>

      <main className="landing-main">
        <div className="landing-copy">
          <div className="availability-pill">
            <span />
            AI-POWERED CAMPUS EXPERIENCE
          </div>

          <div className="hero-logo-container">
            <div className="lens-flare" />
            <Logo className="hero-logo" />
          </div>

          <div className="hero-brand">3D CAMPUS</div>

          <h1>
            Find
            <br />
            Your Way<span>.</span>
          </h1>

          <p>
            Navigate your campus with intelligent AR directions,
            real-time campus information and an AI assistant built
            for students and faculty.
          </p>

          <button className="hero-button" onClick={onStart}>
            Get Started
            <ArrowRight size={19} />
          </button>

          <div className="secure-note">
            <ShieldCheck size={17} />
            Official college email required
          </div>
        </div>

        <div className="landing-visual">
          <div className="floating-map-card">
            <div className="mini-map-top">
              <span>3D CAMPUS</span>
              <span className="live-pill">
                <span />
                LIVE
              </span>
            </div>

            <div className="mini-map">
              <div className="map-road road-a" />
              <div className="map-road road-b" />
              <div className="map-road road-c" />

              <div className="building building-a">
                MAIN BLOCK
              </div>

              <div className="building building-b">
                IT BLOCK
              </div>

              <div className="building building-c">
                LIBRARY
              </div>

              <div className="map-user">
                <div />
              </div>

              <div className="map-route">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="mini-map-bottom">
              <div>
                <Navigation size={15} />
                <span>Your location</span>
              </div>

              <strong>2.4 min</strong>
            </div>
          </div>

          <div className="floating-assistant">
            <div className="assistant-icon">
              <Sparkles size={17} />
            </div>
            <div>
              <strong>Campus AI</strong>
              <span>Ready to guide you</span>
            </div>
            <Volume2 size={17} />
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   AUTH
========================================================= */

function AuthPage({ onLogin, onBack }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const validateEmail = () => {
    return email.trim().toLowerCase().endsWith(OFFICIAL_DOMAIN);
  };

  const sendOtp = () => {
    setError("");

    if (!validateEmail()) {
      setError(
        `Please use your official college email ending with ${OFFICIAL_DOMAIN}`
      );
      return;
    }

    setOtpSent(true);
  };

  const submit = () => {
    setError("");

    if (!validateEmail()) {
      setError(
        `Only ${OFFICIAL_DOMAIN} email addresses are accepted.`
      );
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!otpSent) {
      setError("Please send the verification code first.");
      return;
    }

    if (otp !== DEMO_OTP) {
      setError("Invalid verification code. Use 123456 for this prototype.");
      return;
    }

    const user =
      role === "faculty"
        ? {
            role: "faculty",
            name: name.trim() || "Fardeen",
            gender,
            title: gender === "Male" ? "Mr." : "Ms.",
            email,
          }
        : {
            role,
            name: name.trim() || "Samayra",
            email,
          };

    onLogin(user);
  };

  return (
    <div className="auth-screen">
      <div className="auth-glow" />

      <div className="auth-card">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>

        <Logo className="auth-logo" />

        <div className="auth-title">
          <span>3D CAMPUS</span>
          <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
          <p>
            {mode === "login"
              ? "Sign in to continue your smart campus experience."
              : "Register with your official college email."}
          </p>
        </div>

        <div className="role-tabs">
          <button
            className={role === "student" ? "selected" : ""}
            onClick={() => setRole("student")}
          >
            <GraduationCap size={17} />
            Student
          </button>

          <button
            className={role === "faculty" ? "selected" : ""}
            onClick={() => setRole("faculty")}
          >
            <Users size={17} />
            Faculty
          </button>

          <button
            className={role === "admin" ? "selected" : ""}
            onClick={() => setRole("admin")}
          >
            <ShieldCheck size={17} />
            Admin
          </button>
        </div>

        {mode === "register" && (
          <label className="field">
            <span>Full name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                role === "faculty"
                  ? "e.g. Fardeen"
                  : "e.g. Samayra"
              }
            />
          </label>
        )}

                {role === "faculty" && (
          <label className="field">
            <span>Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>
        )}

        <label className="field">
          <span>Official college email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mhssce.ac.in"
          />
        </label>

        <div className="otp-row">
          <label className="field">
            <span>Verification code</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
            />
          </label>

          <button className="secondary-button otp-button" onClick={sendOtp}>
            {otpSent ? "Code Sent" : "Send Code"}
          </button>
        </div>

        {otpSent && (
          <div className="demo-otp">
            <Info size={16} />
            Demo verification code: <strong>123456</strong>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        <button className="primary-button full-button" onClick={submit}>
          {mode === "login" ? "Sign In" : "Create Account"}
          <ArrowRight size={18} />
        </button>

        <button
          className="mode-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ user, page, setPage, onLogout }) {
  const studentMenus = [
    ["dashboard", "Home", Home],
    ["navigation", "AR Navigation", Navigation],
    ["rooms", "Rooms & Facilities", Building2],
    ["timetable", "Timetable", CalendarDays],
    ["attendance", "Attendance", CheckCircle2],
    ["assignments", "Assignments", ListChecks],
    ["events", "Events", CalendarDays],
    ["notices", "Notices", Bell],
    ["canteen", "Canteen Crowd", Coffee],
    ["ai", "Campus AI", Sparkles],
  ];

  const facultyMenus = [
    ["dashboard", "Dashboard", Home],
    ["navigation", "AR Navigation", Navigation],
    ["rooms", "Rooms & Facilities", Building2],
    ["timetable", "My Timetable", CalendarDays],
    ["attendance", "Attendance", CheckCircle2],
    ["assignments", "Assignments", ListChecks],
    ["canteen", "Canteen", Coffee],
    ["events", "Events", CalendarDays],
    ["notices", "Notices", Bell],
    ["ai", "Campus AI", Sparkles],
  ];

  const adminMenus = [
    ["dashboard", "Dashboard", Home],
    ["admin-users", "User Management", Users],
    ["admin-attendance", "Attendance Monitor", CheckCircle2],
    ["admin-events", "Events & Notices", CalendarDays],
    ["admin-facilities", "Facilities", Building2],
    ["canteen", "Canteen", Coffee],
    ["admin-monitor", "Campus Monitor", Activity],
    ["ai", "Campus AI", Sparkles],
  ];

  const menus =
    user.role === "faculty"
      ? facultyMenus
      : user.role === "admin"
      ? adminMenus
      : studentMenus;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo />
        <div>
          <strong>3D CAMPUS</strong>
          <span>SMART CAMPUS</span>
        </div>
      </div>

      <div className="user-mini">
        <div className="avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>
            {user.role === "faculty"
              ? `${getFacultyTitle(user)} ${user.name}`
              : user.name}
          </strong>
          <span>
            {user.role === "faculty"
              ? "Faculty"
              : user.role === "admin"
              ? "Administrator"
              : "Student"}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menus.map(([id, label, Icon]) => (
          <button
            key={id}
            className={page === id ? "nav-active" : ""}
            onClick={() => setPage(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
            {page === id && <ChevronRight size={15} />}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button onClick={() => setPage("profile")}>
          <Settings size={18} />
          Settings
        </button>

        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   TOP BAR
========================================================= */

function TopBar({
  user,
  theme,
  setTheme,
  onMenu,
  voiceEnabled,
  setVoiceEnabled,
}) {
  return (
    <header className="topbar">
      <div className="mobile-menu">
        <IconButton onClick={onMenu} label="Open menu">
          <Menu size={20} />
        </IconButton>
      </div>

      <div className="topbar-title">
        <span>3D CAMPUS</span>
        <strong>
          {user.role === "faculty"
            ? "Faculty workspace"
            : user.role === "admin"
            ? "Administration"
            : "Student workspace"}
        </strong>
      </div>

      <div className="topbar-actions">
        <ThemeSwitcher theme={theme} setTheme={setTheme} />

        <IconButton
          label={voiceEnabled ? "Mute voice" : "Enable voice"}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
        >
          {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </IconButton>

        <div className="top-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

function StudentDashboard({
  user,
  setPage,
  assignments,
  canteenCrowd,
}) {
  const pending = assignments.filter((x) => !x.completed).length;

  return (
    <div>
      <PageHeader
        eyebrow="STUDENT"
        title={`Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${
          user.name
        }.`}
        description="Everything you need for your day on campus, in one place."
      />

      <div className="stats-grid">
        <StatCard
          icon={CalendarDays}
          label="Next lecture"
          value="11:00 AM"
          detail="UI/UX · IT Lab"
        />

        <StatCard
          icon={CheckCircle2}
          label="Attendance"
          value="86%"
          detail="Above 75% requirement"
        />

        <StatCard
          icon={ListChecks}
          label="Assignments"
          value={pending}
          detail="Pending completion"
        />

        <StatCard
          icon={Coffee}
          label="Canteen"
          value={`${canteenCrowd}%`}
          detail="Current crowd estimate"
        />
      </div>

      <div className="dashboard-grid">
        <GlassCard className="next-class-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">NEXT LECTURE</span>
              <h2>UI/UX</h2>
            </div>
            <div className="time-badge">11:00 AM</div>
          </div>

          <div className="class-details">
            <span>
              <Users size={16} />
              Mr. Fardeen
            </span>
            <span>
              <MapPin size={16} />
              IT Lab
            </span>
          </div>

          <button
            className="primary-button"
            onClick={() => setPage("navigation")}
          >
            Guide me there
            <Navigation size={17} />
          </button>
        </GlassCard>

        <GlassCard>
          <div className="card-heading">
            <div>
              <span className="eyebrow">STUDY FOCUS</span>
              <h2>Keep your streak going.</h2>
            </div>
            <Sparkles size={22} />
          </div>

          <p className="muted">
            You have {pending} assignments remaining. Complete
            your nearest deadline first.
          </p>

          <button
            className="soft-button"
            onClick={() => setPage("assignments")}
          >
            Open assignments
            <ArrowRight size={16} />
          </button>
        </GlassCard>
      </div>

      <GlassCard className="assistant-banner">
        <div className="assistant-large-icon">
          <Sparkles />
        </div>

        <div>
          <span className="eyebrow">CAMPUS AI</span>
          <h2>Ask me anything about your campus.</h2>
          <p>
            Find classrooms, faculty, events, assignments,
            timetable and navigation.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setPage("ai")}
        >
          Ask Campus AI
          <MessageCircle size={17} />
        </button>
      </GlassCard>
    </div>
  );
}

/* =========================================================
   FACULTY DASHBOARD
========================================================= */

function FacultyDashboard({
  user,
  setPage,
  attendance,
  lectureStarted,
  lectureEnded,
  canteenCrowd,
}) {
  const teacherLecture =
    TIMETABLE.find(
      (x) =>
        x.teacher.toLowerCase() === user.name.toLowerCase()
    ) || TIMETABLE[1];

  const presentCount = attendance.filter(
    (x) => x.attendance === "Present"
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="FACULTY"
        title={`Welcome back, ${getFacultyTitle(user)} ${user.name}.`}
        description="Your lectures, attendance, assignments and campus tools."
      />

      <div className="teacher-hero">
        <div>
          <span className="eyebrow">NEXT LECTURE</span>

          <h2>{teacherLecture.subject}</h2>

          <p>
            {teacherLecture.time} · {teacherLecture.room}
          </p>

          <div className="teacher-hero-actions">
            <button
              className="primary-button"
              onClick={() => setPage("navigation")}
            >
              Navigate to classroom
              <Navigation size={17} />
            </button>

            <button
              className="soft-button"
              onClick={() => setPage("attendance")}
            >
              Open attendance
              <CheckCircle2 size={17} />
            </button>
          </div>
        </div>

        <div className="teacher-voice-card">
          <div className="voice-pulse">
            <Volume2 size={22} />
          </div>

          <div>
            <span>Campus Assistant</span>
            <strong>Ready to assist</strong>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={CalendarDays}
          label="Today's lectures"
          value="1"
          detail={teacherLecture.subject}
        />

        <StatCard
          icon={CheckCircle2}
          label="Present students"
          value={presentCount}
          detail={lectureEnded ? "Location verified" : "After lecture ends"}
        />

        <StatCard
          icon={ListChecks}
          label="Assignments"
          value="6"
          detail="Student submissions"
        />

        <StatCard
          icon={Coffee}
          label="Canteen"
          value={`${canteenCrowd}%`}
          detail={
            canteenCrowd > 70
              ? "High crowd · wait recommended"
              : "Comfortable"
          }
        />
      </div>

      <div className="dashboard-grid">
        <GlassCard>
          <div className="card-heading">
            <div>
              <span className="eyebrow">LECTURE STATUS</span>
              <h2>{lectureStarted ? "Lecture in progress" : "Ready to teach"}</h2>
            </div>

            {lectureStarted ? (
              <span className="status-pill live">
                <Radio size={13} />
                LIVE
              </span>
            ) : (
              <span className="status-pill">
                <Check size={13} />
                READY
              </span>
            )}
          </div>

          <div className="lecture-status-line">
            <span>
              <BookOpen size={17} />
              {teacherLecture.subject}
            </span>

            <span>
              <MapPin size={17} />
              {teacherLecture.room}
            </span>

            <span>
              <ClockIcon />
              {teacherLecture.time}
            </span>
          </div>

          <button
            className="soft-button"
            onClick={() => setPage("attendance")}
          >
            Manage lecture attendance
            <ArrowRight size={16} />
          </button>
        </GlassCard>

        <GlassCard>
          <div className="card-heading">
            <div>
              <span className="eyebrow">QUICK TOOLS</span>
              <h2>Faculty tools</h2>
            </div>
          </div>

          <div className="quick-grid">
            <button onClick={() => setPage("assignments")}>
              <ListChecks size={19} />
              Assignments
            </button>

            <button onClick={() => setPage("canteen")}>
              <Coffee size={19} />
              Canteen
            </button>

            <button onClick={() => setPage("rooms")}>
              <Building2 size={19} />
              Rooms
            </button>

            <button onClick={() => setPage("ai")}>
              <Sparkles size={19} />
              Campus AI
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function ClockIcon() {
  return <span className="clock-symbol">◷</span>;
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ setPage, canteenCrowd }) {
  return (
    <div>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Campus overview."
        description="Monitor users, attendance, facilities, events and smart-campus activity."
      />

      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Active users"
          value="1,284"
          detail="Students & faculty"
        />

        <StatCard
          icon={Navigation}
          label="Active navigation"
          value="46"
          detail="Currently navigating"
        />

        <StatCard
          icon={CheckCircle2}
          label="Attendance sync"
          value="98%"
          detail="Systems operational"
        />

        <StatCard
          icon={Coffee}
          label="Canteen crowd"
          value={`${canteenCrowd}%`}
          detail="Current estimate"
        />
      </div>

      <div className="admin-main-grid">
        <GlassCard className="campus-health">
          <span className="eyebrow">CAMPUS HEALTH</span>
          <h2>Everything looks operational.</h2>
          <p>
            Navigation, attendance, notifications and campus
            information services are available.
          </p>

          <div className="health-list">
            <div>
              <span className="health-dot" />
              Navigation
            </div>

            <div>
              <span className="health-dot" />
              AI Assistant
            </div>

            <div>
              <span className="health-dot" />
              Attendance
            </div>

            <div>
              <span className="health-dot" />
              Notifications
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <span className="eyebrow">ADMIN TOOLS</span>
          <h2>Campus management</h2>

          <div className="admin-action-list">
            <button onClick={() => setPage("admin-users")}>
              <Users size={18} />
              User Management
              <ChevronRight size={16} />
            </button>

            <button onClick={() => setPage("admin-attendance")}>
              <CheckCircle2 size={18} />
              Attendance Monitor
              <ChevronRight size={16} />
            </button>

            <button onClick={() => setPage("admin-events")}>
              <CalendarDays size={18} />
              Events & Notices
              <ChevronRight size={16} />
            </button>

            <button onClick={() => setPage("admin-facilities")}>
              <Building2 size={18} />
              Facilities
              <ChevronRight size={16} />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* =========================================================
   TIMETABLE
========================================================= */

function TimetablePage({ user }) {
  const rows =
    user.role === "faculty"
      ? TIMETABLE.filter(
          (x) =>
            x.teacher.toLowerCase() ===
            user.name.toLowerCase()
        )
      : TIMETABLE;

  return (
    <div>
      <PageHeader
        eyebrow={user.role === "faculty" ? "FACULTY" : "ACADEMIC"}
        title={user.role === "faculty" ? "My timetable." : "Timetable."}
        description="Your lecture schedule, classrooms and faculty details."
      />

      <GlassCard className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Room</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.day}</strong>
                  </td>

                  <td>{item.time}</td>

                  <td>
                    <strong>{item.subject}</strong>
                  </td>

                  <td>
                    {item.title} {item.teacher}
                  </td>

                  <td>
                    <span className="room-tag">
                      <MapPin size={13} />
                      {item.room}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* =========================================================
   ATTENDANCE
========================================================= */

function AttendancePage({
  user,
  students,
  setStudents,
  lectureStarted,
  setLectureStarted,
  lectureEnded,
  setLectureEnded,
  voiceEnabled,
}) {
  const room = ROOM_GEOFENCES["IT-302"];

  const calculateStudentDistance = (student) => {
    return Math.round(
      distanceInMeters(
        student.lat,
        student.lng,
        room.lat,
        room.lng
      )
    );
  };

  const startLecture = () => {
    setLectureStarted(true);
    setLectureEnded(false);

    if (voiceEnabled) {
      speak(
        "Lecture started. Location based attendance verification is active."
      );
    }
  };

  const endLecture = () => {
    if (!lectureStarted) return;

    const updated = students.map((student) => {
      const distance = calculateStudentDistance(student);

      const isInside = distance <= room.radius;

      return {
        ...student,
        attendance: isInside ? "Present" : "Absent",
        verifiedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    setStudents(updated);
    setLectureEnded(true);
    setLectureStarted(false);

    if (voiceEnabled) {
      const present = updated.filter(
        (x) => x.attendance === "Present"
      ).length;

      speak(
        `The lecture has ended. ${present} students were verified inside IT-302 and their attendance has been updated.`
      );
    }
  };

  const moveInside = (id) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.id === id
          ? {
              ...student,
              location: "inside",
              lat: room.lat + 0.00001,
              lng: room.lng + 0.00001,
              attendance: "Pending",
            }
          : student
      )
    );
  };

  const moveOutside = (id) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.id === id
          ? {
              ...student,
              location: "outside",
              lat: room.lat + 0.002,
              lng: room.lng + 0.002,
              attendance: "Pending",
            }
          : student
      )
    );
  };

  const resetAttendance = () => {
    setStudents(INITIAL_STUDENTS);
    setLectureEnded(false);
    setLectureStarted(false);
  };

  const presentCount = students.filter(
    (x) => x.attendance === "Present"
  ).length;

  const absentCount = students.filter(
    (x) => x.attendance === "Absent"
  ).length;

  if (user.role === "student") {
    return (
      <StudentAttendanceView
        students={students}
        user={user}
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="LOCATION VERIFIED ATTENDANCE"
        title="Lecture attendance."
        description="Attendance is automatically marked only when the student is physically inside the lecture classroom area."
        action={
          <button className="soft-button" onClick={resetAttendance}>
            <RefreshCw size={16} />
            Reset demo
          </button>
        }
      />

      <div className="attendance-rule">
        <div className="rule-icon">
          <MapPin size={20} />
        </div>

        <div>
          <strong>IT-302 classroom geofence active</strong>
          <span>
            Radius: {room.radius} meters · Attendance finalized
            only after lecture ends.
          </span>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Students"
          value={students.length}
          detail="Registered for lecture"
        />

        <StatCard
          icon={CheckCircle2}
          label="Present"
          value={lectureEnded ? presentCount : "—"}
          detail={
            lectureEnded
              ? "Location verified"
              : "Pending lecture completion"
          }
        />

        <StatCard
          icon={X}
          label="Absent"
          value={lectureEnded ? absentCount : "—"}
          detail="Outside classroom area"
        />

        <StatCard
          icon={Radio}
          label="Lecture"
          value={lectureStarted ? "LIVE" : "READY"}
          detail={
            lectureEnded
              ? "Attendance completed"
              : "Location verification"
          }
        />
      </div>

      <GlassCard className="attendance-control-card">
        <div>
          <span className="eyebrow">LECTURE CONTROL</span>
          <h2>UI/UX · IT-302</h2>
          <p>
            Students inside the classroom will be marked present
            when you end the lecture.
          </p>
        </div>

        <div className="lecture-buttons">
          <button
            className="primary-button"
            disabled={lectureStarted}
            onClick={startLecture}
          >
            <Play size={16} />
            Start Lecture
          </button>

          <button
            className="end-button"
            disabled={!lectureStarted}
            onClick={endLecture}
          >
            <PauseCircle size={16} />
            End Lecture & Auto Mark Attendance
          </button>
        </div>
      </GlassCard>

      <GlassCard className="attendance-table-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">STUDENT LOCATION</span>
            <h2>Attendance verification</h2>
          </div>

          {lectureEnded && (
            <span className="status-pill verified">
              <CheckCircle2 size={14} />
              Completed
            </span>
          )}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Location</th>
                <th>Distance</th>
                <th>Attendance</th>
                <th>Simulation</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => {
                const distance = calculateStudentDistance(student);
                const inside = distance <= room.radius;

                return (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.roll}</strong>
                    </td>

                    <td>{student.name}</td>

                    <td>
                      <span
                        className={
                          inside
                            ? "location-good"
                            : "location-bad"
                        }
                      >
                        <span />
                        {inside
                          ? "Inside IT-302"
                          : "Outside IT-302"}
                      </span>
                    </td>

                    <td>{distance} m</td>

                    <td>
                      {student.attendance === "Pending" ? (
                        <span className="status-pill pending">
                          Pending
                        </span>
                      ) : student.attendance === "Present" ? (
                        <span className="status-pill present">
                          <Check size={13} />
                          Present
                        </span>
                      ) : (
                        <span className="status-pill absent">
                          <X size={13} />
                          Absent
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="simulation-buttons">
                        <button
                          onClick={() =>
                            moveInside(student.id)
                          }
                        >
                          Inside
                        </button>

                        <button
                          onClick={() =>
                            moveOutside(student.id)
                          }
                        >
                          Outside
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="attendance-note">
          <Info size={16} />
          Prototype simulation: real attendance would receive
          live location from each student's device.
        </div>
      </GlassCard>
    </div>
  );
}

function StudentAttendanceView({ students, user }) {
  const current =
    students.find(
      (x) =>
        x.name.toLowerCase() === user.name.toLowerCase()
    ) || students[0];

  const present =
    current.attendance === "Present";

  return (
    <div>
      <PageHeader
        eyebrow="MY ATTENDANCE"
        title="Attendance."
        description="Your attendance status is verified using classroom location."
      />

      <GlassCard className="student-attendance-hero">
        <div className="attendance-big-icon">
          {present ? (
            <CheckCircle2 size={34} />
          ) : (
            <MapPin size={34} />
          )}
        </div>

        <div>
          <span className="eyebrow">CURRENT STATUS</span>
          <h2>
            {current.attendance === "Pending"
              ? "Attendance pending"
              : current.attendance}
          </h2>

          <p>
            {current.attendance === "Pending"
              ? "Attendance will be finalized after the lecture ends."
              : "Location verified against the classroom geofence."}
          </p>
        </div>
      </GlassCard>

      <div className="stats-grid">
        <StatCard
          icon={CheckCircle2}
          label="Overall attendance"
          value="86%"
          detail="Current academic record"
        />

        <StatCard
          icon={MapPin}
          label="Classroom"
          value="IT-302"
          detail="Geofence verified"
        />
      </div>
    </div>
  );
}

/* =========================================================
   ASSIGNMENTS
========================================================= */

function AssignmentsPage({
  assignments,
  setAssignments,
  user,
}) {
  const toggle = (id) => {
    setAssignments((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      )
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow={user.role === "faculty" ? "FACULTY" : "STUDY"}
        title="Assignments."
        description={
          user.role === "faculty"
            ? "Create, review and track student assignments."
            : "Stay on top of your work with simple progress tracking."
        }
      />

      {user.role === "faculty" && (
        <GlassCard className="assignment-create">
          <div>
            <span className="eyebrow">FACULTY ACTION</span>
            <h2>Create assignment</h2>
            <p>Add an assignment for your current lecture.</p>
          </div>

          <button className="primary-button">
            <Plus size={17} />
            New Assignment
          </button>
        </GlassCard>
      )}

      <div className="assignment-grid">
        {assignments.map((assignment) => (
          <GlassCard key={assignment.id} className="assignment-card">
            <div className="assignment-top">
              <span className="subject-tag">
                {assignment.subject}
              </span>

              {assignment.completed ? (
                <CheckCircle2 size={20} />
              ) : (
                <CircleUserRound size={20} />
              )}
            </div>

            <h2>{assignment.title}</h2>

            <p>
              Due {assignment.due}
            </p>

            <div className="progress-line">
              <span
                style={{
                  width: assignment.completed
                    ? "100%"
                    : "38%",
                }}
              />
            </div>

            {user.role === "student" && (
              <button
                className={
                  assignment.completed
                    ? "completed-button"
                    : "soft-button"
                }
                onClick={() => toggle(assignment.id)}
              >
                {assignment.completed
                  ? "Completed"
                  : "Mark as complete"}
                {assignment.completed && (
                  <Check size={16} />
                )}
              </button>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CANTEEN
========================================================= */

function CanteenPage({ crowd }) {
  const crowded = crowd >= 70;

  return (
    <div>
      <PageHeader
        eyebrow="SMART CAMPUS"
        title="Canteen."
        description="Check the current crowd level before heading to the canteen."
      />

      <GlassCard className="canteen-hero">
        <div className="canteen-ring">
          <span>{crowd}%</span>
          <small>Crowd</small>
        </div>

        <div>
          <span className="eyebrow">CURRENT CROWD</span>

          <h2>
            {crowded
              ? "It is quite busy right now."
              : "The canteen is comfortable right now."}
          </h2>

          <p>
            {crowded
              ? "I recommend waiting a few minutes before heading there."
              : "This is a good time to grab something."}
          </p>

          <div className="canteen-info">
            <span>
              <Users size={16} />
              Estimated activity
            </span>

            <span>
              <ClockIcon />
              Next quieter period: 15–20 min
            </span>
          </div>
        </div>
      </GlassCard>

      <div className="dashboard-grid">
        <GlassCard>
          <span className="eyebrow">LOCATION ACCESS</span>
          <h2>Smart location context</h2>
          <p className="muted">
            The prototype uses campus location context to show
            the canteen status and recommendations.
          </p>

          <button className="soft-button">
            <MapPin size={16} />
            Location active
          </button>
        </GlassCard>

        <GlassCard>
          <span className="eyebrow">RECOMMENDATION</span>
          <h2>Want a quieter visit?</h2>
          <p className="muted">
            Wait for the crowd to reduce before heading to the
            canteen.
          </p>

          <div className="recommendation-pill">
            <Sparkles size={16} />
            Suggested wait · 15–20 min
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* =========================================================
   ROOMS
========================================================= */

function RoomsPage({ setPage, setDestination }) {
  const rooms = [
    {
      name: "IT-301",
      floor: "Floor 2",
      type: "Classroom",
    },
    {
      name: "IT-302",
      floor: "Floor 2",
      type: "Classroom",
    },
    {
      name: "IT-303",
      floor: "Floor 2",
      type: "Classroom",
    },
    {
      name: "IT Lab",
      floor: "Floor 2",
      type: "Laboratory",
    },
    {
      name: "AI Lab",
      floor: "Floor 2",
      type: "Laboratory",
    },
    {
      name: "Library",
      floor: "Ground Floor",
      type: "Facility",
    },
    {
      name: "Placement Cell",
      floor: "First Floor",
      type: "Facility",
    },
    {
      name: "Canteen",
      floor: "Ground Floor",
      type: "Facility",
    },
  ];

  const navigate = (name) => {
    setDestination(name);
    setPage("navigation");
  };

  return (
    <div>
      <PageHeader
        eyebrow="CAMPUS DIRECTORY"
        title="Rooms & facilities."
        description="Find classrooms, laboratories and important campus facilities."
      />

      <div className="room-grid">
        {rooms.map((room) => (
          <GlassCard key={room.name} className="room-card">
            <div className="room-icon">
              {room.type === "Laboratory" ? (
                <Activity size={21} />
              ) : room.type === "Facility" ? (
                <Building2 size={21} />
              ) : (
                <DoorOpen size={21} />
              )}
            </div>

            <span className="eyebrow">{room.type}</span>
            <h2>{room.name}</h2>
            <p>{room.floor}</p>

            <button
              className="soft-button"
              onClick={() => navigate(room.name)}
            >
              Navigate
              <Navigation size={15} />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

const NAVIGATION_STEPS = [
  {
    title: "Start",
    detail: "Your current location is detected.",
    distance: 480,
  },
  {
    title: "Continue straight",
    detail: "Follow the main campus corridor.",
    distance: 360,
  },
  {
    title: "Turn right",
    detail: "Enter the Computer Block corridor.",
    distance: 260,
  },
  {
    title: "Continue to stairs",
    detail: "Stairs are ahead on your left.",
    distance: 170,
  },
  {
    title: "Go up to Floor 2",
    detail: "Take the stairs to the second floor.",
    distance: 110,
  },
  {
    title: "Turn left",
    detail: "Follow the IT corridor.",
    distance: 55,
  },
  {
    title: "Destination ahead",
    detail: "IT Lab is a few steps ahead.",
    distance: 15,
  },
  {
    title: "You have arrived",
    detail: "You are at your destination.",
    distance: 0,
  },
];

function NavigationPage({
  destination,
  setDestination,
  navigationStarted,
  setNavigationStarted,
  currentStep,
  setCurrentStep,
  voiceEnabled,
}) {
  const destinations = [
    "IT-301",
    "IT-302",
    "IT-303",
    "IT Lab",
    "AI Lab",
    "Library",
    "Placement Cell",
    "Canteen",
  ];

  const safeStep = Math.min(
    Math.max(currentStep, 0),
    NAVIGATION_STEPS.length - 1
  );

  const currentNavigationStep = NAVIGATION_STEPS[safeStep];
  const remaining = currentNavigationStep.distance;

  const start = () => {
    setNavigationStarted(true);
    setCurrentStep(0);

    if (voiceEnabled) {
      speak(`Starting navigation to ${destination}. Continue straight.`);
    }
  };

  const stop = () => {
    setNavigationStarted(false);
    setCurrentStep(0);

    if (voiceEnabled) {
      speak("Navigation stopped.");
    }
  };

  useEffect(() => {
    if (!navigationStarted) return undefined;

    if (safeStep >= NAVIGATION_STEPS.length - 1) {
      if (voiceEnabled) {
        speak(`You have arrived at ${destination}.`);
      }
      return undefined;
    }

    const timer = setTimeout(() => {
      const nextStep = Math.min(
        safeStep + 1,
        NAVIGATION_STEPS.length - 1
      );

      setCurrentStep(nextStep);

      if (voiceEnabled) {
        const step = NAVIGATION_STEPS[nextStep];
        speak(`${step.title}. ${step.detail}.`);
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [
    navigationStarted,
    safeStep,
    destination,
    voiceEnabled,
    setCurrentStep,
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="3D AR NAVIGATION"
        title="Find your way."
        description="Explore the MHSSCE campus in 3D and navigate to classrooms, laboratories and campus facilities."
      />

      <div className="navigation-layout">
        <GlassCard className="navigation-map-card campus-3d-card">
          <div
            style={{
              width: "100%",
              height: "680px",
              minHeight: "680px",
              position: "relative",
              overflow: "hidden",
              borderRadius: "20px",
            }}
          >
            <Campus3D navigationStarted={navigationStarted} destination={destination} currentStep={safeStep} />
          </div>

          <div className="navigation-bottom">
            <div>
              <span className="eyebrow">REMAINING</span>
              <strong>{remaining} m</strong>
            </div>

            <div>
              <span className="eyebrow">ETA</span>
              <strong>
                {remaining === 0
                  ? "Arrived"
                  : `${Math.max(1, Math.ceil(remaining / 80))} min`}
              </strong>
            </div>

            <div>
              <span className="eyebrow">STATUS</span>
              <strong>
                {navigationStarted
                  ? safeStep >= NAVIGATION_STEPS.length - 1
                    ? "Arrived"
                    : "Navigating"
                  : "Ready"}
              </strong>
            </div>
          </div>
        </GlassCard>

        <div className="navigation-panel">
          <GlassCard>
            <span className="eyebrow">DESTINATION</span>

            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              disabled={navigationStarted}
            >
              {destinations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="permission-list">
              <div>
                <Camera size={17} />
                <span>Camera access</span>
                <Check size={15} />
              </div>

              <div>
                <MapPin size={17} />
                <span>Location access</span>
                <Check size={15} />
              </div>
            </div>

            {!navigationStarted ? (
              <button
                className="primary-button full-button"
                onClick={start}
              >
                Start AR Navigation
                <Navigation size={17} />
              </button>
            ) : (
              <button
                className="end-button full-button"
                onClick={stop}
              >
                Stop Navigation
                <X size={17} />
              </button>
            )}
          </GlassCard>

          <GlassCard>
            <span className="eyebrow">NEXT INSTRUCTION</span>

            <div className="next-instruction">
              <div className="instruction-icon">
                {safeStep === 2 ? (
                  <ArrowRight size={24} />
                ) : (
                  <ArrowUp size={24} />
                )}
              </div>

              <div>
                <strong>{currentNavigationStep.title}</strong>
                <p>{currentNavigationStep.detail}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="route-progress-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">ROUTE PROGRESS</span>
            <h2>Campus navigation route</h2>
          </div>
          <Route size={22} />
        </div>

        <div className="progress-route">
          {NAVIGATION_STEPS.map((step, index) => (
            <div
              key={`${step.title}-${index}`}
              className={index <= safeStep ? "route-step done" : "route-step"}
            >
              <span />
              <small>{step.title}</small>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

/* =========================================================
   AI
========================================================= */

function AIPPage({ user, assignments, canteenCrowd }) {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text:
        user.role === "faculty"
          ? `Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${
              getFacultyTitle(user)
            } ${user.name}. I can help with your timetable, classroom navigation, attendance, assignments and campus information.`
          : `Hi ${user.name}. I can help you with classrooms, timetable, attendance, assignments, events and campus navigation.`,
    },
  ]);

  const answer = (question) => {
    const text = question.toLowerCase();

    if (text.includes("canteen")) {
      return canteenCrowd >= 70
        ? "The canteen is currently crowded. I recommend waiting around 15–20 minutes."
        : "The canteen currently looks comfortable.";
    }

    if (
      text.includes("navigate") ||
      text.includes("direction") ||
      text.includes("where")
    ) {
      return "Open AR Navigation, choose your destination and I will guide you through turns, corridors, stairs and floor changes.";
    }

    if (text.includes("assignment")) {
      const pending = assignments.filter(
        (x) => !x.completed
      ).length;

      return `You currently have ${pending} pending assignments. Start with the nearest deadline and check in with me when it is complete.`;
    }

    if (text.includes("attendance")) {
      return "Your prototype attendance is 86%, which is above the required 75% threshold.";
    }

    if (text.includes("library")) {
      return "The Library is on the Ground Floor of the Main Academic Block.";
    }

    if (text.includes("lab")) {
      return "The IT Lab and AI Lab are located on Floor 2 of the Computer Block.";
    }

    if (text.includes("ui") || text.includes("ux")) {
      return "UI/UX is scheduled at 11:00 AM in the IT Lab with Mr. Fardeen.";
    }

    if (text.includes("faculty") || text.includes("teacher")) {
      return "Tell me the teacher or subject name and I can help you find the relevant classroom.";
    }

    return "I can help with navigation, timetable, attendance, assignments, canteen crowd, events, notices, classrooms, laboratories and campus facilities.";
  };

  const send = () => {
    if (!input.trim()) return;

    const question = input.trim();

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: question,
      },
      {
        sender: "ai",
        text: answer(question),
      },
    ]);

    setInput("");
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI CAMPUS ASSISTANT"
        title="Ask Campus AI."
        description="Your intelligent campus companion for navigation, studies and everyday questions."
      />

      <GlassCard className="ai-card">
        <div className="ai-chat">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.sender === "ai"
                  ? "message ai-message"
                  : "message user-message"
              }
            >
              {message.sender === "ai" && (
                <div className="ai-message-icon">
                  <Sparkles size={15} />
                </div>
              )}

              <div>{message.text}</div>
            </div>
          ))}
        </div>

        <div className="ai-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ask about your campus..."
          />

          <button onClick={send}>
            <Send size={17} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

/* =========================================================
   EVENTS / NOTICES
========================================================= */

function EventsPage() {
  const events = [
    {
      title: "Tech Innovation Summit",
      date: "18 Sep",
      place: "Main Auditorium",
    },
    {
      title: "AI & Future Careers",
      date: "24 Sep",
      place: "Seminar Hall",
    },
    {
      title: "Campus Coding Challenge",
      date: "30 Sep",
      place: "IT Lab",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="CAMPUS LIFE"
        title="Events."
        description="Discover what's happening across campus."
      />

      <div className="event-grid">
        {events.map((event) => (
          <GlassCard key={event.title}>
            <div className="event-date">{event.date}</div>

            <span className="eyebrow">CAMPUS EVENT</span>
            <h2>{event.title}</h2>

            <p>
              <MapPin size={15} />
              {event.place}
            </p>

            <button className="soft-button">
              View event
              <ArrowRight size={15} />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function NoticesPage() {
  const notices = [
    "Internal assessment schedule has been updated.",
    "Placement orientation will be held in the Main Auditorium.",
    "IT Lab maintenance is scheduled after 5:00 PM.",
    "Campus coding challenge registrations are open.",
  ];

  return (
    <div>
      <PageHeader
        eyebrow="CAMPUS INFORMATION"
        title="Notices."
        description="Important campus updates in one place."
      />

      <GlassCard className="notice-list">
        {notices.map((notice, index) => (
          <div key={index}>
            <div className="notice-icon">
              <Bell size={17} />
            </div>

            <div>
              <strong>{notice}</strong>
              <span>Today · Campus Administration</span>
            </div>

            <ChevronRight size={17} />
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

/* =========================================================
   ADMIN PAGES
========================================================= */

function AdminUsersPage() {
  const users = [
    ["STU-001", "Samayra", "Student", "Active"],
    ["STU-002", "Abubakkar", "Student", "Active"],
    ["FAC-001", "Fardeen", "Faculty", "Active"],
    ["FAC-002", "Shah", "Faculty", "Active"],
  ];

  return (
    <SimpleAdminTable
      eyebrow="ADMINISTRATION"
      title="User management."
      description="Manage students and faculty using the smart campus."
      headers={["ID", "Name", "Role", "Status"]}
      rows={users}
    />
  );
}

function AdminAttendancePage() {
  const rows = [
    ["UI/UX", "Fardeen", "IT Lab", "24 / 28", "86%"],
    ["DBMS", "Mehta", "IT-302", "31 / 34", "91%"],
    ["AI", "Deshmukh", "AI Lab", "28 / 32", "88%"],
  ];

  return (
    <SimpleAdminTable
      eyebrow="ADMINISTRATION"
      title="Attendance monitor."
      description="Campus-wide attendance health and verification status."
      headers={[
        "Subject",
        "Faculty",
        "Room",
        "Present",
        "Rate",
      ]}
      rows={rows}
    />
  );
}

function AdminEventsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Events & notices."
        description="Manage important campus communications and events."
        action={
          <button className="primary-button">
            <Plus size={17} />
            Create
          </button>
        }
      />

      <GlassCard className="admin-list-card">
        <div>
          <CalendarDays size={19} />
          Tech Innovation Summit
          <span>18 Sep · Main Auditorium</span>
        </div>

        <div>
          <Bell size={19} />
          Internal Assessment Update
          <span>Published today</span>
        </div>

        <div>
          <CalendarDays size={19} />
          Campus Coding Challenge
          <span>30 Sep · IT Lab</span>
        </div>
      </GlassCard>
    </div>
  );
}

function AdminFacilitiesPage() {
  const facilities = [
    ["IT-301", "Classroom", "Floor 2", "Available"],
    ["IT-302", "Classroom", "Floor 2", "Occupied"],
    ["IT Lab", "Laboratory", "Floor 2", "Available"],
    ["AI Lab", "Laboratory", "Floor 2", "Available"],
    ["Library", "Facility", "Ground Floor", "Open"],
    ["Canteen", "Facility", "Ground Floor", "Busy"],
  ];

  return (
    <SimpleAdminTable
      eyebrow="ADMINISTRATION"
      title="Campus facilities."
      description="Monitor classrooms, laboratories and facilities."
      headers={[
        "Facility",
        "Type",
        "Floor",
        "Status",
      ]}
      rows={facilities}
    />
  );
}

function SimpleAdminTable({
  eyebrow,
  title,
  description,
  headers,
  rows,
}) {
  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <GlassCard className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {cellIndex === row.length - 1 ? (
                        <span className="status-pill">
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function AdminMonitorPage({ crowd }) {
  return (
    <div>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Campus monitor."
        description="A high-level view of smart-campus activity."
      />

      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Active Users"
          value="1,284"
          detail="Currently on platform"
        />

        <StatCard
          icon={Navigation}
          label="Active Navigation"
          value="46"
          detail="Students & faculty"
        />

        <StatCard
          icon={Activity}
          label="System Health"
          value="98%"
          detail="Operational"
        />

        <StatCard
          icon={Coffee}
          label="Canteen Crowd"
          value={`${crowd}%`}
          detail="Live estimate"
        />
      </div>

      <GlassCard className="system-health-card">
        <span className="eyebrow">SYSTEM HEALTH</span>
        <h2>Campus services are operational.</h2>

        <div className="health-list large">
          <div>
            <span className="health-dot" />
            AR Navigation
          </div>

          <div>
            <span className="health-dot" />
            Location Services
          </div>

          <div>
            <span className="health-dot" />
            Attendance
          </div>

          <div>
            <span className="health-dot" />
            AI Assistant
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfilePage({ user, onLogout }) {
  return (
    <div>
      <PageHeader
        eyebrow="ACCOUNT"
        title="Settings."
        description="Manage your account and campus preferences."
      />

      <GlassCard className="profile-card">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <span className="eyebrow">
            {user.role.toUpperCase()}
          </span>

          <h2>
            {user.role === "faculty"
              ? `${getFacultyTitle(user)} ${user.name}`
              : user.name}
          </h2>

          <p>{user.email}</p>
        </div>
      </GlassCard>

      <button className="end-button" onClick={onLogout}>
        <LogOut size={17} />
        Sign out
      </button>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [screen, setScreen] = useState(
    localStorage.getItem("campus-screen") || "landing"
  );

  const [theme, setTheme] = useState(
    localStorage.getItem("campus-theme") || "sky"
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("campus-user")
      );
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(
    localStorage.getItem("campus-page") || "dashboard"
  );

  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [canteenCrowd, setCanteenCrowd] = useState(78);

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "UI/UX Wireframe Submission",
      subject: "UI/UX",
      due: "Tomorrow",
      completed: false,
    },
    {
      id: 2,
      title: "DBMS Normalization Practice",
      subject: "DBMS",
      due: "Friday",
      completed: false,
    },
    {
      id: 3,
      title: "AI Search Algorithm Notes",
      subject: "Artificial Intelligence",
      due: "Next Monday",
      completed: true,
    },
    {
      id: 4,
      title: "Computer Networks Assignment",
      subject: "Computer Networks",
      due: "Next Tuesday",
      completed: false,
    },
  ]);

  const [students, setStudents] = useState(
    INITIAL_STUDENTS
  );

  const [lectureStarted, setLectureStarted] =
    useState(false);

  const [lectureEnded, setLectureEnded] =
    useState(false);

  const [destination, setDestination] =
    useState("IT Lab");

  const [navigationStarted, setNavigationStarted] =
    useState(false);

  const [currentStep, setCurrentStep] = useState(0);

  const [mobileSidebar, setMobileSidebar] =
    useState(false);

  /* =======================================================
     PERSISTENCE
  ======================================================= */

  useEffect(() => {
    localStorage.setItem("campus-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("campus-page", page);
  }, [page]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "campus-user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("campus-user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("campus-screen", screen);
  }, [screen]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /* =======================================================
     CANTEEN DEMO ACTIVITY
  ======================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCanteenCrowd((value) => {
        const change = Math.floor(Math.random() * 7) - 3;
        return Math.max(35, Math.min(94, value + change));
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = (newUser) => {
    setUser(newUser);
    setPage("dashboard");
    setScreen("app");

    if (newUser.role === "faculty" && voiceEnabled) {
      setTimeout(() => {
        speak(getTeacherGreeting(newUser));
      }, 700);
    }

    if (newUser.role === "student" && voiceEnabled) {
      setTimeout(() => {
        speak(
          `Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${
            newUser.name
          }. Ready for your day on campus?`
        );
      }, 700);
    }
  };

  const logout = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setUser(null);
    setScreen("landing");
    setPage("dashboard");
  };

  /* =======================================================
     PAGE RENDER
  ======================================================= */

  const renderPage = () => {
    if (page === "dashboard") {
      if (user.role === "faculty") {
        return (
          <FacultyDashboard
            user={user}
            setPage={setPage}
            attendance={students}
            lectureStarted={lectureStarted}
            lectureEnded={lectureEnded}
            canteenCrowd={canteenCrowd}
          />
        );
      }

      if (user.role === "admin") {
        return (
          <AdminDashboard
            setPage={setPage}
            canteenCrowd={canteenCrowd}
          />
        );
      }

      return (
        <StudentDashboard
          user={user}
          setPage={setPage}
          assignments={assignments}
          canteenCrowd={canteenCrowd}
        />
      );
    }

    if (page === "navigation") {
      return (
        <NavigationPage
          destination={destination}
          setDestination={setDestination}
          navigationStarted={navigationStarted}
          setNavigationStarted={setNavigationStarted}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          voiceEnabled={voiceEnabled}
        />
      );
    }

    if (page === "rooms") {
      return (
        <RoomsPage
          setPage={setPage}
          setDestination={setDestination}
        />
      );
    }

    if (page === "timetable") {
      return <TimetablePage user={user} />;
    }

    if (page === "attendance") {
      return (
        <AttendancePage
          user={user}
          students={students}
          setStudents={setStudents}
          lectureStarted={lectureStarted}
          setLectureStarted={setLectureStarted}
          lectureEnded={lectureEnded}
          setLectureEnded={setLectureEnded}
          voiceEnabled={voiceEnabled}
        />
      );
    }

    if (page === "assignments") {
      return (
        <AssignmentsPage
          assignments={assignments}
          setAssignments={setAssignments}
          user={user}
        />
      );
    }

    if (page === "canteen") {
      return <CanteenPage crowd={canteenCrowd} />;
    }

    if (page === "ai") {
      return (
        <AIPPage
          user={user}
          assignments={assignments}
          canteenCrowd={canteenCrowd}
        />
      );
    }

    if (page === "events") {
      return <EventsPage />;
    }

    if (page === "notices") {
      return <NoticesPage />;
    }

    if (page === "admin-users") {
      return <AdminUsersPage />;
    }

    if (page === "admin-attendance") {
      return <AdminAttendancePage />;
    }

    if (page === "admin-events") {
      return <AdminEventsPage />;
    }

    if (page === "admin-facilities") {
      return <AdminFacilitiesPage />;
    }

    if (page === "admin-monitor") {
      return <AdminMonitorPage crowd={canteenCrowd} />;
    }

    if (page === "profile") {
      return <ProfilePage user={user} onLogout={logout} />;
    }

    return null;
  };

  /* =======================================================
     LANDING
  ======================================================= */

  if (screen === "landing" || !user) {
    if (screen === "auth") {
      return (
        <>
          <GlobalStyles />
          <AuthPage
            onLogin={login}
            onBack={() => setScreen("landing")}
          />
        </>
      );
    }

    return (
      <>
        <GlobalStyles />
        <LandingPage
          theme={theme}
          setTheme={setTheme}
          onStart={() => setScreen("auth")}
        />
      </>
    );
  }

  /* =======================================================
     APP
  ======================================================= */

  return (
    <>
      <GlobalStyles />

      <div className={`app-shell ${mobileSidebar ? "sidebar-open" : ""}`}>
        <Sidebar
          user={user}
          page={page}
          setPage={(value) => {
            setPage(value);
            setMobileSidebar(false);
          }}
          onLogout={logout}
        />

        <div className="app-main">
          <TopBar
            user={user}
            theme={theme}
            setTheme={setTheme}
            onMenu={() => setMobileSidebar(!mobileSidebar)}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
          />

          <main className="content">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   GLOBAL STYLES
   ========================================================= */

function GlobalStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      :root {
        font-family:
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          "SF Pro Display",
          "Segoe UI",
          sans-serif;

        color: #111827;
        background: #eef8ff;
        font-synthesis: none;
        text-rendering: optimizeLegibility;
      }

      :root[data-theme="rose"] {
        --bg: #fff6fa;
        --bg-soft: #fffafd;
        --surface: rgba(255,255,255,.76);
        --surface-strong: rgba(255,255,255,.9);
        --border: rgba(236,153,188,.25);
        --text: #17151a;
        --muted: #68616a;
        --accent: #e88aaa;
        --accent-strong: #dc6f96;
        --accent-soft: #ffe4ee;
        --glow: rgba(236,147,185,.32);
        --glow-two: rgba(174,146,244,.16);
      }

      :root[data-theme="sky"] {
        --bg: #eef8ff;
        --bg-soft: #f8fcff;
        --surface: rgba(255,255,255,.76);
        --surface-strong: rgba(255,255,255,.92);
        --border: rgba(104,178,235,.22);
        --text: #111827;
        --muted: #626b75;
        --accent: #66bdf2;
        --accent-strong: #2f9be4;
        --accent-soft: #dff3ff;
        --glow: rgba(95,187,244,.35);
        --glow-two: rgba(185,153,247,.15);
      }

      body {
        margin: 0;
        min-width: 320px;
        min-height: 100vh;
        color: var(--text);
        background:
          radial-gradient(circle at 18% 12%, var(--glow), transparent 34%),
          radial-gradient(circle at 85% 22%, var(--glow-two), transparent 32%),
          linear-gradient(135deg, var(--bg), var(--bg-soft));
      }

      button,
      input,
      select {
        font: inherit;
      }

      button {
        border: 0;
        cursor: pointer;
      }

      button:disabled {
        opacity: .5;
        cursor: not-allowed;
      }

      /* ---------------- LANDING ---------------- */

      .landing {
        min-height: 100vh;
        overflow: hidden;
        position: relative;
        background:
          radial-gradient(circle at 52% 44%, rgba(255,255,255,.95), transparent 22%),
          radial-gradient(circle at 30% 30%, var(--glow), transparent 38%),
          radial-gradient(circle at 78% 70%, var(--glow-two), transparent 38%),
          linear-gradient(135deg, var(--bg), var(--bg-soft));
      }

      .landing::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at center, rgba(255,255,255,.8), transparent 17%),
          repeating-radial-gradient(
            circle at 50% 45%,
            rgba(255,255,255,.16) 0,
            rgba(255,255,255,.16) 1px,
            transparent 1px,
            transparent 90px
          );
        opacity: .65;
      }

      .landing-orb {
        position: absolute;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        filter: blur(55px);
        opacity: .35;
        pointer-events: none;
      }

      .orb-one {
        left: -150px;
        top: 25%;
        background: var(--accent);
      }

      .orb-two {
        right: -170px;
        bottom: -80px;
        background: #c49af6;
      }

      .landing-header {
        height: 84px;
        padding: 18px 5vw;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 4;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .brand > .campus-logo,
      .sidebar-brand .campus-logo {
        width: 43px;
        height: 43px;
        object-fit: contain;
        border-radius: 12px;
        filter:
          drop-shadow(0 0 10px var(--glow))
          drop-shadow(0 5px 14px rgba(80,150,220,.16));
      }

      .brand strong,
      .sidebar-brand strong {
        display: block;
        font-size: 14px;
        letter-spacing: .12em;
      }

      .brand span,
      .sidebar-brand span {
        display: block;
        margin-top: 2px;
        color: var(--muted);
        font-size: 9px;
        letter-spacing: .16em;
      }

      .theme-switcher {
        display: flex;
        gap: 4px;
        padding: 4px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,.55);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border-radius: 999px;
        box-shadow: 0 8px 30px rgba(60,120,180,.08);
      }

      .theme-switcher button {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 12px;
        border-radius: 999px;
        color: var(--muted);
        background: transparent;
        font-size: 12px;
      }

      .theme-switcher .theme-active {
        color: var(--text);
        background: rgba(255,255,255,.9);
        box-shadow: 0 4px 15px rgba(50,100,150,.1);
      }

      .theme-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
      }

      .sky-dot {
        background: #77c9f7;
        box-shadow: 0 0 8px #77c9f7;
      }

      .rose-dot {
        background: #efa1be;
        box-shadow: 0 0 8px #efa1be;
      }

      .landing-main {
        min-height: calc(100vh - 84px);
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        max-width: 1380px;
        margin: auto;
        padding: 20px 6vw 70px;
        position: relative;
        z-index: 2;
      }

      .landing-copy {
        max-width: 620px;
      }

      .availability-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,.5);
        border: 1px solid var(--border);
        backdrop-filter: blur(18px);
        color: var(--muted);
        font-size: 10px;
        letter-spacing: .13em;
        margin-bottom: 18px;
      }

      .availability-pill span,
      .live-pill span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #62d69c;
        box-shadow: 0 0 8px #62d69c;
      }

      .hero-logo-container {
        width: 150px;
        height: 150px;
        display: grid;
        place-items: center;
        position: relative;
        margin-bottom: 2px;
      }

      .hero-logo-container::before {
        content: "";
        position: absolute;
        width: 210px;
        height: 210px;
        border-radius: 50%;
        background:
          radial-gradient(circle,
          rgba(255,255,255,.96) 0,
          var(--glow) 20%,
          transparent 65%);
        filter: blur(9px);
      }

      .lens-flare {
        position: absolute;
        width: 250px;
        height: 2px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,.7),
          transparent
        );
        filter: blur(1px);
        opacity: .8;
      }

      .hero-logo {
        width: 118px;
        height: 118px;
        object-fit: contain;
        position: relative;
        z-index: 2;
        border-radius: 30px;
        filter:
          drop-shadow(0 0 14px rgba(255,255,255,.95))
          drop-shadow(0 0 30px var(--glow))
          drop-shadow(0 14px 32px rgba(100,130,190,.12));
      }

      .hero-brand {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .28em;
        margin-bottom: 18px;
      }

      .landing-copy h1 {
        margin: 0;
        font-size: clamp(55px, 7vw, 94px);
        line-height: .91;
        letter-spacing: -.065em;
        font-weight: 700;
      }

      .landing-copy h1 span {
        color: var(--accent-strong);
      }

      .landing-copy > p {
        max-width: 510px;
        color: var(--muted);
        line-height: 1.75;
        font-size: 15px;
        margin: 25px 0 25px;
      }

      .hero-button,
      .primary-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        min-height: 46px;
        padding: 0 19px;
        border-radius: 14px;
        color: #101820;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,.96),
          var(--accent-soft)
        );
        border: 1px solid var(--border);
        box-shadow:
          0 12px 30px var(--glow),
          inset 0 1px 0 rgba(255,255,255,.9);
        font-weight: 650;
        transition: .2s ease;
      }

      .hero-button:hover,
      .primary-button:hover {
        transform: translateY(-2px);
        box-shadow:
          0 16px 36px var(--glow),
          inset 0 1px 0 rgba(255,255,255,.95);
      }

      .secure-note {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--muted);
        font-size: 11px;
        margin-left: 15px;
      }

      .landing-visual {
        min-height: 560px;
        display: grid;
        place-items: center;
        position: relative;
      }

      .floating-map-card {
        width: min(510px, 90%);
        padding: 14px;
        border-radius: 28px;
        background: rgba(255,255,255,.53);
        border: 1px solid rgba(255,255,255,.75);
        backdrop-filter: blur(26px);
        -webkit-backdrop-filter: blur(26px);
        box-shadow:
          0 40px 100px rgba(80,130,180,.15),
          inset 0 1px 0 rgba(255,255,255,.9);
        transform: perspective(1000px) rotateY(-6deg) rotateX(3deg);
      }

      .mini-map-top,
      .mini-map-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 7px 12px;
        font-size: 10px;
        letter-spacing: .1em;
        color: var(--muted);
      }

      .live-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #3f9a6e;
      }

      .mini-map {
        height: 390px;
        border-radius: 21px;
        position: relative;
        overflow: hidden;
        background:
          linear-gradient(
            135deg,
            rgba(222,244,255,.9),
            rgba(255,255,255,.85)
          );
        border: 1px solid rgba(100,180,235,.16);
      }

      :root[data-theme="rose"] .mini-map {
        background:
          linear-gradient(
            135deg,
            rgba(255,231,241,.9),
            rgba(255,255,255,.85)
          );
      }

      .map-road {
        position: absolute;
        background: rgba(255,255,255,.75);
        border-radius: 999px;
      }

      .road-a {
        width: 120%;
        height: 30px;
        top: 48%;
        left: -10%;
        transform: rotate(-17deg);
      }

      .road-b {
        width: 30px;
        height: 115%;
        left: 53%;
        top: -8%;
        transform: rotate(12deg);
      }

      .road-c {
        width: 80%;
        height: 22px;
        left: 12%;
        top: 26%;
        transform: rotate(19deg);
      }

      .building {
        position: absolute;
        padding: 17px 12px;
        border-radius: 12px;
        background: rgba(170,215,240,.55);
        border: 1px solid rgba(80,160,220,.16);
        font-size: 9px;
        font-weight: 700;
        color: #385568;
        box-shadow: 0 10px 22px rgba(70,140,190,.1);
      }

      .building-a {
        left: 9%;
        top: 16%;
      }

      .building-b {
        right: 9%;
        top: 38%;
      }

      .building-c {
        left: 15%;
        bottom: 12%;
      }

      .map-user {
        position: absolute;
        left: 47%;
        top: 56%;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        display: grid;
        place-items: center;
        box-shadow: 0 0 0 8px rgba(80,180,240,.14), 0 5px 18px rgba(50,120,180,.2);
      }

      .map-user div {
        width: 9px;
        height: 9px;
        background: var(--accent-strong);
        border-radius: 50%;
      }

      .map-route {
        position: absolute;
        left: 49%;
        top: 56%;
        width: 170px;
        height: 110px;
        border-left: 3px dashed var(--accent-strong);
        border-bottom: 3px dashed var(--accent-strong);
        transform: rotate(-17deg);
        opacity: .8;
      }

      .map-route span {
        position: absolute;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--accent-strong);
      }

      .map-route span:nth-child(1) {
        left: -5px;
        top: 25%;
      }

      .map-route span:nth-child(2) {
        right: 40%;
        bottom: -5px;
      }

      .map-route span:nth-child(3) {
        right: 0;
        bottom: -5px;
      }

      .mini-map-bottom {
        padding-top: 13px;
        padding-bottom: 4px;
      }

      .mini-map-bottom div {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .mini-map-bottom strong {
        color: var(--text);
      }

      .floating-assistant {
        position: absolute;
        right: 2%;
        bottom: 9%;
        min-width: 220px;
        padding: 12px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(255,255,255,.75);
        border: 1px solid rgba(255,255,255,.9);
        backdrop-filter: blur(20px);
        box-shadow: 0 18px 45px rgba(70,130,190,.12);
      }

      .assistant-icon,
      .assistant-large-icon {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: var(--accent-soft);
        color: var(--accent-strong);
      }

      .floating-assistant div:nth-child(2) {
        flex: 1;
      }

      .floating-assistant strong,
      .floating-assistant span {
        display: block;
      }

      .floating-assistant strong {
        font-size: 12px;
      }

      .floating-assistant span {
        color: var(--muted);
        font-size: 10px;
        margin-top: 2px;
      }

      /* ---------------- AUTH ---------------- */

      .auth-screen {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 30px;
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at center, rgba(255,255,255,.95), transparent 25%),
          linear-gradient(135deg, var(--bg), var(--bg-soft));
      }

      .auth-glow {
        position: absolute;
        width: 520px;
        height: 520px;
        border-radius: 50%;
        background: var(--glow);
        filter: blur(80px);
      }

      .auth-card {
        width: min(500px, 100%);
        position: relative;
        z-index: 2;
        padding: 30px;
        border-radius: 28px;
        background: var(--surface);
        border: 1px solid rgba(255,255,255,.8);
        backdrop-filter: blur(30px);
        box-shadow: 0 35px 90px rgba(50,110,170,.13);
      }

      .back-button {
        background: transparent;
        color: var(--muted);
        font-size: 12px;
        margin-bottom: 20px;
      }

      .auth-logo {
        width: 62px;
        height: 62px;
        object-fit: contain;
        border-radius: 16px;
        filter: drop-shadow(0 0 20px var(--glow));
      }

      .auth-title span,
      .eyebrow {
        color: var(--accent-strong);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: .16em;
      }

      .auth-title h1 {
        font-size: 30px;
        letter-spacing: -.04em;
        margin: 7px 0;
      }

      .auth-title p,
      .page-header p,
      .muted {
        color: var(--muted);
        line-height: 1.65;
        font-size: 13px;
      }

      .role-tabs {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 6px;
        margin: 24px 0 18px;
        padding: 4px;
        border-radius: 15px;
        background: rgba(240,245,250,.65);
      }

      .role-tabs button {
        min-height: 42px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: transparent;
        color: var(--muted);
        font-size: 11px;
      }

      .role-tabs .selected {
        background: white;
        color: var(--text);
        box-shadow: 0 5px 16px rgba(50,100,150,.08);
      }

      .field {
        display: block;
        margin: 12px 0;
      }

      .field span {
        display: block;
        font-size: 11px;
        color: var(--muted);
        margin-bottom: 7px;
      }

      .field input,
      .navigation-panel select,
      .ai-input input {
        width: 100%;
        height: 45px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,.7);
        outline: none;
        padding: 0 13px;
        color: var(--text);
      }

      .field input:focus,
      .navigation-panel select:focus,
      .ai-input input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 4px var(--glow);
      }

      .otp-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
        align-items: end;
      }

      .secondary-button,
      .soft-button {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 15px;
        border-radius: 12px;
        color: var(--text);
        background: rgba(255,255,255,.72);
        border: 1px solid var(--border);
      }

      .secondary-button:hover,
      .soft-button:hover {
        background: rgba(255,255,255,.95);
      }

      .otp-button {
        margin-bottom: 12px;
      }

      .demo-otp,
      .error-box {
        padding: 11px 13px;
        border-radius: 12px;
        font-size: 11px;
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .demo-otp {
        background: var(--accent-soft);
        color: var(--text);
      }

      .error-box {
        background: #fff0f2;
        color: #b33e59;
      }

      .full-button {
        width: 100%;
        margin-top: 9px;
      }

      .mode-switch {
        width: 100%;
        background: transparent;
        color: var(--accent-strong);
        font-size: 11px;
        margin-top: 18px;
      }

      /* ---------------- APP SHELL ---------------- */

      .app-shell {
        min-height: 100vh;
        display: flex;
        background:
          radial-gradient(circle at 75% 10%, var(--glow-two), transparent 25%),
          linear-gradient(135deg, var(--bg), var(--bg-soft));
      }

      .sidebar {
        width: 250px;
        flex: 0 0 250px;
        min-height: 100vh;
        padding: 23px 15px;
        border-right: 1px solid var(--border);
        background: rgba(255,255,255,.47);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
        height: 100vh;
        z-index: 20;
      }

      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 9px 22px;
      }

      .user-mini {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px;
        border-radius: 15px;
        background: rgba(255,255,255,.55);
        border: 1px solid var(--border);
        margin-bottom: 18px;
      }

      .avatar,
      .top-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: var(--text);
        background: var(--accent-soft);
        border: 1px solid var(--border);
        font-size: 12px;
        font-weight: 700;
      }

      .user-mini strong,
      .user-mini span {
        display: block;
      }

      .user-mini strong {
        font-size: 11px;
      }

      .user-mini span {
        color: var(--muted);
        font-size: 9px;
        margin-top: 2px;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .sidebar-nav button,
      .sidebar-bottom button {
        width: 100%;
        min-height: 42px;
        padding: 0 11px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--muted);
        background: transparent;
        text-align: left;
        font-size: 11px;
      }

      .sidebar-nav button svg:last-child {
        margin-left: auto;
      }

      .sidebar-nav button:hover,
      .sidebar-bottom button:hover {
        background: rgba(255,255,255,.65);
        color: var(--text);
      }

      .sidebar-nav .nav-active {
        background: rgba(255,255,255,.86);
        color: var(--text);
        box-shadow: 0 7px 22px rgba(50,110,170,.07);
        border: 1px solid var(--border);
      }

      .sidebar-bottom {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding-top: 15px;
        border-top: 1px solid var(--border);
      }

      .logout-button {
        color: #c25a6e !important;
      }

      .app-main {
        flex: 1;
        min-width: 0;
      }

      .topbar {
        height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        border-bottom: 1px solid var(--border);
        background: rgba(255,255,255,.37);
        backdrop-filter: blur(22px);
        position: sticky;
        top: 0;
        z-index: 15;
      }

      .topbar-title span,
      .topbar-title strong {
        display: block;
      }

      .topbar-title span {
        color: var(--accent-strong);
        font-size: 8px;
        font-weight: 800;
        letter-spacing: .17em;
      }

      .topbar-title strong {
        margin-top: 4px;
        font-size: 13px;
      }

      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .icon-button {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: rgba(255,255,255,.66);
        border: 1px solid var(--border);
        color: var(--text);
      }

      .mobile-menu {
        display: none;
      }

      .content {
        padding: 34px;
        max-width: 1450px;
        margin: auto;
      }

      /* ---------------- HEADERS ---------------- */

      .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 27px;
      }

      .page-header h1 {
        font-size: clamp(31px, 4vw, 49px);
        letter-spacing: -.055em;
        margin: 7px 0 7px;
      }

      .page-header p {
        margin: 0;
        max-width: 650px;
      }

      /* ---------------- CARDS ---------------- */

      .glass-card {
        background: var(--surface);
        border: 1px solid rgba(255,255,255,.75);
        border-radius: 22px;
        padding: 22px;
        box-shadow:
          0 18px 50px rgba(70,120,170,.065),
          inset 0 1px 0 rgba(255,255,255,.75);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      .card-heading {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
      }

      .card-heading h2,
      .glass-card h2 {
        font-size: 20px;
        letter-spacing: -.035em;
        margin: 7px 0;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 13px;
        margin-bottom: 17px;
      }

      .stat-card {
        padding: 17px;
        min-height: 116px;
        border-radius: 19px;
        background: rgba(255,255,255,.62);
        border: 1px solid var(--border);
        display: flex;
        gap: 11px;
        align-items: flex-start;
      }

      .stat-icon {
        width: 37px;
        height: 37px;
        display: grid;
        place-items: center;
        flex: 0 0 37px;
        border-radius: 11px;
        background: var(--accent-soft);
        color: var(--accent-strong);
      }

      .stat-content span,
      .stat-content strong,
      .stat-content small {
        display: block;
      }

      .stat-content span {
        color: var(--muted);
        font-size: 9px;
      }

      .stat-content strong {
        font-size: 24px;
        letter-spacing: -.04em;
        margin: 3px 0;
      }

      .stat-content small {
        color: var(--muted);
        font-size: 9px;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: 1.35fr .9fr;
        gap: 15px;
        margin-bottom: 15px;
      }

      .next-class-card {
        min-height: 220px;
      }

      .time-badge {
        padding: 8px 10px;
        border-radius: 10px;
        background: var(--accent-soft);
        font-size: 10px;
        font-weight: 700;
      }

      .class-details {
        display: flex;
        gap: 17px;
        color: var(--muted);
        font-size: 11px;
        margin: 22px 0;
      }

      .class-details span {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .assistant-banner {
        display: flex;
        align-items: center;
        gap: 15px;
        justify-content: space-between;
      }

      .assistant-banner > div:nth-child(2) {
        flex: 1;
      }

      .assistant-banner p {
        color: var(--muted);
        font-size: 11px;
      }

      /* ---------------- FACULTY ---------------- */

      .teacher-hero {
        min-height: 230px;
        margin-bottom: 17px;
        padding: 27px;
        border-radius: 24px;
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at 80% 25%, rgba(255,255,255,.8), transparent 20%),
          linear-gradient(
            135deg,
            rgba(255,255,255,.78),
            var(--accent-soft)
          );
        border: 1px solid var(--border);
        box-shadow: 0 25px 60px var(--glow);
        display: flex;
        justify-content: space-between;
      }

      .teacher-hero h2 {
        font-size: 31px;
        margin: 7px 0;
        letter-spacing: -.05em;
      }

      .teacher-hero p {
        color: var(--muted);
        font-size: 13px;
      }

      .teacher-hero-actions {
        display: flex;
        gap: 9px;
        margin-top: 20px;
      }

      .teacher-voice-card {
        align-self: center;
        min-width: 220px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border-radius: 17px;
        background: rgba(255,255,255,.6);
        border: 1px solid rgba(255,255,255,.8);
      }

      .voice-pulse {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: white;
        color: var(--accent-strong);
        box-shadow: 0 0 0 7px var(--glow);
      }

      .teacher-voice-card span,
      .teacher-voice-card strong {
        display: block;
      }

      .teacher-voice-card span {
        color: var(--muted);
        font-size: 9px;
      }

      .teacher-voice-card strong {
        font-size: 11px;
        margin-top: 2px;
      }

      .lecture-status-line {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        color: var(--muted);
        font-size: 11px;
        margin: 20px 0;
      }

      .lecture-status-line span {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .clock-symbol {
        font-size: 17px;
        line-height: 0;
      }

      .quick-grid {
        display: grid;
        grid-template-columns: repeat(2,1fr);
        gap: 8px;
        margin-top: 16px;
      }

      .quick-grid button {
        padding: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-radius: 13px;
        background: rgba(255,255,255,.55);
        border: 1px solid var(--border);
        color: var(--text);
        font-size: 10px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 9px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--text);
        font-size: 9px;
        font-weight: 700;
      }

      .status-pill.live {
        background: #e5faef;
        color: #32855b;
      }

      .status-pill.present,
      .status-pill.verified {
        background: #e5faef;
        color: #32855b;
      }

      .status-pill.absent {
        background: #fff0f2;
        color: #b84c62;
      }

      .status-pill.pending {
        background: #f4f5f7;
        color: var(--muted);
      }

      /* ---------------- TABLE ---------------- */

      .table-card {
        padding: 8px;
        overflow: hidden;
      }

      .table-wrap {
        width: 100%;
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 720px;
      }

      th {
        text-align: left;
        padding: 15px;
        font-size: 9px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: .12em;
        font-weight: 700;
      }

      td {
        padding: 15px;
        border-top: 1px solid var(--border);
        font-size: 11px;
        color: var(--muted);
      }

      td strong {
        color: var(--text);
      }

      .room-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 8px;
        border-radius: 8px;
        background: var(--accent-soft);
        color: var(--text);
        font-size: 9px;
      }

      /* ---------------- ATTENDANCE ---------------- */

      .attendance-rule {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 14px 17px;
        border-radius: 17px;
        margin-bottom: 15px;
        background: var(--accent-soft);
        border: 1px solid var(--border);
      }

      .rule-icon {
        width: 39px;
        height: 39px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: rgba(255,255,255,.75);
        color: var(--accent-strong);
      }

      .attendance-rule strong,
      .attendance-rule span {
        display: block;
      }

      .attendance-rule strong {
        font-size: 11px;
      }

      .attendance-rule span {
        color: var(--muted);
        font-size: 10px;
        margin-top: 3px;
      }

      .attendance-control-card {
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .attendance-control-card p {
        color: var(--muted);
        font-size: 11px;
      }

      .lecture-buttons {
        display: flex;
        gap: 8px;
      }

      .end-button {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 15px;
        border-radius: 12px;
        color: #a33f53;
        background: #fff0f2;
        border: 1px solid rgba(220,100,125,.2);
      }

      .attendance-table-card {
        padding: 8px;
      }

      .attendance-table-card .card-heading {
        padding: 15px;
      }

      .location-good,
      .location-bad {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 9px;
      }

      .location-good span,
      .location-bad span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      .location-good {
        color: #368d64;
      }

      .location-good span {
        background: #4cc786;
      }

      .location-bad {
        color: #b84d62;
      }

      .location-bad span {
        background: #db6c83;
      }

      .simulation-buttons {
        display: flex;
        gap: 4px;
      }

      .simulation-buttons button {
        padding: 5px 7px;
        border-radius: 7px;
        background: rgba(255,255,255,.7);
        border: 1px solid var(--border);
        font-size: 8px;
      }

      .attendance-note {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--muted);
        font-size: 9px;
        padding: 14px;
      }

      .student-attendance-hero {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
      }

      .attendance-big-icon {
        width: 60px;
        height: 60px;
        border-radius: 18px;
        display: grid;
        place-items: center;
        background: var(--accent-soft);
        color: var(--accent-strong);
      }

      /* ---------------- ASSIGNMENTS ---------------- */

      .assignment-create {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .assignment-create p {
        color: var(--muted);
        font-size: 11px;
      }

      .assignment-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 14px;
      }

      .assignment-top {
        display: flex;
        justify-content: space-between;
        color: var(--accent-strong);
      }

      .subject-tag {
        padding: 5px 7px;
        border-radius: 7px;
        background: var(--accent-soft);
        font-size: 8px;
        font-weight: 700;
      }

      .assignment-card h2 {
        margin-top: 19px;
      }

      .assignment-card p {
        color: var(--muted);
        font-size: 10px;
      }

      .progress-line {
        height: 5px;
        background: rgba(120,140,160,.12);
        border-radius: 99px;
        overflow: hidden;
        margin: 20px 0;
      }

      .progress-line span {
        display: block;
        height: 100%;
        background: var(--accent-strong);
        border-radius: inherit;
      }

      .completed-button {
        min-height: 42px;
        padding: 0 14px;
        border-radius: 11px;
        background: #e5faef;
        color: #32855b;
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      /* ---------------- CANTEEN ---------------- */

      .canteen-hero {
        display: flex;
        align-items: center;
        gap: 30px;
        margin-bottom: 15px;
        min-height: 270px;
      }

      .canteen-ring {
        width: 165px;
        height: 165px;
        border-radius: 50%;
        flex: 0 0 165px;
        display: grid;
        place-items: center;
        align-content: center;
        background:
          radial-gradient(circle, white 57%, transparent 58%),
          conic-gradient(
            var(--accent-strong) 0deg,
            var(--accent-strong) calc(var(--crowd, 78) * 3.6deg),
            rgba(130,150,170,.12) 0
          );
        border: 1px solid var(--border);
        box-shadow: 0 20px 50px var(--glow);
      }

      .canteen-ring span {
        font-size: 34px;
        font-weight: 750;
        letter-spacing: -.06em;
      }

      .canteen-ring small {
        color: var(--muted);
        font-size: 9px;
      }

      .canteen-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 17px;
        color: var(--muted);
        font-size: 10px;
      }

      .canteen-info span {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .recommendation-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 11px;
        border-radius: 10px;
        background: var(--accent-soft);
        font-size: 10px;
      }

      /* ---------------- ROOMS ---------------- */

      .room-grid {
        display: grid;
        grid-template-columns: repeat(4,1fr);
        gap: 13px;
      }

      .room-card {
        min-height: 210px;
      }

      .room-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        background: var(--accent-soft);
        color: var(--accent-strong);
        border-radius: 12px;
        margin-bottom: 17px;
      }

      .room-card h2 {
        margin: 6px 0;
      }

      .room-card p {
        color: var(--muted);
        font-size: 10px;
      }

      /* ---------------- NAVIGATION ---------------- */

      .navigation-layout {
        display: grid;
        grid-template-columns: 1.55fr .75fr;
        gap: 15px;
      }

      .navigation-map-card {
        padding: 9px;
        overflow: hidden;
      }

      .navigation-map {
        height: 520px;
        border-radius: 18px;
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at 45% 45%, rgba(255,255,255,.9), transparent 25%),
          linear-gradient(135deg, #e5f6ff, #f9fdff);
      }

      :root[data-theme="rose"] .navigation-map {
        background:
          radial-gradient(circle at 45% 45%, rgba(255,255,255,.9), transparent 25%),
          linear-gradient(135deg, #ffe8f1, #fffafd);
      }

      .map-grid-lines {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(80,150,190,.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(80,150,190,.07) 1px, transparent 1px);
        background-size: 38px 38px;
      }

      .map-building {
        position: absolute;
        z-index: 2;
        padding: 22px 18px;
        border-radius: 14px;
        background: rgba(255,255,255,.7);
        border: 1px solid rgba(100,180,230,.15);
        font-size: 9px;
        font-weight: 800;
        color: #496171;
        box-shadow: 0 15px 35px rgba(60,130,180,.08);
      }

      .map-main {
        left: 10%;
        top: 12%;
      }

      .map-it {
        right: 11%;
        top: 33%;
      }

      .map-library {
        left: 13%;
        bottom: 15%;
      }

      .map-corridor {
        position: absolute;
        z-index: 1;
        height: 18px;
        border-radius: 999px;
        background: rgba(255,255,255,.8);
      }

      .corridor-one {
        width: 75%;
        left: 10%;
        top: 43%;
        transform: rotate(14deg);
      }

      .corridor-two {
        width: 65%;
        left: 24%;
        top: 66%;
        transform: rotate(-20deg);
      }

      .corridor-three {
        width: 18px;
        height: 60%;
        top: 20%;
        left: 53%;
      }

      .route-path {
        position: absolute;
        z-index: 4;
        left: 27%;
        top: 57%;
        width: 45%;
        height: 35%;
        border-left: 5px solid var(--accent-strong);
        border-bottom: 5px solid var(--accent-strong);
        border-radius: 0 0 0 20px;
        transform: rotate(-12deg);
        transition: opacity .4s;
        filter: drop-shadow(0 4px 8px var(--glow));
      }

      .route-path span {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        transition: .5s;
      }

      .route-completed {
        background: rgba(120,150,170,.2);
        opacity: .22;
      }

      .route-current {
        background: var(--accent-strong);
        box-shadow: 0 0 0 7px var(--glow);
      }

      .route-remaining {
        background: var(--accent-strong);
        opacity: .9;
      }

      .route-path span:nth-child(1) {
        left: -8px;
        top: 16%;
      }

      .route-path span:nth-child(2) {
        left: -8px;
        top: 48%;
      }

      .route-path span:nth-child(3) {
        left: 30%;
        bottom: -8px;
      }

      .route-path span:nth-child(4) {
        left: 60%;
        bottom: -8px;
      }

      .route-path span:nth-child(5) {
        right: -8px;
        bottom: 20%;
      }

      .route-path span:nth-child(6) {
        right: -8px;
        top: 10%;
      }

      .route-path span:nth-child(7) {
        right: 35%;
        top: -8px;
      }

      .route-path span:nth-child(8) {
        right: 5%;
        top: -8px;
      }

      .you-marker {
        position: absolute;
        z-index: 8;
        transform: translate(-50%,-50%);
        transition: .7s ease;
        display: grid;
        place-items: center;
      }

      .you-marker span {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--accent-strong);
        border: 4px solid white;
        box-shadow:
          0 0 0 8px var(--glow),
          0 8px 20px rgba(50,100,150,.2);
      }

      .you-marker small {
        margin-top: 8px;
        padding: 3px 5px;
        border-radius: 5px;
        background: rgba(255,255,255,.85);
        font-size: 7px;
        font-weight: 800;
      }

      .destination-marker {
        position: absolute;
        right: 11%;
        top: 20%;
        z-index: 7;
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 7px 9px;
        border-radius: 9px;
        background: rgba(255,255,255,.84);
        box-shadow: 0 8px 20px rgba(50,100,150,.1);
        font-size: 9px;
        font-weight: 700;
      }

      .floor-chip {
        position: absolute;
        right: 15px;
        top: 15px;
        z-index: 10;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 9px;
        background: rgba(255,255,255,.84);
        border: 1px solid var(--border);
        font-size: 9px;
      }

      .map-zoom {
        position: absolute;
        right: 15px;
        bottom: 15px;
        z-index: 10;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .map-zoom button {
        width: 31px;
        height: 31px;
        border-radius: 9px;
        background: rgba(255,255,255,.84);
        border: 1px solid var(--border);
      }

      .navigation-bottom {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 8px;
        padding: 13px 7px 5px;
      }

      .navigation-bottom span,
      .navigation-bottom strong {
        display: block;
      }

      .navigation-bottom strong {
        margin-top: 4px;
        font-size: 14px;
      }

      .navigation-panel {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .navigation-panel select {
        margin: 15px 0;
      }

      .permission-list {
        margin: 10px 0 15px;
      }

      .permission-list div {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 11px 0;
        border-top: 1px solid var(--border);
        font-size: 10px;
        color: var(--muted);
      }

      .permission-list div svg:last-child {
        margin-left: auto;
        color: #42a96f;
      }

      .next-instruction {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 15px;
      }

      .instruction-icon {
        width: 47px;
        height: 47px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: var(--accent-soft);
        color: var(--accent-strong);
      }

      .next-instruction strong {
        display: block;
        font-size: 12px;
      }

      .next-instruction p {
        color: var(--muted);
        font-size: 10px;
        line-height: 1.5;
      }

      .route-progress-card {
        margin-top: 15px;
      }

      .progress-route {
        display: flex;
        gap: 0;
        margin-top: 25px;
        overflow-x: auto;
      }

      .route-step {
        min-width: 105px;
        position: relative;
        padding-right: 15px;
      }

      .route-step::after {
        content: "";
        position: absolute;
        height: 2px;
        background: rgba(120,150,170,.15);
        width: 80px;
        left: 12px;
        top: 5px;
      }

      .route-step.done::after {
        background: var(--accent-strong);
        opacity: .28;
      }

      .route-step span {
        position: relative;
        z-index: 2;
        display: block;
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: rgba(130,150,170,.2);
        border: 3px solid var(--bg-soft);
      }

      .route-step.done span {
        background: var(--accent-strong);
      }

      .route-step small {
        display: block;
        margin-top: 8px;
        color: var(--muted);
        font-size: 8px;
      }

      /* ---------------- AI ---------------- */

      .ai-card {
        min-height: 560px;
        display: flex;
        flex-direction: column;
      }

      .ai-chat {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 5px;
        overflow-y: auto;
      }

      .message {
        max-width: 70%;
        display: flex;
        align-items: flex-start;
        gap: 7px;
        font-size: 11px;
        line-height: 1.65;
      }

      .message > div:last-child {
        padding: 11px 13px;
        border-radius: 14px;
      }

      .ai-message > div:last-child {
        background: var(--accent-soft);
      }

      .user-message {
        align-self: flex-end;
      }

      .user-message > div:last-child {
        background: rgba(255,255,255,.8);
        border: 1px solid var(--border);
      }

      .ai-message-icon {
        width: 26px;
        height: 26px;
        flex: 0 0 26px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: white;
        color: var(--accent-strong);
      }

      .ai-input {
        display: flex;
        gap: 7px;
        margin-top: 15px;
      }

      .ai-input button {
        width: 45px;
        border-radius: 12px;
        background: var(--accent-soft);
        color: var(--accent-strong);
      }

      /* ---------------- EVENTS / NOTICES ---------------- */

      .event-grid {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 14px;
      }

      .event-date {
        font-size: 27px;
        font-weight: 750;
        letter-spacing: -.05em;
        margin-bottom: 25px;
      }

      .event-grid p {
        color: var(--muted);
        font-size: 10px;
        display: flex;
        gap: 6px;
        align-items: center;
        margin-bottom: 18px;
      }

      .notice-list {
        padding: 7px;
      }

      .notice-list > div {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid var(--border);
      }

      .notice-list > div:last-child {
        border-bottom: 0;
      }

      .notice-icon {
        width: 38px;
        height: 38px;
        border-radius: 11px;
        display: grid;
        place-items: center;
        background: var(--accent-soft);
        color: var(--accent-strong);
      }

      .notice-list > div > div:nth-child(2) {
        flex: 1;
      }

      .notice-list strong,
      .notice-list span {
        display: block;
      }

      .notice-list strong {
        font-size: 11px;
      }

      .notice-list span {
        color: var(--muted);
        font-size: 9px;
        margin-top: 3px;
      }

      /* ---------------- ADMIN ---------------- */

      .admin-main-grid {
        display: grid;
        grid-template-columns: 1.15fr .85fr;
        gap: 15px;
      }

      .campus-health {
        min-height: 290px;
      }

      .health-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 25px;
      }

      .health-list div {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 10px;
      }

      .health-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #57c887;
        box-shadow: 0 0 8px rgba(87,200,135,.4);
      }

      .health-list.large {
        grid-template-columns: repeat(4,1fr);
      }

      .admin-action-list {
        margin-top: 15px;
      }

      .admin-action-list button {
        width: 100%;
        min-height: 50px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 0 10px;
        background: transparent;
        border-bottom: 1px solid var(--border);
        color: var(--text);
        text-align: left;
        font-size: 10px;
      }

      .admin-action-list button svg:last-child {
        margin-left: auto;
        color: var(--muted);
      }

      .admin-list-card {
        padding: 8px;
      }

      .admin-list-card > div {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 16px;
        border-bottom: 1px solid var(--border);
        font-size: 11px;
      }

      .admin-list-card > div:last-child {
        border-bottom: 0;
      }

      .admin-list-card span {
        margin-left: auto;
        color: var(--muted);
        font-size: 9px;
      }

      .system-health-card {
        margin-top: 15px;
      }

      /* ---------------- PROFILE ---------------- */

      .profile-card {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 15px;
      }

      .profile-avatar {
        width: 70px;
        height: 70px;
        display: grid;
        place-items: center;
        border-radius: 22px;
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-size: 25px;
        font-weight: 700;
      }

      .profile-card p {
        color: var(--muted);
        font-size: 11px;
      }

      /* ---------------- RESPONSIVE ---------------- */

      @media (max-width: 1100px) {
        .stats-grid {
          grid-template-columns: repeat(2,1fr);
        }

        .room-grid {
          grid-template-columns: repeat(2,1fr);
        }

        .assignment-grid,
        .event-grid {
          grid-template-columns: repeat(2,1fr);
        }

        .landing-main {
          grid-template-columns: 1fr;
          padding-top: 45px;
        }

        .landing-copy {
          max-width: 720px;
          margin: auto;
          text-align: center;
        }

        .availability-pill {
          margin-left: auto;
          margin-right: auto;
        }

        .hero-logo-container {
          margin-left: auto;
          margin-right: auto;
        }

        .landing-copy > p {
          margin-left: auto;
          margin-right: auto;
        }

        .landing-visual {
          min-height: 450px;
        }

        .navigation-layout,
        .admin-main-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 800px) {
        .sidebar {
          position: fixed;
          left: -260px;
          transition: .25s ease;
          box-shadow: 20px 0 60px rgba(40,90,130,.12);
        }

        .sidebar-open .sidebar {
          left: 0;
        }

        .mobile-menu {
          display: block;
        }

        .topbar {
          padding: 0 15px;
        }

        .content {
          padding: 22px 15px;
        }

        .dashboard-grid,
        .assistant-banner,
        .teacher-hero,
        .attendance-control-card,
        .canteen-hero {
          grid-template-columns: 1fr;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .teacher-voice-card {
          width: 100%;
        }

        .landing-header {
          padding: 15px 20px;
        }

        .landing-copy h1 {
          font-size: 58px;
        }

        .floating-map-card {
          transform: none;
        }

        .floating-assistant {
          right: 0;
          bottom: 2%;
        }

        .navigation-map {
          height: 420px;
        }

        .health-list.large {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 600px) {
        .stats-grid,
        .room-grid,
        .assignment-grid,
        .event-grid {
          grid-template-columns: 1fr;
        }

        .page-header {
          display: block;
        }

        .page-header h1 {
          font-size: 36px;
        }

        .topbar .theme-switcher {
          display: none;
        }

        .secure-note {
          display: flex;
          margin: 12px 0 0;
          justify-content: center;
        }

        .landing-copy h1 {
          font-size: 52px;
        }

        .hero-button {
          width: 100%;
        }

        .floating-assistant {
          position: relative;
          margin-top: -30px;
          width: 90%;
          right: auto;
          bottom: auto;
        }

        .landing-visual {
          min-height: 420px;
        }

        .mini-map {
          height: 320px;
        }

        .otp-row {
          grid-template-columns: 1fr;
        }

        .otp-button {
          margin-bottom: 0;
        }

        .role-tabs button {
          font-size: 9px;
        }

        .lecture-buttons {
          width: 100%;
          flex-direction: column;
        }

        .lecture-buttons button {
          width: 100%;
        }

        .navigation-bottom {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .navigation-bottom strong {
          font-size: 11px;
        }

        .message {
          max-width: 90%;
        }
      }
    `}</style>
  );
}