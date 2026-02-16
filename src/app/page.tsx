"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Upload,
  Brain,
  FileDown,
  CheckCircle,
  Star,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  DollarSign,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const steps = [
  {
    num: 1,
    icon: Upload,
    title: "Upload Your Lease & Deductions",
    desc: "Snap a photo or upload your lease agreement and the itemised deduction statement from your landlord.",
  },
  {
    num: 2,
    icon: Brain,
    title: "AI Analyzes Illegal Charges",
    desc: "Our AI cross-references every charge against your state\u2019s tenant-protection statutes in seconds.",
  },
  {
    num: 3,
    icon: FileDown,
    title: "Download Your Demand Letter",
    desc: "Get a professional, ready-to-send demand letter citing the exact laws your landlord violated.",
  },
];

const features = [
  "State-specific legal analysis",
  "Illegal charge identification",
  "Statutory penalty calculation",
  "Professional demand letter",
  "Specific statute citations",
  "Ready-to-send PDF",
];

const sampleDeductions = [
  { label: "Carpet replacement (normal wear)", amount: "$1,200", illegal: true },
  { label: "Painting — neutral color refresh", amount: "$450", illegal: true },
  { label: "Broken window repair", amount: "$275", illegal: false },
  { label: "Full-unit deep cleaning", amount: "$350", illegal: true },
];

const testimonials = [
  {
    quote:
      "I was about to give up on my $1,400 deposit. DepositGuard found three illegal charges I never would have caught. My landlord sent a check within two weeks.",
    name: "Marissa T.",
    city: "Austin, TX",
    recovered: "$1,180",
  },
  {
    quote:
      "The demand letter was incredibly professional. My property manager called the next day and agreed to refund almost everything. Worth every penny.",
    name: "James O.",
    city: "Denver, CO",
    recovered: "$925",
  },
  {
    quote:
      "As a college student I had no idea what my rights were. This tool spelled it all out and even calculated the penalties my landlord owed me on top of the deposit.",
    name: "Priya K.",
    city: "Chicago, IL",
    recovered: "$640",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans overflow-x-hidden">
      {/* ─── Ambient background glow ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-brand-500/20 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[120px]" />
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  NAV                                                           */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <nav className="glass sticky top-0 z-50 border-x-0 border-t-0 rounded-none">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <ShieldCheck className="h-8 w-8 text-brand-400 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight text-white">
              Deposit<span className="text-brand-400">Guard</span>{" "}
              <span className="text-emerald-400">AI</span>
            </span>
          </Link>

          {/* Right links */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-block text-sm text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:bg-brand-400 hover:shadow-brand-400/30 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  HERO                                                          */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28 animate-fade-in">
        {/* Badge */}
        <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 text-sm text-brand-300">
          <Sparkles className="h-4 w-4" />
          AI-Powered Deposit Recovery
        </div>

        <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl md:text-7xl">
          Get Your Security{" "}
          <br className="hidden sm:block" />
          <span className="gradient-text">Deposit Back</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Our AI finds illegal charges in seconds and generates a professional
          demand letter — so you can recover what&apos;s rightfully yours.
        </p>

        {/* CTA */}
        <div className="mt-10">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:shadow-brand-400/40 hover:-translate-y-1"
          >
            Analyze My Lease Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">2,400+</p>
              <p className="text-sm text-slate-400">Tenants Helped</p>
            </div>
          </div>

          <div className="h-10 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-white">$847</p>
              <p className="text-sm text-slate-400">Average Recovery</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  HOW IT WORKS                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="text-center animate-fade-in">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Three simple steps between you and your money.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3 animate-slide-up">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="glass-card group relative flex flex-col items-center text-center transition-all duration-300 hover:border-brand-400/30 hover:-translate-y-1"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
                  {step.num}
                </div>
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-400/10 text-brand-400 transition-colors duration-300 group-hover:bg-brand-400/20">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  WHAT YOU GET                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="text-center animate-fade-in">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            What You <span className="gradient-text">Get</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Everything you need to fight back — powered by AI, backed by real
            statutes.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-2 animate-slide-up">
          {/* Left — Feature checklist */}
          <div className="space-y-5">
            {features.map((feat) => (
              <div
                key={feat}
                className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-base text-slate-200">{feat}</span>
              </div>
            ))}
          </div>

          {/* Right — Preview card */}
          <div className="glass-card relative overflow-hidden">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Deduction Analysis
              </h3>
              <span className="rounded-full bg-red-500/20 px-3 py-0.5 text-xs font-semibold text-red-400">
                3 Illegal Charges Found
              </span>
            </div>

            {/* Rows */}
            <ul className="space-y-3">
              {sampleDeductions.map((d, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
                    d.illegal
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-white/5 border border-white/5"
                  }`}
                >
                  <span className="text-slate-300">{d.label}</span>
                  <span
                    className={
                      d.illegal
                        ? "font-semibold text-red-400"
                        : "font-semibold text-slate-400"
                    }
                  >
                    {d.amount}
                  </span>
                </li>
              ))}
            </ul>

            {/* Blurred legal citations */}
            <div className="mt-5 space-y-2 select-none">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Legal Citations
              </p>
              <div className="blur-[6px] pointer-events-none space-y-1 text-sm text-slate-400">
                <p>Cal. Civ. Code &sect; 1950.5(b)(3) &mdash; Normal wear and tear exclusion</p>
                <p>Cal. Civ. Code &sect; 1950.5(e) &mdash; Itemization requirement</p>
                <p>Cal. Civ. Code &sect; 1950.5(l) &mdash; Bad faith penalty (2x deposit)</p>
              </div>
            </div>

            {/* Unlock overlay */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent px-6 pb-8 pt-24">
              <Lock className="mb-3 h-6 w-6 text-brand-400" />
              <p className="text-lg font-bold text-white">
                $39 to Unlock Full Report
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Includes demand letter, penalty calculations &amp; statute
                citations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  TESTIMONIALS                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
        <div className="text-center animate-fade-in">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Trusted by <span className="gradient-text">Tenants</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Real recoveries from real renters.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3 animate-slide-up">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-card flex flex-col justify-between transition-all duration-300 hover:border-brand-400/30 hover:-translate-y-1"
            >
              {/* Stars */}
              <div>
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Person */}
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.city}</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-400">
                  +{t.recovered}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  BOTTOM CTA                                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-4xl px-6 py-20 sm:py-28 animate-fade-in">
        <div className="glass-card relative overflow-hidden text-center py-16 px-8">
          {/* Decorative glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-[500px] rounded-full bg-brand-500/20 blur-[100px]" />

          <h2 className="relative font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Don&apos;t let your landlord{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">keep your money</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-slate-400 sm:text-lg">
            Start your free analysis today. It takes less than two minutes.
          </p>
          <div className="relative mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:shadow-brand-400/40 hover:-translate-y-1"
            >
              Analyze My Lease Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  FOOTER                                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-12 sm:flex-row sm:justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand-400" />
            <span className="text-lg font-bold text-white">
              Deposit<span className="text-brand-400">Guard</span>{" "}
              <span className="text-emerald-400">AI</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="border-t border-white/5">
          <p className="mx-auto max-w-4xl px-6 py-6 text-center text-xs leading-relaxed text-slate-600">
            DepositGuard AI is a self-help tool, not a law firm. Information
            provided does not constitute legal advice. Use of this service does
            not create an attorney-client relationship. Consult a licensed
            attorney for legal guidance specific to your situation.
          </p>
        </div>
      </footer>
    </div>
  );
}
