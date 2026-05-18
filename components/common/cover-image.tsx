import Image from "next/image";

export function CoverImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "100vw"
}: {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) return null;

  return (
    <Image
      fill
      alt={alt}
      src={src}
      unoptimized
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
