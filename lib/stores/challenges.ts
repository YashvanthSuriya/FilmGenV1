import { create } from "zustand"

export type ChallengeStatus = "Open" | "Voting" | "Judging" | "Closed"
export type ChallengeSortMode = "Most Voted" | "Newest" | "Random"

export interface FilmChallenge {
  id: string
  title: string
  description: string
  themeImageUrl: string
  status: ChallengeStatus
  deadline: string
  prizeCredits: number
  prizePlacement: string
  participantCount: number
  winnerTitle?: string
}

export interface ChallengeSubmission {
  id: string
  challengeId: string
  title: string
  creator: string
  description: string
  thumbnailUrl: string
  votes: number
  createdAt: string
  shortlisted?: boolean
  winner?: boolean
}

export const filmChallenges: FilmChallenge[] = [
  {
    id: "cyberpunk-noir",
    title: "Cyberpunk Noir",
    description: "Create a rain-soaked city mystery driven by reflections, silhouettes, and one impossible clue.",
    themeImageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455a?auto=format&fit=crop&w=1600&q=85",
    status: "Open",
    deadline: "2026-06-17T18:00:00.000Z",
    prizeCredits: 1200,
    prizePlacement: "Featured Gallery premiere",
    participantCount: 248
  },
  {
    id: "nature-documentary",
    title: "Nature Documentary",
    description: "Tell a five-minute ecological story with a narrator, an observed subject, and one cinematic reveal.",
    themeImageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=85",
    status: "Voting",
    deadline: "2026-06-10T18:00:00.000Z",
    prizeCredits: 900,
    prizePlacement: "Homepage showcase",
    participantCount: 183,
    winnerTitle: "Glass Gardens"
  },
  {
    id: "retro-future",
    title: "Retro Future",
    description: "Imagine tomorrow through yesterday's design language: chrome, analog displays, and impossible optimism.",
    themeImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=85",
    status: "Judging",
    deadline: "2026-06-08T18:00:00.000Z",
    prizeCredits: 800,
    prizePlacement: "Jury spotlight",
    participantCount: 156,
    winnerTitle: "Chrome Hearts"
  },
  {
    id: "silent-horror",
    title: "Silent Horror",
    description: "Build dread without dialogue: blocking, negative space, sound design, and one unforgettable final frame.",
    themeImageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=85",
    status: "Closed",
    deadline: "2026-05-30T18:00:00.000Z",
    prizeCredits: 1000,
    prizePlacement: "Challenge archive lead",
    participantCount: 311,
    winnerTitle: "Echo Chamber"
  }
]

export const challengeSubmissions: ChallengeSubmission[] = [
  {
    id: "sub-rain-protocol",
    challengeId: "cyberpunk-noir",
    title: "Rain Protocol",
    creator: "Maya D.",
    description: "A detective finds coded weather reports painted onto taxi windows.",
    thumbnailUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455a?auto=format&fit=crop&w=800&q=80",
    votes: 348,
    createdAt: "2026-06-06T14:00:00.000Z",
    shortlisted: true
  },
  {
    id: "sub-black-terminal",
    challengeId: "cyberpunk-noir",
    title: "Black Terminal",
    creator: "Arun K.",
    description: "A station announcer realizes every delayed train is carrying the same passenger.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
    votes: 292,
    createdAt: "2026-06-05T11:00:00.000Z"
  },
  {
    id: "sub-glass-gardens",
    challengeId: "nature-documentary",
    title: "Glass Gardens",
    creator: "Nora V.",
    description: "A cloud greenhouse preserves extinct plant memories as living light.",
    thumbnailUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
    votes: 641,
    createdAt: "2026-06-03T10:00:00.000Z",
    shortlisted: true,
    winner: true
  },
  {
    id: "sub-moss-radio",
    challengeId: "nature-documentary",
    title: "Moss Radio",
    creator: "Lena S.",
    description: "A field recordist hears a forest broadcasting warnings through fungus.",
    thumbnailUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
    votes: 506,
    createdAt: "2026-06-02T09:00:00.000Z",
    shortlisted: true
  },
  {
    id: "sub-chrome-hearts",
    challengeId: "retro-future",
    title: "Chrome Hearts",
    creator: "Iris P.",
    description: "Synthetic performers turn an abandoned theater into a liberation broadcast.",
    thumbnailUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    votes: 419,
    createdAt: "2026-05-29T16:00:00.000Z",
    shortlisted: true,
    winner: true
  },
  {
    id: "sub-orbit-kitchen",
    challengeId: "retro-future",
    title: "Orbit Kitchen",
    creator: "Theo M.",
    description: "A family dinner rotates through a chrome apartment above a painted Earth.",
    thumbnailUrl: "https://images.unsplash.com/photo-1447433819943-74a20887a81e?auto=format&fit=crop&w=800&q=80",
    votes: 287,
    createdAt: "2026-05-28T12:00:00.000Z"
  },
  {
    id: "sub-echo-chamber",
    challengeId: "silent-horror",
    title: "Echo Chamber",
    creator: "Sal R.",
    description: "A sound stage replays testimony until the walls learn how to accuse.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    votes: 733,
    createdAt: "2026-05-22T17:00:00.000Z",
    shortlisted: true,
    winner: true
  },
  {
    id: "sub-blue-door",
    challengeId: "silent-horror",
    title: "The Blue Door",
    creator: "June H.",
    description: "A painter refuses to open the only door that keeps appearing in finished portraits.",
    thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    votes: 612,
    createdAt: "2026-05-21T15:00:00.000Z",
    shortlisted: true
  }
]

export interface SubmissionInput {
  challengeId: string
  projectName: string
  title: string
  description: string
  thumbnailUrl: string
}

export interface ChallengesStore {
  selectedChallengeId: string
  submissionModalChallengeId: string | null
  submissions: ChallengeSubmission[]
  votedSubmissionIds: string[]
  submittedChallengeIds: string[]
  sortMode: ChallengeSortMode
  setSelectedChallenge: (challengeId: string) => void
  openSubmissionModal: (challengeId: string) => void
  closeSubmissionModal: () => void
  submitProject: (input: SubmissionInput) => void
  upvoteSubmission: (submissionId: string) => void
  setSortMode: (sortMode: ChallengeSortMode) => void
}

export const useChallengesStore = create<ChallengesStore>((set) => ({
  selectedChallengeId: "cyberpunk-noir",
  submissionModalChallengeId: null,
  submissions: challengeSubmissions,
  votedSubmissionIds: [],
  submittedChallengeIds: [],
  sortMode: "Most Voted",
  setSelectedChallenge: (challengeId) => set({ selectedChallengeId: challengeId }),
  openSubmissionModal: (challengeId) => set({ submissionModalChallengeId: challengeId }),
  closeSubmissionModal: () => set({ submissionModalChallengeId: null }),
  submitProject: (input) =>
    set((state) => {
      if (state.submittedChallengeIds.includes(input.challengeId)) return { submissionModalChallengeId: null }
      const submission: ChallengeSubmission = {
        id: `local-${input.challengeId}-${Date.now()}`,
        challengeId: input.challengeId,
        title: input.title.trim() || input.projectName,
        creator: "You",
        description: input.description.trim() || "A local demo submission prepared from the current project.",
        thumbnailUrl: input.thumbnailUrl,
        votes: 1,
        createdAt: new Date().toISOString()
      }
      return {
        submissions: [submission, ...state.submissions],
        submittedChallengeIds: [...state.submittedChallengeIds, input.challengeId],
        submissionModalChallengeId: null
      }
    }),
  upvoteSubmission: (submissionId) =>
    set((state) => {
      if (state.votedSubmissionIds.includes(submissionId)) return state
      return {
        votedSubmissionIds: [...state.votedSubmissionIds, submissionId],
        submissions: state.submissions.map((submission) =>
          submission.id === submissionId ? { ...submission, votes: submission.votes + 1 } : submission
        )
      }
    }),
  setSortMode: (sortMode) => set({ sortMode })
}))
