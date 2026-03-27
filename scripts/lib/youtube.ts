export interface YouTubeVideo {
  tip: "youtube";
  videoId: string;
  baslik: string;
  kanal: string;
  aciklama: string;
  yayinTarihi: string;
  url: string;
  thumbnail: string;
}

export async function youtubeAra(
  sorgu: string,
  apiKey: string,
  sonGunSayisi = 7,
  maxSonuc = 5
): Promise<YouTubeVideo[]> {
  const yayinlandiSonra = new Date(
    Date.now() - sonGunSayisi * 24 * 60 * 60 * 1000
  ).toISOString();

  const params = new URLSearchParams({
    part: "snippet",
    q: sorgu,
    type: "video",
    maxResults: String(maxSonuc),
    key: apiKey,
    relevanceLanguage: "tr",
    order: "date",
    publishedAfter: yayinlandiSonra,
    videoDuration: "medium",
  });

  try {
    console.log(`  → YouTube: "${sorgu}" aranıyor...`);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    if (!res.ok) {
      const hata = await res.json();
      throw new Error(
        `YouTube API ${res.status}: ${(hata as { error?: { message?: string } }).error?.message}`
      );
    }

    const data = await res.json() as {
      items?: Array<{
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          description: string;
          publishedAt: string;
          thumbnails?: { high?: { url: string } };
        };
      }>;
    };

    return (data.items || []).map((item) => ({
      tip: "youtube" as const,
      videoId: item.id.videoId,
      baslik: item.snippet.title,
      kanal: item.snippet.channelTitle,
      aciklama: item.snippet.description.slice(0, 500),
      yayinTarihi: item.snippet.publishedAt.split("T")[0],
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.high?.url || "",
    }));
  } catch (err) {
    console.warn(`  ✗ YouTube hatası ("${sorgu}"):`, (err as Error).message);
    return [];
  }
}
