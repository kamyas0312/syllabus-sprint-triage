
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Coins, MessageSquare, Send, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestShell, pageHead } from "@/components/quest-shell";

export const Route = createFileRoute("/feedback")({
  head: () => pageHead("The Royal Scribe's Scroll", "Share your optional feedback to improve AgrabahScribe."),
  component: FeedbackPage,
});

function FeedbackPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(5);
  const [favoriteFeature, setFavoriteFeature] = useState<string>("Anti-Cheat Lock Timer");
  const [comments, setComments] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save feedback to localStorage
    const existingFeedback = JSON.parse(localStorage.getItem("agrabah_feedback") || "[]");
    const newEntry = {
      rating,
      favoriteFeature,
      comments,
      date: new Date().toISOString(),
    };
    localStorage.setItem("agrabah_feedback", JSON.stringify([...existingFeedback, newEntry]));

    // Reward +50 bonus dinars for giving feedback
    const currentGold = Number(localStorage.getItem("gold_shared") || 250);
    localStorage.setItem("gold_shared", String(currentGold + 50));

    setSubmitted(true);
    setTimeout(() => {
      navigate({ to: "/subjects" });
    }, 2500);
  };

  return (
    <QuestShell>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 pb-28 pt-10">
        <Link
          to="/subjects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-8"
        >
          <ArrowLeft className="size-4" /> Skip & Return to Library
        </Link>

        <div className="bg-[#141B3D]/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-primary/30 shadow-2xl relative overflow-hidden">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="size-8" />
              </div>
              <h2 className="font-display text-2xl text-white">Your Scroll Has Been Inscribed!</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                May your journey through exams be victorious. We have deposited <strong className="text-amber-300">+50 Dinars</strong> into your vault.
              </p>
              <span className="text-[11px] font-mono text-primary block">Redirecting to the Library...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                  <Sparkles className="size-4" /> Royal Scribe's Scroll · Optional
                </span>
                <h1 className="font-display text-3xl text-white mt-1">Enter Your Feedback</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  How was your focus session? Your words help the Sultan and the Genie improve this quest.
                </p>
              </div>

              {/* Star Rating */}
              <div className="p-4 rounded-xl bg-black/40 border border-primary/20 space-y-2">
                <label className="text-xs font-semibold text-white block">Rate Your Study Experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition hover:scale-125"
                    >
                      <Star
                        className={`size-6 ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Feature Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white block">Which Weapon Helped You Most?</label>
                <select
                  value={favoriteFeature}
                  onChange={(e) => setFavoriteFeature(e.target.value)}
                  className="w-full bg-black/50 border border-primary/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Anti-Cheat Lock Timer">Strict Anti-Cheat Focus Hourglass</option>
                  <option value="Persona Sprints">Nomad / Vizier / Sultan Personas</option>
                  <option value="Scribe Notepad">Side-by-Side Scribe Notepad & Formulas</option>
                  <option value="Dinar Bounties">Difficulty-Based Dinar Bounties</option>
                  <option value="Dune Winds">Dune Winds Focus White Noise</option>
                </select>
              </div>

              {/* Comments Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white block">Any Suggestions or Missing Topics?</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us what would make your exam preparation even easier..."
                  rows={4}
                  className="w-full bg-black/50 border border-primary/20 rounded-xl p-3.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <Link to="/subjects" className="text-xs text-muted-foreground hover:text-white">
                  Skip for Now
                </Link>
                <Button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-primary to-amber-500 text-black font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Send className="size-3.5" /> Submit Scroll (+50 <Coins className="size-3 inline" />)
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </QuestShell>
  );
}