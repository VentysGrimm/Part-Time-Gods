const SYSTEM_ID = "part-time-gods";
const TEXT_RESULT = 0;

function table(name, formula, sourcePage, rows, { description = "" } = {}) {
  return {
    name,
    img: "icons/svg/d20-grey.svg",
    formula,
    replacement: true,
    displayRoll: true,
    description: description || `<p><strong>Source:</strong> Part-Time Gods Second Edition, book p. ${sourcePage}.</p>`,
    results: rows.map(([range, text]) => ({
      type: TEXT_RESULT,
      text,
      img: "icons/svg/d20-grey.svg",
      range: Array.isArray(range) ? range : [range, range],
      weight: Array.isArray(range) ? range[1] - range[0] + 1 : 1,
      drawn: false
    })),
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "random-table",
        source: {
          book: "Part-Time Gods Second Edition",
          page: sourcePage
        }
      }
    }
  };
}

const reroll = "ReRoll";
const gmChoice = "GM Choice";
const coordinateRows = Array.from({ length: 10 }, (_, index) => {
  const value = index + 1;
  return [value, `${value}`];
});

export const PTG_PREMADE_ROLL_TABLES = [
  table("Random Occupation - Class", "1d10", 282, [
    [[1, 2], reroll],
    [[3, 4], "Strangers"],
    [[5, 6], "Low Class"],
    [[7, 8], "Middle Class"],
    [[9, 10], "Upper Class"]
  ]),
  table("Random Occupation - Strangers Subtype", "1d10", 282, [
    [[1, 3], "Criminal"],
    [[4, 6], "Fringe"],
    [[7, 9], "Unemployed"],
    [10, gmChoice]
  ]),
  table("Random Occupation - Criminal", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Big Time"],
    [[5, 7], "Sex Worker"],
    [[8, 10], "Small Time"]
  ]),
  table("Random Occupation - Unemployed", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Homeless"],
    [[5, 7], "Privileged"],
    [[8, 10], "Retired"]
  ]),
  table("Random Occupation - Fringe", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Kid"],
    [[5, 7], "Religious"],
    [[8, 10], "Rural"]
  ]),
  table("Random Occupation - Low Class Subtype", "1d10", 282, [
    [[1, 3], "Blue Collar"],
    [[4, 6], "Creative"],
    [[7, 9], "Physical"],
    [10, gmChoice]
  ]),
  table("Random Occupation - Blue Collar", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Business Owner"],
    [[5, 7], "Manual Labor"],
    [[8, 10], "Minimum Wage"]
  ]),
  table("Random Occupation - Creative", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Artist"],
    [[5, 7], "Homemaker"],
    [[8, 10], "Performer"]
  ]),
  table("Random Occupation - Physical", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Athlete"],
    [[5, 7], "Fighter"],
    [[8, 10], "Soldier"]
  ]),
  table("Random Occupation - Middle Class Subtype", "1d10", 282, [
    [[1, 3], "Academic"],
    [[4, 6], "Peacekeepers"],
    [[7, 9], "Public Life"],
    [10, gmChoice]
  ]),
  table("Random Occupation - Academic", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Explorer"],
    [[5, 7], "Professor"],
    [[8, 10], "Student"]
  ]),
  table("Random Occupation - Peacekeepers", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Detective"],
    [[5, 7], "Emergency Services"],
    [[8, 10], "Officer"]
  ]),
  table("Random Occupation - Public Life", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Celebrity"],
    [[5, 7], "Media"],
    [[8, 10], "Politician"]
  ]),
  table("Random Occupation - Upper Class Subtype", "1d10", 282, [
    [[1, 4], "Medical"],
    [[5, 8], "White Collar"],
    [[9, 10], gmChoice]
  ]),
  table("Random Occupation - Medical", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Professional"],
    [[5, 7], "Scientist"],
    [[8, 10], "Therapist"]
  ]),
  table("Random Occupation - White Collar", "1d10", 282, [
    [1, reroll],
    [[2, 4], "Computer Tech"],
    [[5, 7], "Executive"],
    [[8, 10], "Lawyer"]
  ]),

  table("Random Archetype - Drive", "1d10", 283, [
    [[1, 2], reroll],
    [[3, 4], "Leaving Mark on the World"],
    [[5, 6], "Provide Structure To Life"],
    [[7, 8], "Connecting with Others"],
    [[9, 10], "Seeks Paradise"]
  ]),
  table("Random Archetype - Leaving Mark on the World", "1d10", 283, [
    [[1, 3], "Hero"],
    [[4, 6], "Rebel"],
    [[7, 9], "Wanderer"],
    [10, gmChoice]
  ]),
  table("Random Archetype - Provide Structure To Life", "1d10", 283, [
    [[1, 3], "Caregiver"],
    [[4, 6], "Dreamer"],
    [[7, 9], "Tyrant"],
    [10, gmChoice]
  ]),
  table("Random Archetype - Connecting with Others", "1d10", 283, [
    [[1, 3], "Companion"],
    [[4, 6], "Fool"],
    [[7, 9], "Lover"],
    [10, gmChoice]
  ]),
  table("Random Archetype - Seeks Paradise", "1d10", 283, [
    [[1, 3], "Innocent"],
    [[4, 6], "Sage"],
    [[7, 9], "Visionary"],
    [10, gmChoice]
  ]),

  table("Random Dominion - Type", "2d10", 284, [
    [[2, 4], "Bestial"],
    [[5, 7], "Conceptual"],
    [[8, 10], "Elemental"],
    [[11, 13], "Emotional"],
    [[14, 16], "Patron"],
    [[17, 19], "Tangible"],
    [20, "Crossover"]
  ]),
  table("Random Dominion - Bestial", "2d10", 284, [
    [2, "Cattle"], [3, "Serpents"], [4, "Monkeys"], [5, "Octopuses"], [6, "Elephants"],
    [7, "Spiders"], [8, "Lions"], [9, "Coyotes"], [10, "Foxes"], [11, "Eagles"],
    [12, "Rhinos"], [13, "Jaguars"], [14, "Bees"], [15, "Wolves"], [16, "Vermin"],
    [17, "Vultures"], [18, "Sharks"], [19, "Raccoons"], [20, "Beasts"]
  ]),
  table("Random Dominion - Conceptual", "2d10", 284, [
    [2, "Revenge"], [3, "Marriage"], [4, "Wisdom"], [5, "Morality"], [6, "Celebration"],
    [7, "Justice"], [8, "Hospitality"], [9, "Creativity"], [10, "Romance"], [11, "Truth/Lies"],
    [12, "Beauty"], [13, "Loyalty"], [14, "Communication"], [15, "Family"], [16, "The Law"],
    [17, "Glory"], [18, "Secrets"], [19, "Balance"], [20, "Names"]
  ]),
  table("Random Dominion - Elemental", "2d10", 284, [
    [2, "Mountains"], [3, "Thunder"], [4, "Flowers"], [5, "Ice"], [6, "Storms"],
    [7, "Gold"], [8, "Forests"], [9, "Mist"], [10, "Deserts"], [11, "Void"],
    [12, "Jewels"], [13, "Shadows"], [14, "Light"], [15, "Fire"], [16, "The Wind"],
    [17, "The Ocean"], [18, "The Earth"], [19, "Sun/Moon"], [20, "Weather"]
  ]),
  table("Random Dominion - Emotional", "2d10", 284, [
    [2, "Mourning"], [3, "Surprise"], [4, "Cruelty"], [5, "Laughter"], [6, "Depression"],
    [7, "Envy"], [8, "Courage"], [9, "Patience"], [10, "Anxiety"], [11, "Disgust"],
    [12, "Rage"], [13, "Kindness"], [14, "Desire"], [15, "Reflection"], [16, "Ecstacy"],
    [17, "Joy"], [18, "Trust"], [19, "Love"], [20, "Fear"]
  ]),
  table("Random Dominion - Patron", "2d10", 284, [
    [2, "Artists"], [3, "Warriors"], [4, "Virgins"], [5, "Thieves"], [6, "Shepherds"],
    [7, "Archers"], [8, "Librarians"], [9, "Entertainers"], [10, "Taxi Drivers"], [11, "Gamblers"],
    [12, "Merchants"], [13, "Journalists"], [14, "Lost Souls"], [15, "Smiths"], [16, "Mothers"],
    [17, "Cooks"], [18, "Wine"], [19, "Racers"], [20, "Travelers"]
  ]),
  table("Random Dominion - Tangible", "2d10", 284, [
    [2, "Filth"], [3, "Coffee"], [4, "Technology"], [5, "Sex"], [6, "Fertility"],
    [7, "Bones"], [8, "Mirrors"], [9, "Blades"], [10, "Cars"], [11, "Pollution"],
    [12, "Strength"], [13, "Colors"], [14, "Slaughter"], [15, "Mechanics"], [16, "Medicine"],
    [17, "Sickness"], [18, "Hunger"], [19, "Androgyny"], [20, "Wealth"]
  ]),
  table("Random Dominion - Crossover", "2d10", 284, [
    [2, "Fashion"], [3, "The Hunt"], [4, "Death"], [5, "Rebirth"], [6, "Trickery"],
    [7, "Day/Night"], [8, "Dreams"], [9, "Science"], [10, "Chaos"], [11, "Sports"],
    [12, "Leadership"], [13, "Agriculture"], [14, "Music"], [15, "Hearth"], [16, "Luck"],
    [17, "War"], [18, "Oaths"], [19, "Time"], [20, "Season (choose one)"]
  ]),
  table("Random Dominion Blessing - Bestial", "1d10", 284, [[1, reroll], [[2, 4], "Beast Tongue"], [[5, 7], "Ferocity"], [[8, 10], "Frenzy"]]),
  table("Random Dominion Curse - Bestial", "1d10", 284, [[[1, 5], "Animal Mind"], [[6, 10], "Not My Kind"]]),
  table("Random Dominion Blessing - Conceptual", "1d10", 284, [[1, reroll], [[2, 4], "Beacon"], [[5, 7], "Mental Guard"], [[8, 10], "Tongues"]]),
  table("Random Dominion Curse - Conceptual", "1d10", 284, [[[1, 5], "Bizzaro-God"], [[6, 10], "Led By My Power"]]),
  table("Random Dominion Blessing - Elemental", "1d10", 284, [[1, reroll], [[2, 4], "Destructive Nature"], [[5, 7], "Elemental Strength"], [[8, 10], "In My Element"]]),
  table("Random Dominion Curse - Elemental", "1d10", 284, [[[1, 5], "Connected to the Land"], [[6, 10], "Tech Allergy"]]),
  table("Random Dominion Blessing - Emotional", "1d10", 284, [[1, reroll], [[2, 4], "Fuel My Fire"], [[5, 7], "Siphon"], [[8, 10], "Soothing Aura"]]),
  table("Random Dominion Curse - Emotional", "1d10", 284, [[[1, 5], "Apathetic"], [[6, 10], "Overcome with Emotion"]]),
  table("Random Dominion Blessing - Patron", "1d10", 284, [[1, reroll], [[2, 4], "Divinely Skilled"], [[5, 7], "Loved and Worshipped"], [[8, 10], "Patron's Blessing"]]),
  table("Random Dominion Curse - Patron", "1d10", 284, [[[1, 5], "Fox in the Henhouse"], [[6, 10], "Let's See What You Got"]]),
  table("Random Dominion Blessing - Tangible", "1d10", 284, [[1, reroll], [[2, 4], "Call Me Master"], [[5, 7], "Finder's Keepers"], [[8, 10], "Immunity"]]),
  table("Random Dominion Curse - Tangible", "1d10", 284, [[[1, 5], "Everything's a Nail"], [[6, 10], "Utterly Alone"]]),
  table("Random Dominion Blessing - Crossover", "1d10", 284, [[1, reroll], [[2, 4], "Adaptable"], [[5, 7], "Learning from Others"], [[8, 10], "Reactive"]]),
  table("Random Dominion Curse - Crossover", "1d10", 284, [[[1, 5], "Prideful"], [[6, 10], "Unpredictable"]]),

  table("Random Attachment - Kind", "1d10", 284, [
    [[1, 5], "Bonds"],
    [[6, 10], "Entitlements"]
  ]),
  table("Random Attachment - Bonds", "1d10", 284, [
    [[1, 3], "+1 Individual Bond"],
    [[4, 6], "+1 Group Bond"],
    [[7, 9], "+1 Landmark Bond"],
    [10, gmChoice]
  ]),
  table("Random Attachment - Entitlements", "1d10", 284, [
    [[1, 2], "+1 Relic"],
    [[3, 4], "Vassal"],
    [[5, 6], "+1 Worshipper"],
    [[7, 8], "+1 Truth (counts as 2)"],
    [[9, 10], gmChoice]
  ]),
  table("Random Theology", "1d10", 284, [
    [1, "Ascendants"],
    [2, "Cult of the Saints"],
    [3, "Drifting Kingdoms"],
    [4, "Kunitsukami"],
    [5, "Masks of Jana"],
    [6, "Order of Meskhenet"],
    [7, "Phoenix Society"],
    [8, "Puck-Eaters"],
    [9, "Warlock's Fate"],
    [10, gmChoice]
  ]),

  table("Random Location - Across Coordinate", "1d10", 275, coordinateRows, {
    description: "<p><strong>Source:</strong> Part-Time Gods Second Edition, book p. 275. Roll once for the across coordinate, then roll the down coordinate table and place the new location at across-down on the Territory Grid.</p>"
  }),
  table("Random Location - Down Coordinate", "1d10", 275, coordinateRows, {
    description: "<p><strong>Source:</strong> Part-Time Gods Second Edition, book p. 275. Roll once for the down coordinate after rolling the across coordinate table.</p>"
  }),
  table("Territory Crawl - Sample Locations", "1d5", 276, [
    [1, "2-8: Library. Known: rare books section managed by Matilda Shirk. Secret: a dragon sleeps below the library and Matilda knows about it."],
    [2, "2-9: The Iron Rack. Known: bar and live music venue owned by Satyr Jasper Teems. Secret: none."],
    [3, "2-10: The Public Ice Rink. Known: public ice rink. Secret: hidden outsider hockey league late Sunday nights."],
    [4, "3-1: Mac's Delights. Known: gourmet macaroni and cheese restaurant. Secret: none."],
    [5, "3-2: Kostal Park. Known: public park. Secret: the Woodland Watcher holds monthly court for the local outsider community."]
  ], {
    description: "<p><strong>Source:</strong> Part-Time Gods Second Edition, book p. 276. Example Territory Crawl entries for seeding the Territory Grid with known information and GM-only secrets.</p>"
  })
];
