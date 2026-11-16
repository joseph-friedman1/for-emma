export type RoomId = string;

export type Room = {
  id: RoomId;
  title: string;
  subtitle: string;
  position: [number, number, number];
  side: "left" | "right" | "center";
};

export type Memory = {
  id: string;
  room: RoomId;
  title: string;
  date: string;
  category: "dates" | "trips" | "funny" | "everyday";
  caption: string;
  description: string;
  image: string;
};

export const relationshipStart = "2024-05-11";

export const rooms: Room[] = [
  { id: "entrance", title: "The Entrance", subtitle: "A little place I made for us", position: [0, 0, 3], side: "center" },
  { id: "beginning", title: "Where It All Started", subtitle: "The beginning of our story", position: [-15, 0, -16], side: "left" },
  { id: "memories", title: "Our Favorite Memories", subtitle: "Some of our favorite moments", position: [15, 0, -32], side: "right" },
  { id: "little-things", title: "The Little Things", subtitle: "", position: [-15, 0, -48], side: "left" },
  { id: "timeline", title: "Things I Love About You", subtitle: "A few of the many things I adore about you", position: [15, 0, -64], side: "right" },
  { id: "apology", title: "The Apology Room", subtitle: "A quiet place for the truth", position: [-15, 0, -80], side: "left" },
  { id: "future", title: "Our Future", subtitle: "Still looking forward, together", position: [15, 0, -96], side: "right" },
];

export const memories: Memory[] = [
  {
    id: "first-visit",
    room: "beginning",
    title: "The first time I came over to your house for Ava's bed party",
    date: "Ava's bed party",
    category: "dates",
    caption: "The first time I came over to your house for Ava's bed party.",
    description: "My first time coming over to your house for Ava's bed party.",
    image: "/assets/ava-bed-party.jpg",
  },
  {
    id: "first-yama-dinner",
    room: "beginning",
    title: "Our first dinner at Yama Sushi",
    date: "Yama Sushi",
    category: "dates",
    caption: "Our first dinner at Yama Sushi was such a blast. I loved it.",
    description: "A favorite first dinner together at Yama Sushi.",
    image: "/assets/yama-first-dinner.jpg",
  },
  {
    id: "first-hawkins-park",
    room: "beginning",
    title: "Our first time at Hawkins Park",
    date: "Hawkins Park",
    category: "dates",
    caption: "We walked around, went to Wawa, and got to know each other. It was pretty fun.",
    description: "One of those early hangouts where we were learning more about each other.",
    image: "/assets/first-park-walk.jpg",
  },
  {
    id: "joeys-first-birthday",
    room: "beginning",
    title: "My birthday dinner at La Cucina Nouveau",
    date: "La Cucina Nouveau",
    category: "dates",
    caption: "Emma took me to La Cucina Nouveau for my birthday. It was so good, and we had an awesome time.",
    description: "A birthday dinner with you that I'll always remember.",
    image: "/assets/joey-first-birthday.jpg",
  },
  {
    id: "spring-lake-sunset",
    room: "memories",
    title: "A Spring Lake sunset",
    date: "Spring Lake",
    category: "trips",
    caption: "A sunset at Spring Lake together.",
    description: "A favorite photo from Spring Lake.",
    image: "/assets/spring-lake-sunset.jpg",
  },
  {
    id: "halloween-vampires",
    room: "memories",
    title: "Our vampire Halloween",
    date: "Halloween party",
    category: "funny",
    caption: "We went as vampires, and the whole party was so much fun.",
    description: "One of my favorite memories of us dressed up and having a great night together.",
    image: "/assets/halloween-party.jpg",
  },
  {
    id: "lego-bears",
    room: "memories",
    title: "Building our little Lego bears",
    date: "A cozy day together",
    category: "everyday",
    caption: "We built two cute little bears that look like us.",
    description: "Putting them together was such a fun, sweet way to spend time and bond.",
    image: "/assets/building-lego.jpeg",
  },
  {
    id: "new-years-together",
    room: "memories",
    title: "New Year's Eve together",
    date: "New Year's",
    category: "dates",
    caption: "You came over to celebrate with me, and it turned into such a fun night.",
    description: "A favorite New Year's memory with you.",
    image: "/assets/new-years.jpg",
  },
  {
    id: "first-weeknd-concert",
    room: "memories",
    title: "Our first Weeknd concert",
    date: "Our first concert together",
    category: "dates",
    caption: "Our first concert together was The Weeknd, and it was such a blast.",
    description: "A fun night and a first concert I'll always remember.",
    image: "/assets/the-weeknd-concert.jpg",
  },
  {
    id: "new-york-city",
    room: "memories",
    title: "A day in the city",
    date: "New York City",
    category: "trips",
    caption: "Bryant Park, SoHo, Fifth Avenue, Columbus Circle, and Rockefeller Center—all in one city day.",
    description: "We got to explore so many favorite corners of New York together.",
    image: "/assets/city-trip.jpeg",
  },
  {
    id: "syracuse-basketball",
    room: "memories",
    title: "Syracuse and the basketball game",
    date: "Syracuse",
    category: "trips",
    caption: "A trip to see Ava, with a basketball game that made the whole day so much fun.",
    description: "A favorite visit, a great game, and a lot of fun together.",
    image: "/assets/syracuse-trip.jpg",
  },
  {
    id: "red-bank-yumi",
    room: "memories",
    title: "National Girlfriend Day in Red Bank",
    date: "National Girlfriend Day",
    category: "dates",
    caption: "Dinner at Yumi Sushi in Red Bank was such a good time.",
    description: "A sweet little dinner date to remember.",
    image: "/assets/red-bank-national-gf-day.jpg",
  },
  {
    id: "signing-day-support",
    room: "little-things",
    title: "You made signing day a celebration",
    date: "Signing day",
    category: "everyday",
    caption: "You showed up with balloons and made the whole day feel amazing.",
    description: "I love this picture, and I love that you came to support me.",
    image: "/assets/signing-day.jpeg",
  },
  {
    id: "long-branch-monmouth",
    room: "little-things",
    title: "A favorite photo in Long Branch",
    date: "After visiting Monmouth University",
    category: "trips",
    caption: "A cute picture together after our visit to Monmouth University.",
    description: "One of those little moments and photos I just love.",
    image: "/assets/long-branch-monmouth.jpg",
  },
  {
    id: "relay-for-life",
    room: "little-things",
    title: "Relay for Life, together",
    date: "Relay for Life",
    category: "everyday",
    caption: "You planned such a meaningful event, and I loved being there to support you.",
    description: "It turned into a blast, and I'm proud of all the care you put into it.",
    image: "/assets/relay-for-life.jpg",
  },
  {
    id: "shu-meet",
    room: "little-things",
    title: "You came all the way to cheer me on",
    date: "SHU meet · upstate New York",
    category: "trips",
    caption: "You made the trip all the way to upstate New York to support me at my race.",
    description: "It meant so much to have you there cheering me on.",
    image: "/assets/shu-meet.jpg",
  },
  {
    id: "home-soccer-support",
    room: "little-things",
    title: "Your biggest home-game fan",
    date: "Emma's home soccer games",
    category: "everyday",
    caption: "I loved coming to all your home games, watching you play, and cheering you on.",
    description: "Getting to support you on the field was always something I looked forward to.",
    image: "/assets/soccer-game-support.jpeg",
  },
  {
    id: "tutto-collection",
    room: "little-things",
    title: "Completing the Wizard of Oz collection",
    date: "Finally got Tutto",
    category: "everyday",
    caption: "We finally completed the Wizard of Oz collection and got Tutto!",
    description: "A very satisfying little collection win to share together.",
    image: "/assets/tutto-wizard-of-oz.jpg",
  },
  {
    id: "car-selfie",
    room: "little-things",
    title: "A cute little car selfie",
    date: "Just us",
    category: "everyday",
    caption: "Just a cute picture of us in the car that I love.",
    description: "One of my favorite little photos of us.",
    image: "/assets/cute-car-pic.jpg",
  },
  {
    id: "first-christmas-together",
    room: "memories",
    title: "Our first Christmas together",
    date: "Christmas at Emma's house",
    category: "dates",
    caption: "Our first time celebrating Christmas together, and we had such a great time.",
    description: "I'm so glad I got to share that first Christmas at your house with you.",
    image: "/assets/christmas-at-emmas.jpeg",
  },
  {
    id: "new-balance-nationals",
    room: "little-things",
    title: "You came to my last high school race",
    date: "New Balance Nationals",
    category: "trips",
    caption: "You came to watch me run my last high school race. It was emotional, and I was so glad you were there.",
    description: "Having you at New Balance Nationals made the day even more meaningful.",
    image: "/assets/new-balance-nationals.jpg",
  },
  {
    id: "year-and-a-half-toast",
    room: "memories",
    title: "A year and a half together",
    date: "Our 1.5-year anniversary",
    category: "dates",
    caption: "A core memory: celebrating a year and a half together over a great brunch at Toast.",
    description: "Such a lovely brunch and a milestone I'm so happy we got to celebrate together.",
    image: "/assets/year-and-a-half-toast.jpeg",
  },
  {
    id: "senior-prom-house",
    room: "memories",
    title: "Senior prom house",
    date: "Senior prom",
    category: "dates",
    caption: "We had such a great time with everybody, and I loved spending the night with you.",
    description: "A great night with friends and one I'm especially happy I got to share with you.",
    image: "/assets/senior-prom-house.jpg",
  },
  {
    id: "junior-prom",
    room: "memories",
    title: "Junior prom, my favorite picture of us",
    date: "Junior prom",
    category: "dates",
    caption: "One of my favorite pictures of us—so, so cute, and such a core memory.",
    description: "I love looking back at this night and remembering how much fun it was with you.",
    image: "/assets/junior-prom.jpg",
  },
];

export const thingsILove = [
  "Your eyes",
  "Your smile",
  "Your laugh",
  "Your kindness",
  "Your big heart",
  "The way you support me",
];

export const apologyLetter = `I know I hurt you, and I know saying sorry doesn't automatically fix anything. I wasn't honest with you, and instead of telling you the truth, I kept lying. You don't deserve that. You deserved honesty from me, even when I kept lying.

I understand that I gave you reasons to question if I was telling the truth or not, and I am genuinely sorry for putting you through that.

I don't expect a website, flowers, or gifts to make everything okay. I know that rebuilding your trust is something I have to work hard to do with constant support and love.

I love you so much, my world forever and always, and I don't want to hurt you anymore.`;

export const futurePlans = {
  closing: "Hope we stay together and see each other this weekend.",
};
