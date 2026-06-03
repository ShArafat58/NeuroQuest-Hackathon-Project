// lib/rank.ts
export type Rank = {
    name: string;       // Bangla rank name
    nameEn: string;
    color: string;      // text color
    bg: string;         // badge background
};

export function getRank(xp: number): Rank {
    if (xp >= 3000) {
        return { name: "মহাবীর", nameEn: "Mahabir", color: "#92400E", bg: "#FEF3C7" };   // gold
    }
    if (xp >= 1500) {
        return { name: "বীর", nameEn: "Bir", color: "#3C3489", bg: "#EEF0FF" };          // purple
    }
    if (xp >= 500) {
        return { name: "যোদ্ধা", nameEn: "Joddha", color: "#185FA5", bg: "#E6F1FB" };     // blue
    }
    return { name: "নবীন", nameEn: "Nobin", color: "#5F5E5A", bg: "#F1EFE8" };          // gray
}

// XP needed to reach the next rank (for an optional progress bar later)
export function nextRankXp(xp: number): number | null {
    if (xp >= 3000) return null;     // max rank
    if (xp >= 1500) return 3000;
    if (xp >= 500) return 1500;
    return 500;
}