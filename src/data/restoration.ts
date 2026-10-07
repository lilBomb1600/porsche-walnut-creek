/**
 * The store's restoration challenge: technician Boden brings back a 1999 Boxster, in seven episodes from the store's
 * own Instagram series. Episode notes describe what's on screen; Instagram end cards are trimmed off.
 */

export type Episode = {
  n: number;
  title: string;
  note: string;
  src: string;
  poster: string;
  thumb: string;
  /** seconds */
  duration: number;
};

const ep = (n: number, title: string, note: string, duration: number): Episode => ({
  n,
  title,
  note,
  src: `/media/restoration/ep${n}.mp4`,
  poster: `/media/restoration/ep${n}.jpg`,
  thumb: `/media/restoration/ep${n}-thumb.jpg`,
  duration,
});

export const restoration = {
  technician: "Boden",
  car: { year: 1999, model: "Boxster", generation: "986", miles: 56536 },
  episodes: [
    ep(1, "Meet the car", "Boden introduces the Boxster and walks around it on the lift.", 35.1),
    ep(2, "The walkaround", "A closer look at the paint, the wheels and the cabin it came in with.", 28),
    ep(3, "Into the bay", "The car rolls into the shop and the soft top goes through its paces.", 37.5),
    ep(4, "Suspension and brakes", "New coilovers and cross-drilled brake rotors go on.", 44.3),
    ep(5, "Seats out", "The seats come out for the work on the cabin.", 34.7),
    ep(6, "Houndstooth and an Aero exhaust", "Houndstooth seat inserts, new pedals and an Aero exhaust.", 40.8),
    ep(7, "The reveal", "The finished car in the sun: bronze wheels, hood stripes and the houndstooth cabin.", 180.8),
  ] satisfies Episode[],
};
