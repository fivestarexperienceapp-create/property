import { agent, branding, site } from '../../config';
import { assetUrl } from '../../lib/media';
import { href } from '../../lib/router';
import { buttonClass } from '../ui/Button';
import { SafeImg } from '../ui/SafeImg';
import { ActionControl, useContactActions } from './ContactActions';

export function AgentAvatar({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'size-28 text-4xl' : 'size-16 text-2xl';
  if (agent.photo) {
    return <SafeImg src={assetUrl(agent.photo)} alt={`${agent.name}, ${agent.title}`} className={`${dims} rounded-full object-cover`} />;
  }
  return (
    <span
      role="img"
      aria-label={`${agent.name} monogram`}
      className={`${dims} font-display inline-flex shrink-0 items-center justify-center rounded-full bg-sage-strong font-semibold text-white ring-4 ring-sage-soft`}
    >
      {agent.initials}
    </span>
  );
}

/** Agent summary with contact actions, used on property pages. */
export function AgentCard({ propertyId, showProfileLink = true }: { propertyId?: string; showProfileLink?: boolean }) {
  const actions = useContactActions(propertyId);
  const direct = actions.filter((a) => a.key === 'call' || a.key === 'text' || a.key === 'email');
  const primary = actions.filter((a) => a.key === 'schedule' || a.key === 'ask');
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex items-center gap-4">
        <AgentAvatar />
        <div className="min-w-0">
          <p className="font-display text-2xl leading-tight">{agent.name}</p>
          <p className="text-sm text-muted">
            {agent.title} · {branding.brokerageName}
          </p>
          {site.demoMode && <p className="mt-0.5 text-xs text-muted italic">Fictional agent profile</p>}
        </div>
      </div>
      <p className="mt-5 text-[0.95rem] leading-relaxed text-muted">{agent.intro}</p>
      {agent.credentials && <p className="mt-2 text-xs text-muted">{agent.credentials}</p>}
      <div className="mt-6 grid gap-2">
        {primary.map((a, i) => (
          <ActionControl key={a.key} action={a} className={buttonClass(i === 0 ? 'primary' : 'secondary', 'md', 'w-full')} />
        ))}
      </div>
      {direct.length > 0 && (
        <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${direct.length}, minmax(0, 1fr))` }}>
          {direct.map((a) => (
            <ActionControl key={a.key} action={a} className={buttonClass('ghost', 'sm', 'w-full border border-line')} />
          ))}
        </div>
      )}
      {agent.contact.phoneDisplay && (
        <p className="mt-4 text-center text-xs text-muted">
          {agent.contact.phoneDisplay}
          {agent.contact.email ? ` · ${agent.contact.email}` : ''}
          {site.demoMode ? ' (placeholders)' : ''}
        </p>
      )}
      {showProfileLink && (
        <a href={href.agent()} className="mt-4 block text-center text-sm font-semibold text-sage-strong underline-offset-4 hover:underline">
          View {agent.name.split(' ')[0]}’s profile
        </a>
      )}
    </div>
  );
}
