import { create } from "zustand"

export interface GalleryVideo {
  id: string
  title: string
  synopsis: string
  thumbnailUrl: string
  heroImageUrl: string
  duration: string
  genres: string[]
  year: string
  model: "Seedance 2.0" | "Kling" | "Ray 3.14" | "Modify"
  resolution: "480p" | "720p" | "1080p"
  characterTags: string[]
  styleName: string
  rows: Array<"continue" | "top" | "generated" | "winners" | "recent">
}

export const galleryVideos: GalleryVideo[] = [
  {
    id: "neon-drift",
    title: "Neon Drift",
    synopsis: "A getaway driver follows a phantom radio signal through rain-lit megacity tunnels. Each turn reveals another memory he never lived, and the final broadcast asks him to choose between escape and becoming the city's next myth.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "11m",
    genres: ["Cyberpunk", "Noir"],
    year: "2026",
    model: "Seedance 2.0",
    resolution: "1080p",
    characterTags: ["Driver", "Signal Girl", "Transit Cop"],
    styleName: "Neon Rain Noir",
    rows: ["continue", "top", "generated", "recent"]
  },
  {
    id: "the-last-signal",
    title: "The Last Signal",
    synopsis: "On a lunar relay station, a technician receives one impossible message from Earth after the planet has gone silent. The film folds isolation, duty, and faith into a tense chamber mystery built from long shadows and radio static.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "14m",
    genres: ["Sci-Fi", "Mystery"],
    year: "2026",
    model: "Kling",
    resolution: "1080p",
    characterTags: ["Relay Tech", "Archivist", "Mission Voice"],
    styleName: "Orbital Silence",
    rows: ["continue", "top", "winners"]
  },
  {
    id: "chrome-hearts",
    title: "Chrome Hearts",
    synopsis: "Two synthetic performers tour abandoned theaters while being hunted by the company that designed their emotions. Their final show turns into an act of rebellion staged in mirror, smoke, and hard white light.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "9m",
    genres: ["Drama", "Android"],
    year: "2025",
    model: "Ray 3.14",
    resolution: "720p",
    characterTags: ["Vera-9", "Milo-2", "Stage Manager"],
    styleName: "Chrome Melodrama",
    rows: ["top", "generated", "recent"]
  },
  {
    id: "void-walker",
    title: "Void Walker",
    synopsis: "A desert pilgrim crosses a salt planet at dawn with a black box that records futures instead of voices. Every step pulls the horizon closer until the landscape itself starts answering back.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "15m",
    genres: ["Cosmic", "Adventure"],
    year: "2026",
    model: "Seedance 2.0",
    resolution: "1080p",
    characterTags: ["Pilgrim", "Oracle Child", "Dust Cartographer"],
    styleName: "Solar Western",
    rows: ["top", "winners", "recent"]
  },
  {
    id: "solaris-eclipse",
    title: "Solaris Eclipse",
    synopsis: "A fashion house launches sunglasses that let wearers see emotional weather. When the first eclipse arrives, a model discovers the product has been forecasting a city-wide heartbreak.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "6m",
    genres: ["Fashion Film", "Sci-Fi"],
    year: "2026",
    model: "Modify",
    resolution: "720p",
    characterTags: ["Model", "Optics Founder", "Weather Girl"],
    styleName: "Blue Editorial",
    rows: ["continue", "generated", "winners"]
  },
  {
    id: "echo-chamber",
    title: "Echo Chamber",
    synopsis: "A courtroom built inside a sound stage replays testimony as living projections. The accused editor must cut together the truth before the room decides which version becomes permanent.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "12m",
    genres: ["Thriller", "Experimental"],
    year: "2025",
    model: "Kling",
    resolution: "1080p",
    characterTags: ["Editor", "Judge", "Witness Loop"],
    styleName: "Tungsten Trial",
    rows: ["top", "generated", "recent"]
  },
  {
    id: "glass-gardens",
    title: "Glass Gardens",
    synopsis: "In a greenhouse above the clouds, two archivists preserve extinct plants as holograms. Their quiet ritual changes when one digital seed starts growing outside the rules of the simulation.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "8m",
    genres: ["Eco Sci-Fi", "Romance"],
    year: "2026",
    model: "Ray 3.14",
    resolution: "720p",
    characterTags: ["Archivist Noor", "Archivist Vale", "Seed 04"],
    styleName: "Soft Biolumina",
    rows: ["continue", "generated", "recent"]
  },
  {
    id: "static-rain",
    title: "Static Rain",
    synopsis: "A teenage broadcaster in a flooded neighborhood turns storm drains into a pirate radio network. Her signal gathers strangers into a rescue plan before the water reaches the last transformer.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "10m",
    genres: ["Drama", "Disaster"],
    year: "2026",
    model: "Seedance 2.0",
    resolution: "1080p",
    characterTags: ["Broadcaster", "Line Worker", "Neighbor Kid"],
    styleName: "Storm Realism",
    rows: ["top", "winners", "recent"]
  },
  {
    id: "velvet-orbit",
    title: "Velvet Orbit",
    synopsis: "A nightclub in low orbit hosts one final set before deorbit. Between songs, the house singer negotiates with smugglers, lovers, and a station AI that refuses to end the night.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "13m",
    genres: ["Musical", "Space Noir"],
    year: "2025",
    model: "Kling",
    resolution: "1080p",
    characterTags: ["House Singer", "Station AI", "Smuggler"],
    styleName: "Velvet Noir",
    rows: ["continue", "top", "winners"]
  },
  {
    id: "iron-lullaby",
    title: "Iron Lullaby",
    synopsis: "A maintenance worker sings old folk songs to calm factory machines that have begun dreaming. The dreams become blueprints, and the factory asks to build something no one ordered.",
    thumbnailUrl: "/filmgen-reference/solaris-eclipse.png",
    heroImageUrl: "/filmgen-reference/solaris-eclipse.png",
    duration: "7m",
    genres: ["Industrial", "Fable"],
    year: "2026",
    model: "Modify",
    resolution: "720p",
    characterTags: ["Mechanic", "Factory Voice", "Apprentice"],
    styleName: "Rust & Hymn",
    rows: ["generated", "winners", "recent"]
  }
]

export interface GalleryStore {
  featuredIndex: number
  selectedVideoId: string | null
  playerVideoId: string | null
  addedVideoIds: string[]
  sharedVideoId: string | null
  setFeaturedIndex: (index: number) => void
  selectVideo: (videoId: string) => void
  closeDetail: () => void
  openPlayer: (videoId: string) => void
  closePlayer: () => void
  markAdded: (videoId: string) => void
  markShared: (videoId: string) => void
}

export const useGalleryStore = create<GalleryStore>((set) => ({
  featuredIndex: 0,
  selectedVideoId: null,
  playerVideoId: null,
  addedVideoIds: [],
  sharedVideoId: null,
  setFeaturedIndex: (index) => set({ featuredIndex: index }),
  selectVideo: (videoId) => set({ selectedVideoId: videoId }),
  closeDetail: () => set({ selectedVideoId: null }),
  openPlayer: (videoId) => set({ playerVideoId: videoId }),
  closePlayer: () => set({ playerVideoId: null }),
  markAdded: (videoId) =>
    set((state) => ({
      addedVideoIds: state.addedVideoIds.includes(videoId) ? state.addedVideoIds : [...state.addedVideoIds, videoId]
    })),
  markShared: (videoId) => set({ sharedVideoId: videoId })
}))
