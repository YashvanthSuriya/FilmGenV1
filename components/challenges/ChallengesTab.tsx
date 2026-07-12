"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from "react"
import { Award, CalendarClock, Check, Crown, Flame, Send, ThumbsUp, Trophy, Upload, Users, X } from "lucide-react"
import { CardStack, type CardStackItem } from "@/components/ui/card-stack"
import { filmChallenges, useChallengesStore, type ChallengeSortMode, type ChallengeSubmission, type FilmChallenge } from "@/lib/stores/challenges"
import { useProjectStore } from "@/lib/stores/project"

const thumbnailChoices = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80"
]

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",")

export function ChallengesTab() {
  const selectedChallengeId = useChallengesStore((state) => state.selectedChallengeId)
  const setSelectedChallenge = useChallengesStore((state) => state.setSelectedChallenge)
  const openSubmissionModal = useChallengesStore((state) => state.openSubmissionModal)
  const submissions = useChallengesStore((state) => state.submissions)
  const selectedChallenge = filmChallenges.find((challenge) => challenge.id === selectedChallengeId) ?? filmChallenges[0]
  const selectedSubmissions = submissions.filter((submission) => submission.challengeId === selectedChallenge.id)
  const winners = submissions.filter((submission) => submission.winner || submission.shortlisted).slice(0, 7)
  const winnerCards: CardStackItem[] = winners.map((submission) => ({
    id: submission.id,
    title: submission.title,
    description: submission.description,
    imageSrc: submission.thumbnailUrl,
    tag: submission.winner ? "Winner" : "Shortlist"
  }))
  const [activeWinnerId, setActiveWinnerId] = useState(() => String(winnerCards[0]?.id ?? ""))
  const activeWinner = winners.find((submission) => submission.id === activeWinnerId) ?? winners[0]

  useEffect(() => {
    if (winnerCards.length > 0 && !winnerCards.some((card) => String(card.id) === activeWinnerId)) {
      setActiveWinnerId(String(winnerCards[0]?.id ?? ""))
    }
  }, [activeWinnerId, winnerCards])

  return (
    <main className="min-h-[calc(100vh-var(--nav-height))] overflow-hidden bg-[#030506] text-text-primary">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <img src={selectedChallenge.themeImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" loading="eager" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(3,5,6,0.97)_0%,rgba(3,5,6,0.72)_52%,rgba(3,5,6,0.24)_100%)]" />
        <div className="relative z-10 mx-auto grid min-h-[620px] w-full max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:px-12">
          <div className="pb-10">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-accent-cyan">Active Challenge</p>
            <h1 className="mt-5 font-heading text-5xl font-bold leading-none text-white md:text-7xl">{selectedChallenge.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">{selectedChallenge.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric icon={CalendarClock} label="Deadline" value={formatCountdown(selectedChallenge.deadline)} />
              <Metric icon={Trophy} label="Prize" value={`${selectedChallenge.prizeCredits} credits`} />
              <Metric icon={Users} label="Entrants" value={selectedChallenge.participantCount.toLocaleString()} />
            </div>
            <p className="mt-4 text-sm text-white/60">{selectedChallenge.prizePlacement}</p>
            <button type="button" onClick={() => openSubmissionModal(selectedChallenge.id)} className="mt-7 inline-flex h-12 items-center gap-2 rounded-(--radius-md) bg-accent-cyan px-5 font-heading text-sm font-bold uppercase tracking-[0.08em] text-black transition hover:brightness-110">
              <Send className="h-4 w-4" />
              Submit Project
            </button>
          </div>

          <div className="min-w-0 pb-4">
            <p className="mb-2 text-center font-heading text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Previous Winners</p>
            <CardStack
              items={winnerCards}
              cardWidth={460}
              cardHeight={258}
              maxVisible={3}
              overlap={0.6}
              spreadDeg={18}
              springStiffness={200}
              springDamping={24}
              autoAdvance
              intervalMs={5200}
              showDots
              className="mx-auto max-w-[620px]"
              onChangeIndex={(_index, item) => setActiveWinnerId(String(item.id))}
              onSelectItem={(_index, item) => setActiveWinnerId(String(item.id))}
              renderCard={(item, { active }) => <WinnerStackCard item={item} active={active} />}
            />
            {activeWinner ? (
              <div className="mx-auto mt-4 max-w-[560px] rounded-(--radius-md) border border-white/10 bg-black/45 p-4 backdrop-blur">
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-accent-amber">{activeWinner.winner ? "Winner" : "Shortlist"}</p>
                <h2 data-active-winner-title className="mt-2 font-heading text-2xl font-bold text-white">{activeWinner.title}</h2>
                <p className="mt-1 text-xs text-white/60">by {activeWinner.creator} - {activeWinner.votes.toLocaleString()} votes</p>
                <p className="mt-3 text-sm leading-6 text-white/70">{activeWinner.description}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <div className="space-y-8">
          <ChallengeGrid selectedChallengeId={selectedChallenge.id} onSelect={setSelectedChallenge} onSubmit={openSubmissionModal} />
          <VotingPanel challenge={selectedChallenge} submissions={selectedSubmissions} />
        </div>
        <Leaderboard submissions={submissions} />
      </section>

      <SubmissionModal />
    </main>
  )
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-(--radius-md) border border-white/10 bg-white/10 p-3 backdrop-blur">
      <Icon className="h-4 w-4 text-accent-cyan" />
      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/50">{label}</p>
      <p className="mt-1 font-heading text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function WinnerStackCard({ item, active }: { item: CardStackItem; active: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden rounded-(--radius-md) border ${active ? "border-accent-amber" : "border-white/10"} bg-black`}>
      <img src={item.imageSrc ?? thumbnailChoices[0]} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/12 to-transparent" />
      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-accent-amber px-3 py-1 text-xs font-bold text-black">
        <Crown className="h-3.5 w-3.5" />
        {item.tag}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-heading text-3xl font-bold text-white">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/70">{item.description}</p>
      </div>
    </div>
  )
}

function ChallengeGrid({ selectedChallengeId, onSelect, onSubmit }: { selectedChallengeId: string; onSelect: (challengeId: string) => void; onSubmit: (challengeId: string) => void }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Challenge Board</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary">Open briefs and past contests</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filmChallenges.map((challenge) => (
          <article key={challenge.id} className={`overflow-hidden rounded-(--radius-md) border bg-surface shadow-lg shadow-black/20 transition ${selectedChallengeId === challenge.id ? "border-accent-cyan shadow-cyan" : "border-border-subtle hover:border-accent-cyan/70"}`}>
            <button type="button" onClick={() => onSelect(challenge.id)} className="block w-full text-left">
              <div className="relative aspect-16/9 overflow-hidden">
                <img src={challenge.themeImageUrl} alt={challenge.title} className="h-full w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                <StatusBadge status={challenge.status} />
              </div>
              <div className="p-4">
                <h3 className="font-heading text-xl font-bold text-text-primary">{challenge.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{challenge.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
                  <span>{challenge.participantCount.toLocaleString()} participants</span>
                  <span>-</span>
                  <span>{formatCountdown(challenge.deadline)}</span>
                </div>
                {challenge.winnerTitle ? <p className="mt-3 text-xs uppercase tracking-[0.12em] text-accent-amber">Winner: {challenge.winnerTitle}</p> : null}
              </div>
            </button>
            {challenge.status === "Open" ? (
              <button type="button" onClick={() => onSubmit(challenge.id)} className="mx-4 mb-4 inline-flex h-9 items-center gap-2 rounded-(--radius-md) border border-border-subtle px-3 text-sm text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan">
                <Upload className="h-4 w-4" />
                Submit
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function StatusBadge({ status }: { status: FilmChallenge["status"] }) {
  const className =
    status === "Open"
      ? "bg-accent-cyan text-black"
      : status === "Voting"
        ? "bg-accent-amber text-black"
        : status === "Judging"
          ? "bg-accent-purple text-white"
          : "bg-white/10 text-white/70"
  return <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ${className}`}>{status}</span>
}

function VotingPanel({ challenge, submissions }: { challenge: FilmChallenge; submissions: ChallengeSubmission[] }) {
  const sortMode = useChallengesStore((state) => state.sortMode)
  const setSortMode = useChallengesStore((state) => state.setSortMode)
  const upvoteSubmission = useChallengesStore((state) => state.upvoteSubmission)
  const votedSubmissionIds = useChallengesStore((state) => state.votedSubmissionIds)
  const sortedSubmissions = useMemo(() => sortSubmissions(submissions, sortMode), [sortMode, submissions])

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Voting</p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-text-primary">{challenge.title} submissions</h2>
        </div>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value as ChallengeSortMode)} className="h-10 rounded-(--radius-md) border border-border-subtle bg-surface px-3 text-sm text-text-primary outline-none" aria-label="Sort submissions">
          {(["Most Voted", "Newest", "Random"] as const).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sortedSubmissions.map((submission) => {
          const voted = votedSubmissionIds.includes(submission.id)
          return (
            <article key={submission.id} className="overflow-hidden rounded-(--radius-md) border border-border-subtle bg-surface">
              <div className="relative aspect-video">
                <img src={submission.thumbnailUrl} alt={submission.title} className="h-full w-full object-cover" loading="lazy" />
                {submission.shortlisted ? <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-accent-amber">Jury shortlist</span> : null}
              </div>
              <div className="p-4">
                <h3 className="font-heading text-lg font-bold text-text-primary">{submission.title}</h3>
                <p className="mt-1 text-xs text-text-muted">by {submission.creator}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{submission.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-accent-cyan">{submission.votes.toLocaleString()} votes</span>
                  <button type="button" disabled={voted} onClick={() => upvoteSubmission(submission.id)} className="inline-flex h-9 items-center gap-2 rounded-(--radius-md) border border-border-subtle px-3 text-sm text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-55">
                    {voted ? <Check className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                    {voted ? "Voted" : "Upvote"}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Leaderboard({ submissions }: { submissions: ChallengeSubmission[] }) {
  const leaders = useMemo(() => [...submissions].sort((a, b) => b.votes - a.votes).slice(0, 10), [submissions])
  const winner = leaders.find((submission) => submission.winner) ?? leaders[0]

  return (
    <aside className="space-y-4">
      {winner ? (
        <section className="relative overflow-hidden rounded-(--radius-md) border border-accent-amber bg-surface p-4">
          <div className="absolute inset-0 bg-accent-amber-dim" />
          <div className="relative">
            <Award className="h-6 w-6 text-accent-amber" />
            <p className="mt-3 font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-amber">Winner Announcement</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-text-primary">{winner.title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{winner.description}</p>
          </div>
        </section>
      ) : null}
      <section className="rounded-(--radius-md) border border-border-subtle bg-surface p-4">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-accent-cyan" />
          <h2 className="font-heading text-xl font-bold text-text-primary">Top 10 Leaderboard</h2>
        </div>
        <ol className="space-y-2">
          {leaders.map((submission, index) => (
            <li key={submission.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-(--radius-md) border border-border-subtle bg-background/70 p-2">
              <span className="font-heading text-sm font-bold text-text-muted">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-text-primary">{submission.title}</p>
                <p className="truncate text-xs text-text-muted">{submission.creator}</p>
              </div>
              <span className="text-sm text-accent-cyan">{submission.votes}</span>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  )
}

function SubmissionModal() {
  const submissionModalChallengeId = useChallengesStore((state) => state.submissionModalChallengeId)
  const closeSubmissionModal = useChallengesStore((state) => state.closeSubmissionModal)
  const submitProject = useChallengesStore((state) => state.submitProject)
  const submittedChallengeIds = useChallengesStore((state) => state.submittedChallengeIds)
  const projects = useProjectStore((state) => state.projects)
  const projectName = useProjectStore((state) => state.projectName)
  const challenge = filmChallenges.find((item) => item.id === submissionModalChallengeId) ?? null
  const modalRef = useRef<HTMLDivElement | null>(null)
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [title, setTitle] = useState(projectName)
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState(thumbnailChoices[0])
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (challenge) modalRef.current?.focus()
  }, [challenge])

  if (!challenge) return null

  const activeChallenge = challenge
  const alreadySubmitted = submittedChallengeIds.includes(activeChallenge.id)
  const selectedProjectName = projects.find((project) => project.id === projectId)?.name ?? projectName

  function submit() {
    if (!acknowledged || alreadySubmitted) return
    submitProject({
      challengeId: activeChallenge.id,
      projectName: selectedProjectName,
      title,
      description,
      thumbnailUrl
    })
  }

  return (
    <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="challenge-submit-title" tabIndex={-1} onKeyDown={(event) => trapFocus(event, modalRef.current, closeSubmissionModal)} className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 p-3 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-(--radius-lg) border border-border-subtle bg-[#07090b] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.12em] text-accent-cyan">Submit Project</p>
            <h2 id="challenge-submit-title" className="mt-2 font-heading text-3xl font-bold text-text-primary">{activeChallenge.title}</h2>
          </div>
          <button type="button" onClick={closeSubmissionModal} className="grid h-10 w-10 place-items-center rounded-full border border-border-subtle text-text-secondary transition hover:border-accent-cyan hover:text-accent-cyan" aria-label="Close submission modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {alreadySubmitted ? (
          <div className="mt-5 rounded-(--radius-md) border border-accent-amber bg-accent-amber-dim p-4 text-sm text-text-primary">
            You already submitted to this challenge in the local demo state.
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm text-text-secondary">
              Project
              <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="h-11 rounded-(--radius-md) border border-border-subtle bg-surface px-3 text-text-primary outline-none">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-text-secondary">
              Submission title
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 rounded-(--radius-md) border border-border-subtle bg-surface px-3 text-text-primary outline-none focus:border-accent-cyan" />
            </label>
            <label className="grid gap-2 text-sm text-text-secondary">
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-(--radius-md) border border-border-subtle bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent-cyan" />
            </label>
            <div>
              <p className="mb-2 text-sm text-text-secondary">Thumbnail</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {thumbnailChoices.map((choice) => (
                  <button key={choice} type="button" onClick={() => setThumbnailUrl(choice)} className={`overflow-hidden rounded-(--radius-md) border ${thumbnailUrl === choice ? "border-accent-cyan" : "border-border-subtle"}`}>
                    <img src={choice} alt="Submission thumbnail option" className="aspect-video w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-start gap-3 text-sm text-text-secondary">
              <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-1 accent-accent-cyan" />
              I confirm this is my project submission and agree to the one-submission-per-challenge rule.
            </label>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={closeSubmissionModal} className="h-11 rounded-(--radius-md) px-4 text-sm text-text-secondary transition hover:bg-elevated hover:text-text-primary">Cancel</button>
          <button type="button" disabled={!acknowledged || alreadySubmitted} onClick={submit} className="inline-flex h-11 items-center gap-2 rounded-(--radius-md) bg-accent-cyan px-4 font-heading text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45">
            <Send className="h-4 w-4" />
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  )
}

function sortSubmissions(submissions: ChallengeSubmission[], sortMode: ChallengeSortMode) {
  if (sortMode === "Newest") return [...submissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  if (sortMode === "Random") return [...submissions].sort((a, b) => a.id.localeCompare(b.id)).reverse()
  return [...submissions].sort((a, b) => b.votes - a.votes)
}

function formatCountdown(deadline: string) {
  const remaining = new Date(deadline).getTime() - Date.now()
  if (remaining <= 0) return "Closed"
  const days = Math.floor(remaining / 86_400_000)
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000)
  return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`
}

function trapFocus(event: KeyboardEvent<HTMLDivElement>, root: HTMLElement | null, onEscape: () => void) {
  if (event.key === "Escape") {
    event.stopPropagation()
    onEscape()
    return
  }
  if (event.key !== "Tab" || !root) return
  const focusable = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => !element.hasAttribute("disabled"))
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
