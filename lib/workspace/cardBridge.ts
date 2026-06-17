import type {
  ActionCard,
  Character,
  StyleCard,
  UserCard,
  GenerationLibraryType
} from "@/lib/types"

/**
 * Convert a saved Storyboard UserCard into the corresponding project-store type
 * (StyleCard / Character / ActionCard) so it appears in the Workspace node dropdowns.
 *
 * The Storyboard store keeps UserCards (a generic shape: name, description, images).
 * The project store keeps typed cards (StyleCard with mood/palette, Character with
 * role/emotions, ActionCard with beat/subject/action). This bridge converts the
 * generic UserCard into the typed shape so the Workspace nodes can read from a
 * single source of truth (the project store).
 *
 * For card types that don't have a direct project-store equivalent (e.g. "storyboard"
 * type UserCards), we return null — those stay in the storyboard store only.
 */
export function convertUserCardToProjectCard(
  userCard: UserCard,
  type: GenerationLibraryType
): StyleCard | Character | ActionCard | null {
  const firstImage = userCard.images[0]?.imageUrl ?? ""
  const allImageUrls = userCard.images.map((img) => img.imageUrl).filter(Boolean)
  const baseId = `sb-${userCard.id}` // prefix to avoid collisions with demo data IDs

  if (type === "style") {
    const styleCard: StyleCard = {
      id: baseId,
      name: userCard.name,
      description: userCard.description,
      referenceImages: allImageUrls,
      generatedImages: allImageUrls.length > 0 ? allImageUrls : [firstImage],
      keywords: [], // UserCards don't carry keywords; the user can edit later
      mood: "User-defined",
      palette: [],
      primaryReference: firstImage || undefined
    }
    return styleCard
  }

  if (type === "character") {
    const character: Character = {
      id: baseId,
      name: userCard.name,
      role: "User-defined",
      description: userCard.description,
      emotions: ["Neutral"],
      portraitUrls: allImageUrls.length > 0 ? allImageUrls : [firstImage],
      styleCardIds: []
    }
    return character
  }

  // "storyboard" type UserCards don't have a project-store equivalent — they stay
  // in the storyboard store only. Return null so the caller knows to skip.
  return null
}

/**
 * Build an ActionCard from a UserCard. Called when the user saves a card with
 * the "storyboard" type but we want it accessible as an Action in the workspace.
 * (Action Cards in the workspace represent dramatic beats — closest match to a
 * saved storyboard frame's narrative intent.)
 *
 * NOTE: This is opt-in. The caller decides whether to also create an ActionCard.
 */
export function convertUserCardToActionCard(userCard: UserCard): ActionCard {
  return {
    id: `sb-action-${userCard.id}`,
    title: userCard.name,
    beat: userCard.description,
    subject: "User-defined",
    action: "See saved card for details",
    emotion: "User-defined"
  }
}
