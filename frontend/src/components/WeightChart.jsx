import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { api } from '../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-cyan-900 rounded-lg p-2 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-cyan-400 font-bold">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export default function WeightChart({ compact = false }) {
  const [data, setData] = useState([]);
  const [milestones, setMilestones] = useState(null);

  useEffect(() => {
    async function load() {
      const [logs, ms] = await Promise.all([api.getWeightLogs(30), api.getWeightMilestones()]);
      const chartData = logs.map(l => ({
        date: l.date.slice(5),  // MM-DD
        weight: l.weight,
      }));
      setData(chartData);
      setMilestones(ms);
    }
    load().catch(console.error);
  }, []);

  const goalWeight = milestones?.goal_weight || 70;
  const currentWeight = milestones?.current_weight;
  const startWeight = milestones?.start_weight;
  const lost = milestones?.total_lost || 0;
  const remaining = milestones?.remaining || 0;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      {milestones && (
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="text-lg font-bold text-white font-mono">{startWeight}kg</div>
            <div className="text-xs text-gray-500">Started</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-900/50 border border-cyan-900/50">
            <div className="text-lg font-bold text-cyan-400 font-mono">{currentWeight}kg</div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-900/50 border border-gray-800">
            <div className="text-lg font-bold text-purple-400 font-mono">{goalWeight}kg</div>
            <div className="text-xs text-gray-500">Goal</div>
          </div>
        </div>
      )}

      {/* Progress */}
      {milestones && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-green-400 font-mono">-{lost}kg lost 🔥</span>
          <span className="text-orange-400 font-mono">{remaining}kg to go ⚔️</span>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: compact ? 160 : 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a3e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={goalWeight} stroke="#7c3aed" strokeDasharray="4 4"
              label={{ value: 'GOAL', fill: '#7c3aed', fontSize: 11, position: 'right' }} />
            <Line
              type="monotone" dataKey="weight" stroke="#00d4ff"
              strokeWidth={2} dot={false}
              activeDot={{ r: 5, fill: '#00d4ff', stroke: '#0a0a1a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
