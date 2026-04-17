interface AvatarProps {
  name: string;
  picture?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'ds-avatar-sm',
  md: 'ds-avatar-md',
  lg: 'ds-avatar-lg',
  xl: 'ds-avatar-xl',
};

export default function Avatar({ name, picture, size, className }: AvatarProps) {
  const sizeCls = size ? SIZE_CLASS[size] : '';
  const cls = `ds-avatar ${sizeCls} ${className ?? ''}`.trim();
  if (picture) {
    return <img className={cls} src={picture} alt={name} />;
  }
  const initial = (name ?? '?').trim().slice(0, 1) || '?';
  return (
    <span className={`${cls} ds-avatar-fallback`} aria-label={name}>
      {initial}
    </span>
  );
}
