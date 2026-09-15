import { ArrowRight, Check, Code2, GitPullRequest, LockKeyhole, ScanLine, ShieldAlert, Terminal } from "lucide-react";
import { Link } from "wouter";
import SecurityMesh from "../components/SecurityMesh";

const stats = [
  ["01", "local-first", "Your source stays in your environment while the detector does its work."],
  ["02", "mask immediately", "Only masked values move into logs, review threads, and dashboards."],
  ["03", "block the merge", "High-confidence findings become a clear stop signal before release."],
];

export default function Home() {
  return (
    <div>
      <section className="relative isolate overflow-hidden border-b hairline">
        <SecurityMesh />
        <div className="container relative grid min-h-[650px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
          <div className="max-w-2xl">
            <div className="eyebrow mb-7 flex items-center gap-2"><span className="signal-caret" /> detector engine online / v0.1</div>
            <h1 className="display-font max-w-[760px] text-5xl font-bold leading-[0.94] sm:text-7xl lg:text-[92px]">Stop secrets at the <span className="text-primary">merge point.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">Secret Leak Detector finds credentials where they first become dangerous: inside the working tree, before they reach a branch, build log, or production system.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/scan" className="button-primary">Run a live scan <ArrowRight size={16} /></Link><Link href="/docs" className="button-secondary">Read the method</Link></div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Check size={16} className="text-primary" /> no raw values stored</span><span className="flex items-center gap-2"><Check size={16} className="text-primary" /> regex + entropy signals</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -inset-4 bg-accent/20 blur-3xl" />
            <div className="surface relative overflow-hidden rounded-[2px] border hairline">
              <div className="flex items-center justify-between border-b hairline px-5 py-4"><div className="flex items-center gap-2"><Terminal size={15} className="text-primary" /><span className="mono-font text-xs text-muted-foreground">scan / payment-service</span></div><span className="mono-font text-[10px] uppercase tracking-[.12em] text-primary">live</span></div>
              <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-5 font-mono text-xs leading-7"><div className="text-muted-foreground"><div><span className="text-primary">$</span> secret-scan ./src</div><div><span className="text-primary">›</span> walking 148 files</div><div><span className="text-primary">›</span> applying signal matrix</div><div><span className="text-primary">›</span> masking values</div></div><div className="text-right text-muted-foreground"><div>04.82s</div><div>148 / 148</div><div className="text-primary">3 signals</div><div className="text-destructive">merge blocked</div></div></div>
              <div className="border-y hairline bg-secondary/40 px-5 py-4"><div className="mb-3 flex items-center justify-between"><span className="mono-font text-[11px] text-muted-foreground">signal profile</span><span className="mono-font text-[11px] text-primary">HIGH</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[83%] rounded-full bg-primary" /></div><div className="mt-3 flex justify-between text-[11px] text-muted-foreground"><span>regex match</span><span>entropy 4.71</span><span>blocked</span></div></div>
              <div className="flex items-center gap-4 px-5 py-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><ShieldAlert size={21} /></div><div><p className="font-semibold">Credential exposure caught</p><p className="mono-font mt-1 text-[11px] text-muted-foreground">config/payments.ts:27 / masked</p></div></div>
            </div>
            <p className="mono-font mt-4 text-center text-[10px] uppercase tracking-[.16em] text-muted-foreground">signals are evidence, not decoration</p>
          </div>
        </div>
      </section>

      <section className="border-b hairline bg-card"><div className="container grid md:grid-cols-3">{stats.map(([number, title, text], index) => <div key={number} className={`px-0 py-9 md:px-8 md:py-12 ${index !== 0 ? "border-t hairline md:border-l md:border-t-0" : ""}`}><span className="mono-font text-xs text-primary">{number}</span><h2 className="display-font mt-4 text-2xl font-semibold">{title}</h2><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></section>

      <section className="container grid gap-16 py-24 lg:grid-cols-[.8fr_1.2fr] lg:py-32"><div><p className="eyebrow">Designed for the merge path</p><h2 className="display-font mt-5 max-w-lg text-4xl font-bold leading-tight sm:text-5xl">Security that feels like infrastructure, not theater.</h2><p className="mt-6 max-w-md leading-7 text-muted-foreground">The interface stays quiet so the signal can stay clear. Every finding has a file, a line, a confidence level, and an explicit reason to stop.</p><Link href="/about" className="mt-8 inline-flex items-center gap-2 font-semibold text-primary">See the thinking <ArrowRight size={16} /></Link></div><div className="grid gap-px overflow-hidden border hairline bg-border sm:grid-cols-2"><Feature icon={<ScanLine />} label="Detect" title="Regex + entropy" text="Known formats catch the obvious. Entropy catches what pattern libraries miss." /><Feature icon={<LockKeyhole />} label="Protect" title="Mask at source" text="Values are masked before they are persisted, returned, or written to a review surface." /><Feature icon={<GitPullRequest />} label="Decide" title="Block with context" text="A confidence score and source location make every stop understandable." /><Feature icon={<Code2 />} label="Ship" title="Keep moving" text="Resolve the finding, rerun the scan, and make the merge decision with evidence." /></div></section>

      <section className="relative overflow-hidden border-y hairline bg-secondary/40"><SecurityMesh compact /><div className="container relative flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center"><div><p className="eyebrow">Ready when you are</p><h2 className="display-font mt-3 text-3xl font-bold sm:text-4xl">Try the detector on a real snippet.</h2></div><Link href="/scan" className="button-primary">Open the scanner <ArrowRight size={16} /></Link></div></section>
    </div>
  );
}

function Feature({ icon, label, title, text }: { icon: React.ReactNode; label: string; title: string; text: string }) {
  return <div className="surface p-7 sm:p-8"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">{icon}</span><span className="eyebrow">{label}</span></div><h3 className="display-font mt-8 text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}
