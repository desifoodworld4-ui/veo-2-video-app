
import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { OptionSelector } from './components/OptionSelector';
import { Loader } from './components/Loader';
import { VideoPlayer } from './components/VideoPlayer';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ArrowPathIcon } from './components/icons/ArrowPathIcon';
import { SpeakerWaveIcon } from './components/icons/SpeakerWaveIcon';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import { generateVideoFromImageAndText, generateVoiceoverScript } from './services/geminiService';
import { VideoQuality, AspectRatio, GenerationStatus } from './types';
import { VIDEO_QUALITIES, ASPECT_RATIOS, LOADING_MESSAGES } from './constants';
import type { MimeType } from './types';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<{ base64: string; mimeType: MimeType; } | null>(null);
  const [quality, setQuality] = useState<VideoQuality>(VideoQuality.HD_1080p);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SixteenToNine);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.Idle);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [voiceoverScript, setVoiceoverScript] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === GenerationStatus.Generating) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleImageUpload = useCallback((base64: string, mimeType: MimeType) => {
    setImage({ base64, mimeType });
  }, []);

  const handleSubmit = async () => {
    if (!prompt || !image) {
      setError('Please provide both an image and a text prompt.');
      return;
    }
    setError(null);
    setStatus(GenerationStatus.Generating);
    setVideoUrl(null);
    setVoiceoverScript(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    try {
      // Generate video and voiceover script in parallel
      const [videoResultUrl, scriptResult] = await Promise.all([
        generateVideoFromImageAndText({
          prompt,
          image,
          quality,
          aspectRatio,
        }),
        generateVoiceoverScript(prompt)
      ]);
      
      setVideoUrl(videoResultUrl);
      setVoiceoverScript(scriptResult);
      setStatus(GenerationStatus.Success);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during generation.');
      setStatus(GenerationStatus.Error);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setImage(null);
    setQuality(VideoQuality.HD_1080p);
    setAspectRatio(AspectRatio.SixteenToNine);
    setStatus(GenerationStatus.Idle);
    setError(null);
    setVideoUrl(null);
    setVoiceoverScript(null);
    setIsCopied(false);
  };

  const handleListen = () => {
    if (voiceoverScript && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(voiceoverScript);
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    if (voiceoverScript) {
      navigator.clipboard.writeText(voiceoverScript);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isFormDisabled = status === GenerationStatus.Generating;
  const canSubmit = prompt && image && !isFormDisabled;

  const renderSuccess = () => (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Your Video Ad is Ready!</h2>
      {videoUrl && <VideoPlayer src={videoUrl} />}
      
      {voiceoverScript && (
        <div className="mt-8 text-left bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">AI-Generated Voiceover Script</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{voiceoverScript}</p>
          <div className="flex items-center gap-4 mt-4">
            <button 
              onClick={handleListen}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              <SpeakerWaveIcon />
              Listen
            </button>
            <button 
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              <ClipboardIcon />
              {isCopied ? 'Copied!' : 'Copy Script'}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleReset}
        className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <ArrowPathIcon />
        Create Another Video
      </button>
    </div>
  );

  const renderForm = () => (
     <div className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl space-y-8">
        <ImageUploader onImageUpload={handleImageUpload} disabled={isFormDisabled} />
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
            Ad Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cinematic shot of a futuristic car driving through a neon-lit city at night."
            rows={4}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none disabled:opacity-50"
            disabled={isFormDisabled}
          />
        </div>
        
        <OptionSelector
          label="Video Quality"
          options={VIDEO_QUALITIES}
          selectedValue={quality}
          onChange={(val) => setQuality(val as VideoQuality)}
          disabled={isFormDisabled}
        />

        <OptionSelector
          label="Aspect Ratio"
          options={ASPECT_RATIOS}
          selectedValue={aspectRatio}
          onChange={(val) => setAspectRatio(val as AspectRatio)}
          disabled={isFormDisabled}
        />

        {error && <p className="text-red-400 text-center font-medium">{error}</p>}
        
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          <SparklesIcon />
          Generate Video
        </button>
      </div>
  );

  const renderContent = () => {
    switch (status) {
      case GenerationStatus.Generating:
        return <Loader message={loadingMessage} />;
      case GenerationStatus.Success:
        return renderSuccess();
      default:
        return renderForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">
          AI Video Ad Generator
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Turn your images and ideas into high-quality video ads in seconds.
        </p>
      </div>
      {renderContent()}
    </div>
  );
};

export default App;
