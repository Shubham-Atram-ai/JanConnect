import { useState } from 'react';
import { Pencil, Check, X, Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ChallengeAnalysis } from '../services/challengeService';

interface AIReviewCardProps {
  analysis: ChallengeAnalysis;
  editedValues: AIEditState;
  onChange: (field: keyof AIEditState, value: string | string[]) => void;
}

export interface AIEditState {
  title: string;
  summary: string;
  domain: string;
  subdomain: string;
  problemType: string;
  requiredSkills: string[];
  tags: string[];
  affectedPopulation: string;
}

const ALLOWED_DOMAINS = [
  'Education', 'Healthcare', 'Agriculture', 'Water', 'Sanitation',
  'Environment', 'Accessibility', 'Infrastructure', 'Public Services', 'Energy',
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  if (confidence >= 0.75) {
    return (
      <span className="flex items-center gap-1 text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" /> {pct}% confidence
      </span>
    );
  }
  if (confidence >= 0.5) {
    return (
      <span className="flex items-center gap-1 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-3 h-3" /> {pct}% — please review
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> {pct}% — please verify all fields
    </span>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  type?: 'text' | 'select';
  options?: string[];
  confidence?: number;
}

function EditableField({ label, value, onSave, multiline, type = 'text', options, confidence }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const isLowConfidence = confidence !== undefined && confidence < 0.5;

  return (
    <div className={`group rounded-xl p-4 border transition-all ${
      editing
        ? 'bg-blue-500/5 border-blue-500/30'
        : isLowConfidence
        ? 'bg-amber-500/5 border-amber-500/20'
        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {!editing && (
          <button
            onClick={() => { setDraft(value); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-all"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          {type === 'select' && options ? (
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
            >
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : multiline ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Check className="w-3 h-3" /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white text-sm leading-relaxed">{value || <span className="text-slate-500 italic">Not specified</span>}</p>
      )}
    </div>
  );
}

interface TagsEditorProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagsEditor({ label, tags, onChange }: TagsEditorProps) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
    setAdding(false);
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 rounded-xl p-4 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="group/tag flex items-center gap-1 bg-slate-700/50 border border-slate-600/50 text-slate-300 text-xs px-2.5 py-1 rounded-full">
            {tag}
            <button onClick={() => remove(tag)} className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover/tag:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {adding && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }}
            onBlur={add}
            placeholder="new-tag"
            className="bg-slate-700 border border-blue-500/50 text-white text-xs px-2 py-1 rounded-full w-24 focus:outline-none"
            autoFocus
          />
        )}
        {tags.length === 0 && !adding && (
          <span className="text-slate-500 text-xs italic">No tags added</span>
        )}
      </div>
    </div>
  );
}

export default function AIReviewCard({ analysis, editedValues, onChange }: AIReviewCardProps) {
  const { confidence, isFallback, provider } = analysis;

  return (
    <div className="space-y-4">
      {/* AI Attribution Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <Bot className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-blue-300 text-sm font-semibold">AI-generated analysis</p>
            <ConfidenceBadge confidence={confidence} />
          </div>
          <p className="text-blue-300/60 text-xs mt-1">
            Please review every field carefully. You can edit any field before submitting.
            {isFallback && ' (Fallback analysis — AI could not fully process input)'}
          </p>
        </div>
      </div>

      {confidence < 0.5 && (
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-xs">
            AI confidence is low. Fields marked with low confidence may be inaccurate. Please review and correct them.
          </p>
        </div>
      )}

      {/* Editable Fields */}
      <div className="space-y-3">
        <EditableField
          label="Title"
          value={editedValues.title}
          onSave={(v) => onChange('title', v)}
          confidence={confidence}
        />
        <EditableField
          label="Summary"
          value={editedValues.summary}
          onSave={(v) => onChange('summary', v)}
          multiline
          confidence={confidence}
        />
        <div className="grid grid-cols-2 gap-3">
          <EditableField
            label="Domain"
            value={editedValues.domain}
            onSave={(v) => onChange('domain', v)}
            type="select"
            options={ALLOWED_DOMAINS}
          />
          <EditableField
            label="Subdomain"
            value={editedValues.subdomain}
            onSave={(v) => onChange('subdomain', v)}
          />
        </div>
        <EditableField
          label="Problem Type"
          value={editedValues.problemType}
          onSave={(v) => onChange('problemType', v)}
        />
        <TagsEditor
          label="Required Expertise"
          tags={editedValues.requiredSkills}
          onChange={(v) => onChange('requiredSkills', v)}
        />
        <TagsEditor
          label="Tags"
          tags={editedValues.tags}
          onChange={(v) => onChange('tags', v)}
        />
        <EditableField
          label="Affected Population"
          value={editedValues.affectedPopulation}
          onSave={(v) => onChange('affectedPopulation', v)}
        />
      </div>

      <p className="text-slate-600 text-xs text-center">Provider: {provider} · Original AI output preserved in database</p>
    </div>
  );
}
