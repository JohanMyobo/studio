"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getCurrentEntityId } from "@/lib/entity";
import { getEntity } from "@/lib/actions/entities";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_GUIDELINES: Record<string, string> = {
  linkedin: "LinkedIn : 1300-1800 caractères max, sauts de ligne pour aérer, accroche forte sur la première ligne (pas de spoiler), 3-5 hashtags pertinents à la fin.",
  twitter: "Twitter/X : 280 caractères max, percutant et direct, 1-2 hashtags max.",
  instagram: "Instagram : 150-300 mots, emojis avec parcimonie, 5-10 hashtags à la fin.",
  facebook: "Facebook : 100-250 mots, ton naturel et conversationnel, question ou call-to-action en fin de post.",
  tiktok: "TikTok : script pour vidéo courte (60 secondes max), accroche dans les 3 premières secondes.",
};

const TONE_GUIDELINES: Record<string, string> = {
  professional: "Ton professionnel et expert.",
  casual: "Ton décontracté et accessible.",
  storytelling: "Raconte une histoire, utilise la narration.",
  educational: "Ton pédagogique, apporte de la valeur concrète.",
  promotional: "Ton promotionnel mais authentique, met en avant les bénéfices.",
};

type VoiceData = {
  style?: string;
  avoid?: string;
  examples?: string;
};

type SelectedAsset = {
  id: string;
  name: string;
  type: string;
  url: string;
};

type GeneratePostParams = {
  title: string;
  platform: string;
  tone?: string | null;
  projectName: string;
  projectDescription?: string | null;
  assets?: { name: string; type: string }[];
  selectedAssets?: SelectedAsset[];
  userPrompt?: string;
};

async function fetchAssetContent(asset: SelectedAsset): Promise<string | null> {
  if (!["text", "doc", "pdf"].includes(asset.type)) return null;
  try {
    const res = await fetch(asset.url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 8000);
  } catch {
    return null;
  }
}

function buildVoiceBlock(voice: VoiceData): string {
  const parts: string[] = [];
  if (voice.style?.trim()) {
    parts.push(`**Mon style d'écriture :** ${voice.style.trim()}`);
  }
  if (voice.avoid?.trim()) {
    parts.push(`**Expressions et tournures à BANNIR absolument (ne jamais utiliser) :** ${voice.avoid.trim()}`);
  }
  if (voice.examples?.trim()) {
    parts.push(`**Exemple de post qui représente bien mon style (inspire-toi de la forme, du ton, du rythme) :**\n${voice.examples.trim()}`);
  }
  return parts.join("\n\n");
}

export async function generatePostContent(params: GeneratePostParams): Promise<string> {
  const {
    title, platform, tone, projectName, projectDescription,
    assets, selectedAssets, userPrompt,
  } = params;

  // Fetch author's voice/style from their entity
  let voiceBlock = "";
  try {
    const entityId = await getCurrentEntityId();
    if (entityId) {
      const entity = await getEntity(entityId);
      const raw = (entity as any)?.voice;
      if (raw) {
        const parsed: VoiceData = JSON.parse(raw);
        voiceBlock = buildVoiceBlock(parsed);
      }
    }
  } catch {
    // Voice is optional — continue without it
  }

  const platformGuide = PLATFORM_GUIDELINES[platform] ?? "Rédige un post adapté à la plateforme.";
  const toneGuide = tone ? TONE_GUIDELINES[tone] ?? "" : "";

  // Build asset context
  let assetContext = "";
  if (selectedAssets && selectedAssets.length > 0) {
    const assetSections: string[] = [];
    for (const asset of selectedAssets) {
      const content = await fetchAssetContent(asset);
      if (content) {
        assetSections.push(`### ${asset.name}\n${content}`);
      } else {
        assetSections.push(`### ${asset.name} (${asset.type}) — fichier visuel`);
      }
    }
    assetContext = `**Contenu des assets sélectionnés :**\n${assetSections.join("\n\n")}`;
  } else if (assets && assets.length > 0) {
    assetContext = `Assets du projet : ${assets.map((a) => `${a.name} (${a.type})`).join(", ")}.`;
  }

  const prompt = `Tu ghostécris un post pour quelqu'un. Adopte exactement sa voix — tu n'es pas un copywriter générique.

${voiceBlock ? `---\n## VOIX DE L'AUTEUR\n${voiceBlock}\n---\n` : ""}
**Plateforme :** ${platform.charAt(0).toUpperCase() + platform.slice(1)}
**Projet :** ${projectName}${projectDescription ? ` — ${projectDescription}` : ""}
**Sujet :** ${title}
${toneGuide ? `**Ton :** ${toneGuide}` : ""}
${assetContext ? `\n${assetContext}` : ""}
${userPrompt ? `\n**Instructions spécifiques :** ${userPrompt}` : ""}

**Format requis :**
${platformGuide}

Génère uniquement le contenu du post. Pas d'introduction, pas de commentaire, pas de guillemets autour. Commence directement par le post.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
