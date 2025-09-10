
import { GoogleGenAI } from "@google/genai";
import type { GenerationParams } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateVideoFromImageAndText = async (params: GenerationParams): Promise<string> => {
  const { prompt, image, quality, aspectRatio } = params;

  const fullPrompt = `
    Based on the provided image, create a dynamic and engaging video ad.
    Prompt: "${prompt}"
    Ensure the final video has a professional, cinematic quality.
    The video must be rendered in ${quality} resolution.
  `;

  try {
    console.log("Starting video generation with config:", { quality, aspectRatio });
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: fullPrompt,
      image: {
        imageBytes: image.base64,
        mimeType: image.mimeType,
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
      }
    });

    console.log("Operation started. Polling for results...");
    
    // Poll for the result
    while (!operation.done) {
      console.log("Still processing... checking again in 10 seconds.");
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before polling again
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    console.log("Video generation complete.");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video generation succeeded, but no download link was provided.");
    }
    
    const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
    
    const videoResponse = await fetch(finalUrl);
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video from the generated link. Status: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    const blobUrl = URL.createObjectURL(videoBlob);

    return blobUrl;

  } catch (error) {
    console.error("Error generating video:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate video: ${error.message}`);
    }
    throw new Error("An unknown error occurred during video generation.");
  }
};


export const generateVoiceoverScript = async (prompt: string): Promise<string> => {
  try {
    console.log("Generating voiceover script for prompt:", prompt);
    const systemInstruction = "You are a creative director for an advertising agency. Based on the following video ad concept, write a short, compelling voiceover script of 2-3 sentences. The script should be engaging and directly related to the concept. Only output the script text, without any labels, introductory phrases, or quotation marks.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Video concept: "${prompt}"`,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const script = response.text.trim();
    console.log("Generated script:", script);
    return script;
  } catch (error) {
    console.error("Error generating voiceover script:", error);
    // Don't throw an error, just return a fallback message so the video can still be shown.
    return "Could not generate a script at this time. Please try again.";
  }
};
