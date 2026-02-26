import { drizzle } from "drizzle-orm/mysql2";
import { artistProfiles, bapAlbums, bapTracks, users } from "../../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const GENRES = [
  "Hip-Hop", "Pop", "Rock", "Electronic", "R&B", "Jazz",
  "Country", "Latin", "Indie", "Alternative", "Soul", "Funk"
];

const MOODS = [
  "energetic", "chill", "sad", "happy", "romantic", "aggressive",
  "melancholic", "uplifting", "dark", "peaceful"
];

// Diverse artist names across genres
const ARTISTS = [
  { name: "Luna Waves", genre: "Electronic", bio: "Ethereal soundscapes and driving beats" },
  { name: "Marcus Stone", genre: "Hip-Hop", bio: "Lyrical storyteller from Brooklyn" },
  { name: "The Midnight Riders", genre: "Rock", bio: "Classic rock revival with modern edge" },
  { name: "Aria Santos", genre: "Pop", bio: "Chart-topping pop sensation" },
  { name: "DJ Neon", genre: "Electronic", bio: "Bass-heavy electronic producer" },
  { name: "Jasmine Cole", genre: "R&B", bio: "Soulful vocals and smooth grooves" },
  { name: "The Blue Notes", genre: "Jazz", bio: "Contemporary jazz ensemble" },
  { name: "Tyler West", genre: "Country", bio: "Modern country with traditional roots" },
  { name: "Los Hermanos", genre: "Latin", bio: "Reggaeton and Latin trap pioneers" },
  { name: "Echo Park", genre: "Indie", bio: "Indie rock with shoegaze influences" },
  { name: "Nova Heart", genre: "Alternative", bio: "Alternative rock with electronic elements" },
  { name: "Soul Kitchen", genre: "Soul", bio: "Neo-soul collective" },
  { name: "Funkadelic Express", genre: "Funk", bio: "Groovy funk revival" },
  { name: "Violet Sky", genre: "Pop", bio: "Dreamy pop with indie sensibilities" },
  { name: "Razor Edge", genre: "Rock", bio: "Hard rock with metal influences" },
  { name: "Smooth Operator", genre: "Jazz", bio: "Smooth jazz saxophonist" },
  { name: "Beatsmith", genre: "Hip-Hop", bio: "Underground hip-hop producer" },
  { name: "Crystal Waters", genre: "Electronic", bio: "Ambient and downtempo producer" },
  { name: "The Honky Tonk Heroes", genre: "Country", bio: "Outlaw country band" },
  { name: "Salsa Fuego", genre: "Latin", bio: "High-energy salsa orchestra" },
];

// Track title templates by genre
const TRACK_TEMPLATES: Record<string, string[]> = {
  "Hip-Hop": [
    "Midnight Hustle", "City Lights", "Dreams & Schemes", "No Sleep", "Rise Up",
    "Golden Era", "Street Poetry", "Hustle Hard", "Victory Lap", "Crown"
  ],
  "Pop": [
    "Dancing in the Rain", "Summer Nights", "Heartbeat", "Neon Dreams", "Forever Young",
    "Starlight", "Electric Love", "Wildfire", "Paradise", "Shine Bright"
  ],
  "Rock": [
    "Thunder Road", "Rebel Heart", "Breaking Free", "Wild Nights", "Edge of Glory",
    "Storm Chaser", "Renegade", "Fire & Ice", "Last Stand", "Phoenix Rising"
  ],
  "Electronic": [
    "Pulse", "Neon Nights", "Digital Dreams", "Synthwave", "Afterglow",
    "Voltage", "Circuit Breaker", "Frequency", "Hyperspace", "Wavelength"
  ],
  "R&B": [
    "Slow Burn", "Velvet Touch", "Midnight Serenade", "Smooth Operator", "Love Language",
    "Silk & Soul", "Late Night Vibes", "Intimate Moments", "Sweet Surrender", "Desire"
  ],
  "Jazz": [
    "Blue Monday", "Autumn Leaves", "Moonlight Sonata", "Take Five", "Cool Breeze",
    "Satin Doll", "Misty", "Round Midnight", "Summertime", "All Blues"
  ],
  "Country": [
    "Whiskey & Wine", "Backroads", "Small Town Saturday", "Heartland", "Rodeo Nights",
    "Dusty Trails", "Honky Tonk Heart", "Country Roads", "Southern Comfort", "Bonfire"
  ],
  "Latin": [
    "Fuego", "Bailando", "Corazón", "Ritmo Caliente", "Noche Loca",
    "Sabor Latino", "Pasión", "Fiesta", "Caliente", "Mi Amor"
  ],
  "Indie": [
    "Fading Echoes", "Paper Planes", "Velvet Underground", "Cosmic Dust", "Daydream",
    "Wanderlust", "Melancholy", "Stardust", "Ethereal", "Reverie"
  ],
  "Alternative": [
    "Gravity", "Vertigo", "Paradigm", "Catalyst", "Entropy",
    "Resonance", "Spectrum", "Velocity", "Momentum", "Synthesis"
  ],
  "Soul": [
    "Soul Searching", "Inner Peace", "Spiritual Journey", "Deep Roots", "Soulful",
    "Groove Theory", "Funky Soul", "Soul Power", "Keep the Faith", "Testify"
  ],
  "Funk": [
    "Get Down", "Funky Town", "Groove Machine", "Super Freak", "Boogie Nights",
    "Funk Odyssey", "Get Up", "Shake It", "Funky Drummer", "Bass Line"
  ],
};

async function seed() {
  console.log("🎵 Starting BopAudio content seeding...");

  try {
    // Create users and artist profiles
    const artistData: Array<{ userId: number; artistId: number; name: string; genre: string }> = [];

    for (const artist of ARTISTS) {
      // Create user
      const [user] = await db.insert(users).values({
        openId: `test_${artist.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
        name: artist.name,
        email: `${artist.name.toLowerCase().replace(/\s+/g, ".")}@bopaudio.test`,
        role: "artist",
      });

      // Create artist profile
      const [profile] = await db.insert(artistProfiles).values({
        userId: user.insertId,
        stageName: artist.name,
        bio: artist.bio,
        genres: [artist.genre],
        verifiedStatus: Math.random() > 0.5, // 50% verified
        careerPhase: ["discovery", "development", "launch", "scale"][Math.floor(Math.random() * 4)] as any,
      });

      artistData.push({
        userId: user.insertId,
        artistId: profile.insertId,
        name: artist.name,
        genre: artist.genre,
      });

      console.log(`✅ Created artist: ${artist.name} (${artist.genre})`);
    }

    // Create albums and tracks
    let totalTracks = 0;
    let totalAlbums = 0;

    for (const artist of artistData) {
      const numAlbums = Math.floor(Math.random() * 3) + 1; // 1-3 albums per artist

      for (let i = 0; i < numAlbums; i++) {
        const albumType = ["single", "ep", "album"][Math.floor(Math.random() * 3)] as "single" | "ep" | "album";
        const tracksInAlbum = albumType === "single" ? 1 : albumType === "ep" ? Math.floor(Math.random() * 4) + 3 : Math.floor(Math.random() * 8) + 8;

        // Create album
        const [album] = await db.insert(bapAlbums).values({
          artistId: artist.artistId,
          title: `${artist.name} - ${albumType === "single" ? "Single" : albumType === "ep" ? "EP" : "Album"} ${i + 1}`,
          albumType,
          genre: artist.genre,
          releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in past year
          trackCount: tracksInAlbum,
          totalDuration: 0, // Will update after tracks
        });

        totalAlbums++;

        // Create tracks for this album
        const templates = TRACK_TEMPLATES[artist.genre] || TRACK_TEMPLATES["Pop"];
        let albumDuration = 0;

        for (let j = 0; j < tracksInAlbum; j++) {
          const trackTitle = templates[j % templates.length] + (j >= templates.length ? ` (${Math.floor(j / templates.length) + 1})` : "");
          const duration = Math.floor(Math.random() * 180) + 120; // 2-5 minutes
          albumDuration += duration;

          await db.insert(bapTracks).values({
            artistId: artist.artistId,
            albumId: album.insertId,
            title: trackTitle,
            artist: artist.name,
            duration,
            bpm: Math.floor(Math.random() * 80) + 80, // 80-160 BPM
            genre: artist.genre,
            mood: MOODS[Math.floor(Math.random() * MOODS.length)],
            audioUrl: `https://placeholder-audio.s3.amazonaws.com/${artist.name.replace(/\s+/g, "-").toLowerCase()}/${trackTitle.replace(/\s+/g, "-").toLowerCase()}.mp3`,
            artworkUrl: `https://via.placeholder.com/600x600?text=${encodeURIComponent(trackTitle)}`,
            audioFormat: "mp3",
            status: "live",
            playCount: Math.floor(Math.random() * 10000), // Random play count
            likeCount: Math.floor(Math.random() * 1000),
            repostCount: Math.floor(Math.random() * 500),
          });

          totalTracks++;
        }

        // Update album total duration
        await db.update(bapAlbums).set({ totalDuration: albumDuration }).where({ id: album.insertId } as any);
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`📊 Created:`);
    console.log(`   - ${artistData.length} artists`);
    console.log(`   - ${totalAlbums} albums`);
    console.log(`   - ${totalTracks} tracks`);
    console.log(`\n✅ BopAudio is ready to stream!`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
