import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tieu thuyet Audio",
    short_name: "AudioTruyen",
    description: "PWA nghe tieu thuyet audio tieng Viet.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#08111f",
    theme_color: "#08111f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
