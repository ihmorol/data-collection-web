export default function Skeleton({
    className = "",
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-[var(--radius-md)] bg-border-dark/50 ${className}`}
            {...props}
        />
    );
}
