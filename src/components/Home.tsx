import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  LockKeyhole,
  Square,
  Droplets,
  Grid2X2,
  Check,
  Download,
  MousePointer2,
  ChevronDown,
  Menu,
  X,
  ScanLine,
  Upload,
  Sparkles,
} from "lucide-react";
import { Brand } from "./Brand";
import { Uploader } from "./Uploader";
import { Button } from "./ui/button";
const faqs = [
  [
    "Do my screenshots ever leave my device?",
    "No. MaskMate decodes, edits, and exports your image in your browser. This application does not upload image data or save your screenshots to a server or browser storage.",
  ],
  [
    "Is MaskMate really free?",
    "Yes. All editing tools and original-resolution PNG downloads are free. No account, subscription, or watermark.",
  ],
  [
    "Which image formats can I use?",
    "Upload PNG, JPG, or WebP images up to 20 MB and 24 megapixels. Your finished image downloads as a new PNG at the original decoded dimensions.",
  ],
  [
    "Should I use redaction, blur, or pixelation?",
    "Use solid redaction for confidential information. It replaces the covered area with opaque pixels in the exported PNG. Blur and pixelation are visual effects and may leave information recoverable.",
  ],
  [
    "Can I use MaskMate on my phone?",
    "Yes. Select a screenshot from your phone, choose a tool, and drag with your finger to cover an area. The editor supports touch, mouse, and pen.",
  ],
];
export function Home({
  onFile,
  busy,
  onDemo,
  onEditor,
}: {
  onFile: (f: File) => void;
  busy: boolean;
  onDemo: () => void;
  onEditor: () => void;
}) {
  const [menu, setMenu] = useState(false),
    [previewTool, setPreviewTool] = useState("redact"),
    [original, setOriginal] = useState(false);
  return (
    <div className="home">
      <header className="site-header">
        <div className="container nav-inner">
          <Brand
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
          <nav className={menu ? "open" : ""} aria-label="Main navigation">
            <a href="#features" onClick={() => setMenu(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenu(false)}>
              How it works
            </a>
            <a href="#privacy" onClick={() => setMenu(false)}>
              Privacy <LockKeyhole size={12} />
            </a>
          </nav>
          <Button className="nav-cta" size="sm" onClick={onEditor}>
            Open editor <ArrowUpRight size={16} />
          </Button>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> A LITTLE PRIVACY GOES A LONG WAY
            </div>
            <h1>
              Share screenshots,
              <br />
              not your{" "}
              <span className="secret-word">
                secrets.
                <svg viewBox="0 0 330 17" aria-hidden="true">
                  <path d="M4 11Q135 -3 323 7M21 15Q185 3 307 13" />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              Some things are better left unseen. Hide personal details from
              your screenshots in seconds. All in your browser. All yours.
            </p>
            <div className="hero-actions">
              <Button
                onClick={() =>
                  document
                    .getElementById("upload")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                Protect my screenshot <ArrowUpRight size={18} />
              </Button>
              <button className="text-button" onClick={onDemo}>
                Try an example <ArrowRight size={16} />
              </button>
            </div>
            <div className="hero-assurances">
              <span>
                <Check size={14} /> Free, always
              </span>
              <span>
                <Check size={14} /> No sign-up
              </span>
              <span>
                <Check size={14} /> No uploads
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-note note-top">
              <ShieldCheck size={16} />
              <span>
                Personal details. <strong>Protected.</strong>
              </span>
            </div>
            <div className="demo-window">
              <div className="window-bar">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>your-screenshot.png</span>
                <LockKeyhole size={12} />
              </div>
              <div className="demo-body">
                <div className="demo-tools">
                  {[
                    { id: "select", icon: MousePointer2 },
                    { id: "redact", icon: Square },
                    { id: "blur", icon: Droplets },
                    { id: "pixelate", icon: Grid2X2 },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className={previewTool === t.id ? "active" : ""}
                      onClick={() => {
                        setPreviewTool(t.id);
                        setOriginal(t.id === "select");
                      }}
                      aria-label={`Preview ${t.id}`}
                      title={t.id}
                    >
                      <t.icon size={19} />
                    </button>
                  ))}
                  <span />
                  <button aria-label="Open example in editor" onClick={onDemo}>
                    <Download size={18} />
                  </button>
                </div>
                <div className="receipt">
                  <div className="receipt-heading">
                    <span className="receipt-logo">
                      m<span>↗</span>
                    </span>
                    <span>Payment receipt</span>
                    <span className="receipt-ellipsis">•••</span>
                  </div>
                  <div className="receipt-success">
                    <span>
                      <Check size={21} />
                    </span>
                    <strong>Payment successful</strong>
                    <small>16 October 2026, 10:42 AM</small>
                  </div>
                  <div className="receipt-amount">
                    <small>Amount sent</small>
                    <strong>৳ 2,500.00</strong>
                  </div>
                  <div className="receipt-rows">
                    <div>
                      <span>Recipient</span>
                      <b>Alex Morgan</b>
                    </div>
                    <div>
                      <span>Phone number</span>
                      <b className={!original ? `masked ${previewTool}` : ""}>
                        {original ? (
                          "+880 1712 345678"
                        ) : (
                          <>
                            <span>+880 1712 345678</span>
                            <i className="mask-handle tl" />
                            <i className="mask-handle br" />
                          </>
                        )}
                      </b>
                    </div>
                    <div>
                      <span>Transaction ID</span>
                      <b className={!original ? `masked ${previewTool}` : ""}>
                        <span>MM8A2F930X</span>
                      </b>
                    </div>
                  </div>
                  <div className="receipt-footer">
                    Illustrative sample · fictional details
                  </div>
                </div>
              </div>
              <div className="demo-status">
                <span>
                  <i /> All changes stay on your device
                </span>
                <button onClick={() => setOriginal(!original)}>
                  {original ? "Show protected" : "Show original"}{" "}
                  <ScanLine size={13} />
                </button>
              </div>
            </div>
            <div className="floating-note note-bottom">
              <span className="note-check">
                <Check size={15} />
              </span>
              <div>
                Ready to share.<small>Without the overshare.</small>
              </div>
              <Sparkles size={19} />
            </div>
            <div className="visual-caption">
              your screenshot. your business.
            </div>
          </div>
        </section>
        <div className="promise-strip">
          <div className="container">
            <span>
              <LockKeyhole size={17} /> Your images never leave your browser.
            </span>
            <span>
              No cloud. No accounts. No second thoughts.{" "}
              <ShieldCheck size={17} />
            </span>
          </div>
        </div>
        <section className="workspace-section container" id="upload">
          <div className="section-heading">
            <div className="eyebrow">LESS OVERSHARING. MORE PEACE OF MIND.</div>
            <h2>A clean screenshot starts here.</h2>
            <p>Cover what’s private. Keep what matters.</p>
          </div>
          <div className="upload-layout">
            <Uploader onFile={onFile} busy={busy} />
            <div className="upload-aside">
              <div className="small-label">THREE TOOLS. ONE LESS WORRY.</div>
              <div className="tool-feature">
                <span className="tool-symbol solid">
                  <Square size={20} fill="currentColor" />
                </span>
                <div>
                  <h3>
                    Redact <span className="recommended">Recommended</span>
                  </h3>
                  <p>
                    Cover sensitive details with a solid block.
                    <br />
                    Hidden for good in your download.
                  </p>
                </div>
              </div>
              <div className="tool-feature">
                <span className="tool-symbol">
                  <Droplets size={22} />
                </span>
                <div>
                  <h3>Blur</h3>
                  <p>
                    Soften background details and distractions
                    <br />
                    with an adjustable blur.
                  </p>
                </div>
              </div>
              <div className="tool-feature">
                <span className="tool-symbol">
                  <Grid2X2 size={21} />
                </span>
                <div>
                  <h3>Pixelate</h3>
                  <p>
                    Give selected areas a classic mosaic effect.
                    <br />
                    You choose the pixel size.
                  </p>
                </div>
              </div>
              <p className="effect-caution">
                <ShieldCheck size={15} /> For private information, always choose
                solid redaction.
              </p>
            </div>
          </div>
        </section>
        <section className="feature-section container" id="features">
          <div className="feature-intro">
            <div className="eyebrow">BUILT TO MIND ITS OWN BUSINESS</div>
            <h2>
              Your privacy.
              <br />
              Without the extra steps.
            </h2>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: LockKeyhole,
                title: "Private by design",
                text: "Your screenshots stay in your browser. No uploads, no cloud image storage. Just you and your image.",
              },
              {
                icon: ScanLine,
                title: "Every pixel, protected",
                text: "Precise selections. Permanent solid redaction. Undo when you need to, then export a fresh, flattened image.",
              },
              {
                icon: Download,
                title: "Ready in a few clicks",
                text: "No sign-up or software to install. Download a full-resolution PNG with no watermark attached.",
              },
            ].map((f) => (
              <article key={f.title}>
                <span className="feature-icon">
                  <f.icon size={24} strokeWidth={1.6} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="how-section" id="how-it-works">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow">FROM SCREENSHOT TO SHARE-READY</div>
              <h2>Three steps. Zero oversharing.</h2>
            </div>
            <div className="steps">
              {[
                {
                  icon: Upload,
                  title: "Bring your screenshot",
                  text: "Drop it in, browse your files, or paste straight from your clipboard.",
                },
                {
                  icon: Square,
                  title: "Hide the private parts",
                  text: "Drag over names, numbers, messages, or anything you’d rather keep to yourself.",
                },
                {
                  icon: Download,
                  title: "Share with confidence",
                  text: "Check the whole image, download your PNG, and send it on its way.",
                },
              ].map((s, i) => (
                <article key={s.title}>
                  <div className="step-top">
                    <span>0{i + 1}</span>
                    <s.icon size={24} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="privacy-section container" id="privacy">
          <div className="privacy-emblem">
            <ShieldCheck size={62} strokeWidth={1.1} />
            <span className="orbit-dot" />
          </div>
          <div>
            <div className="eyebrow">
              WHAT HAPPENS IN YOUR BROWSER, STAYS THERE.
            </div>
            <h2>
              We don’t need to see it.
              <br />
              And neither does everyone else.
            </h2>
            <p>
              MaskMate processes images on your device. Your screenshots aren’t
              sent to a server or saved by this application. When you close the
              tab, the in-memory editing session ends.
            </p>
            <span className="privacy-footnote">
              <LockKeyhole size={14} /> No image uploads. No cloud image
              storage. No account.
            </span>
          </div>
        </section>
        <section className="faq-section container">
          <div>
            <div className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</div>
            <h2>
              Good questions.
              <br />
              Straight answers.
            </h2>
            <p>A little clarity before you get started.</p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="last-cta container">
          <span className="eyebrow">KEEP THE MOMENT. KEEP YOUR PRIVACY.</span>
          <h2>Go ahead. Share the screenshot.</h2>
          <Button
            onClick={() =>
              document
                .getElementById("upload")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Let’s make it share-ready <ArrowUpRight size={18} />
          </Button>
          <p>Free to use. Yours to keep private.</p>
        </section>
      </main>
      <footer className="site-footer container">
        <Brand
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <span>A little cover. A lot of peace of mind.</span>
        <a href="#privacy">
          Made for your privacy <ShieldCheck size={14} />
        </a>
      </footer>
    </div>
  );
}
