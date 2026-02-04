import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function EmotionRadarChart({ emotionData }) {
  if (!emotionData || emotionData.length === 0) {
    return null;
  }

  // Take top 8 emotions with highest scores
  const topEmotions = emotionData
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(emotion => ({
      emotion: emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1),
      score: Math.round(emotion.score * 100)
    }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={topEmotions}>
          <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
          <PolarAngleAxis 
            dataKey="emotion" 
            tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: 'rgba(148, 163, 184, 0.6)', fontSize: 10 }}
          />
          <Radar 
            name="Emotion Intensity" 
            dataKey="score" 
            stroke="rgba(245, 158, 11, 0.8)" 
            fill="rgba(245, 158, 11, 0.3)" 
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}