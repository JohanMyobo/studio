"use server";

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_GUIDELINES: Record<string, string> = {
  linkedin: "LinkedIn : ton professionnel, 1500-2000 caractères max, utilise des sauts de ligne pour aérer, commence par une accroche forte, ajoute 3-5 hashtags pertinents à la fin.",
  twitter: "Twitter/X : 280 caractères max, percutant et direct, peut inclure 1-2 hashtags.",
  instagram: "Instagram : ton visuel et engageant, 150-300 mots, utilise des emojis avec parcimonie, 5-10 hashtags à la fin.",
  facebook: "Facebook : ton naturel et conversationnel, 100-250 mots, question ou call-to-action en fin de post.",
  tiktok: "TikTok : script pour vidéo courte (60 secondes max), accroche dans les 3 premières secondes, ton dynamique et jeune.",
};

const TONE_GUIDELINES: Record<string, string> = {
  professional: "Ton professionnel et expert.",
  casual: "Ton décontracté et accessible.",
  storytelling: "Raconte une histoire, utilise la narration.",
  educational: "Ton pédagogique, apporte de la valeur concrète.",
  promotional: "Ton promotionnel mais authentique, met en avant les bénéfices.",
};

type GeneratePostParams = {
  title: string;
  platform: string;
  tone?: string | null;
  projectName: string;
  projectDescription?: string | null;
  assets?: { name: string; type: string }[];
  userPrompt?: string;
};

export async function generatePostContent(params: GeneratePostParams): Promise<string> {
  const {
    title, platform, tone, projectName, projectDescription, assets, userPrompt,
  } = params;

  const platformGuide = PLATFORM_GUIDELINES[platform] ?? "Rédige un post adapté à la plateforme.";
  const toneGuide = tone ? TONE_GUIDELINES[tone] ?? "" : "";

  const assetContext = assets && assets.length > 0
    ? `\nAssets disponibles dans ce projet : ${assets.map((a) => `${a.name} (${a.type})`).join(", ")}.`
    : "";

  const prompt = `Tu es un expert en content marketing et copywriting.

Génère un post pour ${platform.charAt(0).toUpperCase() + platform.slice(1)}.

**Projet :** ${projectName}
${projectDescription ? `**Description du projet :** ${projectDescription}` : ""}
${assetContext}
**Sujet du post :** ${title}
${toneGuide ? `**Ton :** ${toneGuide}` : ""}
${userPrompt ? `**Instructions spécifiques :** ${userPrompt}` : ""}

**Règles de format :**
${platformGuide}

Génère uniquement le contenu du post, sans introduction ni commentaire. Commence directement par le post.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
