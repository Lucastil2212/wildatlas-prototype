(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const DEG = Math.PI / 180;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));

  const BIOMES = {
    rainforest: {
      label: "Tropical rainforest",
      image: "assets/biome-rainforest.jpg",
      color: "#5de0a1",
      summary: "Warm, wet, layered forest where light, water, and nutrients move through a vertical city of life.",
      lens: "Follow the layers—from river edge to canopy—and notice how each species occupies a different address."
    },
    savanna: {
      label: "Tropical savanna",
      image: "assets/biome-savanna.jpg",
      color: "#ffbd66",
      summary: "Seasonal grassland shaped by migration, grazing, fire, and the constant negotiation between predators and prey.",
      lens: "Watch the horizon, then look closer at tracks, dung, grazed grass, and the small recyclers underfoot."
    },
    coral: {
      label: "Coral reef & ocean",
      image: "assets/biome-coral.jpg",
      color: "#54dce1",
      summary: "A sunlit underwater neighborhood built by tiny animals and shared by fish, turtles, mollusks, and drifting plankton.",
      lens: "Look for partnerships: cleaners and clients, coral and algae, anemones and fish, predators and hiding places."
    },
    arctic: {
      label: "Arctic tundra & sea ice",
      image: "assets/biome-arctic.jpg",
      color: "#a8dcff",
      summary: "A cold, seasonal world where insulation, migration, stored energy, and timing decide who can thrive.",
      lens: "Notice the boundary between land, ice, and open water. Many Arctic lives depend on moving between them."
    },
    islands: {
      label: "Volcanic islands",
      image: "assets/biome-islands.jpg",
      color: "#7ee2c8",
      summary: "Young land surrounded by ocean, where isolation turns ordinary adaptations into extraordinary experiments.",
      lens: "Compare close relatives. On islands, small differences in food and terrain can shape beaks, shells, and behavior."
    },
    wetlands: {
      label: "Subtropical wetlands",
      image: "assets/biome-wetlands.jpg",
      color: "#9bd66f",
      summary: "A slow-moving mosaic of marsh, mangrove, open water, and tree islands governed by the seasonal pulse of water.",
      lens: "Water depth changes everything. Look for animals that engineer deeper pools, perch above floods, or breathe at the surface."
    },
    temperate: {
      label: "Temperate mountains & forest",
      image: "assets/biome-temperate.jpg",
      color: "#7ec7aa",
      summary: "Forests, rivers, meadows, and high country connected by seasons, fire, snow, and large roaming animals.",
      lens: "Read the landscape as a network: grazers open patches, scavengers clean them, and engineers redirect water."
    },
    desert: {
      label: "Hot desert",
      image: "assets/biome-desert.jpg",
      color: "#ff966f",
      summary: "A water-limited world where shade, timing, storage, and efficient bodies turn scarcity into opportunity.",
      lens: "Explore at dawn or dusk. Desert life often hides from midday heat and leaves clues in flowers, burrows, and tracks."
    }
  };

  const LOCATIONS = [
    {
      id: "amazon",
      name: "Amazon Rainforest",
      region: "Amazonas, Brazil",
      lat: -3.4653,
      lon: -62.2159,
      biomeKey: "rainforest",
      icon: "✣",
      curated: true,
      summary: "A layered world where rivers flood into forests and thousands of species share the same vertical city of leaves.",
      subtitle: "Meet the neighbors who move seeds, shape rivers, farm fungus, and keep the canopy alive.",
      stats: [["Habitat", "Floodplain + canopy"], ["Rhythm", "Rain and river pulses"], ["Field clue", "Listen before looking"]],
      habitat: [
        ["Layers", "Life is stacked from dark forest floor to sunlit emergent crowns. Each layer offers different food, shelter, and routes through the trees."],
        ["Water", "Seasonal flooding connects rivers to forests, carrying fish, fruit, sediment, and nutrients into new places."],
        ["Relationships", "Pollination, seed dispersal, predation, and decomposition tie distant organisms into one living system."],
        ["Fieldcraft", "Start with sound. Calls, wingbeats, falling fruit, and leaf movement often reveal animals before their colors do."]
      ],
      species: [
        {
          id: "jaguar", common: "Jaguar", scientific: "Panthera onca", icon: "🐆", group: "Mammal",
          diet: "Carnivore", activity: "Dusk to night", adaptation: "Rosette camouflage",
          curious: "A jaguar can move from dense forest to river edge almost invisibly, using its rosette coat to break up its outline.",
          explorer: "The Amazon’s largest cat is equally comfortable stalking forest trails and swimming across channels. Its compact body and powerful jaws let it tackle prey other big cats might avoid.",
          naturalist: "Panthera onca is a large Neotropical felid associated with forest, wetland, and riparian mosaics. Rosettes vary between individuals and can be used for photo identification.",
          role: "As a top predator, the jaguar influences where prey move and feed. Protecting enough connected habitat for jaguars also protects many other species that share their range.",
          look: "Rounded tracks wider than they are long, scrape marks, low trails beside water, and rosette patterns with small spots inside some rings.",
          quiz: { q: "What makes a jaguar especially suited to this river-rich forest?", options: ["It never enters water", "It is a strong swimmer", "It only hunts in treetops"], answer: 1, explanation: "Jaguars readily swim and often use river corridors." }
        },
        {
          id: "scarlet-macaw", common: "Scarlet macaw", scientific: "Ara macao", icon: "🦜", group: "Bird",
          diet: "Fruit, seeds, nuts", activity: "Daytime", adaptation: "Powerful curved beak",
          curious: "A macaw’s beak works like a climbing tool, nutcracker, and precision food processor all at once.",
          explorer: "Scarlet macaws travel in pairs or noisy groups above the canopy. Their strong beaks open hard fruits, while their feet hold food almost like hands.",
          naturalist: "Ara macao is a large canopy parrot with zygodactyl feet—two toes forward and two backward—useful for climbing and manipulating food.",
          role: "Macaws move seeds across long distances. Some seeds are eaten, some dropped, and some carried away from the parent tree, helping shape future forest patches.",
          look: "Long pointed tail, red body, yellow wing band, loud rolling calls, and pairs flying with slow, deep wingbeats.",
          quiz: { q: "Which body part helps a macaw both eat and climb?", options: ["Its curved beak", "Its tail feathers only", "Its tongue alone"], answer: 0, explanation: "The beak can grip branches and crack tough foods." }
        },
        {
          id: "harpy-eagle", common: "Harpy eagle", scientific: "Harpia harpyja", icon: "🦅", group: "Bird",
          diet: "Tree-dwelling vertebrates", activity: "Daytime", adaptation: "Broad wings and strong talons",
          curious: "Broad wings help a harpy eagle maneuver through gaps in the canopy instead of racing across open sky.",
          explorer: "This massive forest eagle waits quietly, then makes short, powerful flights through trees. Its feet are built to grip prey moving along branches.",
          naturalist: "Harpia harpyja is a low-density apex raptor of mature Neotropical forest. Its wing shape favors maneuverability in structurally complex canopy habitat.",
          role: "Harpy eagles connect the canopy food web from large fruit-eaters to top predators. Nesting pairs need extensive, mature forest with tall emergent trees.",
          look: "A gray head with a raised double crest, barred legs, an enormous stick nest high in an emergent tree, and long periods of stillness.",
          quiz: { q: "Why are broad wings useful inside a rainforest?", options: ["They improve maneuvering between trees", "They make the bird invisible", "They let it breathe underwater"], answer: 0, explanation: "Broad wings support controlled flight in tight forest spaces." }
        },
        {
          id: "leafcutter-ant", common: "Leafcutter ant", scientific: "Atta species", icon: "🐜", group: "Small life",
          diet: "Cultivated fungus", activity: "Day and night", adaptation: "Fungus farming",
          curious: "Leafcutters do not eat most of the leaves they carry—they use them to grow a fungus garden underground.",
          explorer: "A colony acts like a distributed farm. Workers cut fresh plant material, clean it, feed it to fungus, remove waste, and defend the nest.",
          naturalist: "Atta colonies contain size-specialized workers and maintain an obligate fungal cultivar. Foraging trails can extend far beyond the nest mound.",
          role: "Leafcutters move enormous amounts of plant material and soil. Their nests aerate the ground and concentrate nutrients, changing nearby plant growth.",
          look: "Busy two-way trails, leaf fragments moving like tiny green sails, freshly clipped vegetation, and large soil mounds with many entrances.",
          quiz: { q: "What is the colony’s main food?", options: ["The carried leaves", "A cultivated fungus", "River fish"], answer: 1, explanation: "Leaves are the growing medium for the ants’ fungus crop." }
        },
        {
          id: "river-dolphin", common: "Amazon river dolphin", scientific: "Inia geoffrensis", icon: "🐬", group: "Mammal",
          diet: "Fish and crustaceans", activity: "Flexible", adaptation: "Echolocation in murky water",
          curious: "In flooded forest, a river dolphin may swim between tree trunks where people walked during the dry season.",
          explorer: "A flexible neck and echolocation help this freshwater dolphin navigate channels filled with branches, sediment, and seasonal change.",
          naturalist: "Inia geoffrensis occupies major Amazon and Orinoco river systems. Seasonal floodplain access alters movement and prey availability across the year.",
          role: "River dolphins are mobile predators that link main channels, lakes, and flooded forest. Their presence reflects the health and connectivity of freshwater habitat.",
          look: "A low rolling surfacing pattern, a long narrow beak, a rounded forehead, and pink-to-gray coloration that varies with age and individual.",
          quiz: { q: "Which sense is especially useful in murky river water?", options: ["Echolocation", "Color vision alone", "Smelling flowers"], answer: 0, explanation: "Sound helps dolphins map prey and obstacles when visibility is low." }
        }
      ]
    },
    {
      id: "serengeti",
      name: "Serengeti Plains",
      region: "Tanzania",
      lat: -2.3333,
      lon: 34.8333,
      biomeKey: "savanna",
      icon: "◒",
      curated: true,
      summary: "Open grassland where rainfall moves herds across the map and every footprint becomes part of a larger food web.",
      subtitle: "Follow the migration from grass blade to grazer, predator, scavenger, and soil recycler.",
      stats: [["Habitat", "Grassland + woodland"], ["Rhythm", "Wet and dry seasons"], ["Field clue", "Scan edges and shade"]],
      habitat: [
        ["Rainfall", "Seasonal rain decides where fresh grass appears. Mobile animals track that green wave rather than staying in one place all year."],
        ["Grazing", "Different mouths crop grass at different heights. This creates a shifting patchwork used by many herbivores."],
        ["Fire", "Periodic fire returns nutrients, limits woody growth, and stimulates new grass, while refuges preserve insects and seed banks."],
        ["Visibility", "Open terrain rewards patience. Scan termite mounds, lone trees, shadows, and the edges of moving herds."]
      ],
      species: [
        {
          id: "lion", common: "African lion", scientific: "Panthera leo", icon: "🦁", group: "Mammal",
          diet: "Carnivore", activity: "Often dusk and night", adaptation: "Cooperative social life",
          curious: "Lions are unusual cats because they live in social groups that can defend space and raise young together.",
          explorer: "A pride is not a single hunting team all the time. Membership, hunting, cub care, and territorial defense shift with age, season, and opportunity.",
          naturalist: "Panthera leo uses a fission–fusion social system. Group composition and ranging patterns vary with prey distribution, habitat, and competition.",
          role: "Lions influence herbivore behavior and provide carcasses for scavengers, insects, and microbes. Their movements reveal where prey and cover overlap.",
          look: "Resting cats in shade, tawny shapes near grass edges, tracks without claw marks, and deep roars carrying after sunset.",
          quiz: { q: "Why is shade an important place to scan in daytime?", options: ["Lions often rest there", "Grass cannot grow there", "Only birds use shade"], answer: 0, explanation: "Large cats commonly conserve energy during hot daylight hours." }
        },
        {
          id: "wildebeest", common: "Blue wildebeest", scientific: "Connochaetes taurinus", icon: "🐃", group: "Mammal",
          diet: "Grass", activity: "Day and night", adaptation: "Long-distance movement",
          curious: "A migrating herd is not wandering randomly—it is following rain, fresh grass, water, and generations of learned routes.",
          explorer: "Wildebeest are bulk grazers that can travel in huge aggregations. Calving, river crossings, and movement timing create temporary feasts for many other species.",
          naturalist: "Connochaetes taurinus is a social grazer whose seasonal movement tracks spatial variation in forage quality and water availability.",
          role: "By eating, trampling, fertilizing, and moving, wildebeest redistribute nutrients across the plains and support predators and scavengers.",
          look: "Dark vertical shoulder stripes, a sloping back, curved horns, dusty columns, and constant low grunts within moving herds.",
          quiz: { q: "What mainly drives large seasonal movements?", options: ["Fresh forage and water", "A need to climb mountains", "Avoiding all other animals"], answer: 0, explanation: "Rainfall creates shifting patches of nutritious grass and water." }
        },
        {
          id: "cheetah", common: "Cheetah", scientific: "Acinonyx jubatus", icon: "🐆", group: "Mammal",
          diet: "Carnivore", activity: "Mostly daytime", adaptation: "Acceleration and grip",
          curious: "A cheetah’s speed works best as a short burst, not a long-distance run.",
          explorer: "Long limbs, a flexible spine, large airways, and claws that provide extra traction help cheetahs accelerate quickly across open ground.",
          naturalist: "Acinonyx jubatus is a cursorial felid adapted for rapid pursuit. Hunts are brief and require recovery from substantial heat and oxygen demand.",
          role: "Cheetahs specialize on catchable, medium-sized prey and often hunt when larger nocturnal predators are less active.",
          look: "Black tear marks from eye to mouth, a slim deep-chested body, small rounded head, and elevated lookout positions such as termite mounds.",
          quiz: { q: "Why are cheetah chases usually brief?", options: ["High-speed running generates intense heat", "They cannot see in daylight", "Their prey never moves"], answer: 0, explanation: "Sprint performance is powerful but energetically expensive." }
        },
        {
          id: "giraffe", common: "Masai giraffe", scientific: "Giraffa tippelskirchi", icon: "🦒", group: "Mammal",
          diet: "Leaves and shoots", activity: "Day and night", adaptation: "Height and grasping tongue",
          curious: "A giraffe feeds in a zone most grazers cannot reach, turning height into a private dining level.",
          explorer: "Its long neck, mobile lips, and tough tongue help it browse thorny branches. Different giraffes may favor different tree species and feeding heights.",
          naturalist: "Giraffa tippelskirchi is a selective browser. Browsing can alter branch architecture and plant competition within savanna woodland.",
          role: "Giraffes prune woody plants, move seeds, and create feeding opportunities for smaller browsers when leaves and twigs fall.",
          look: "Irregular star-like patches, long dark tongue, ossicones on the head, and a high, rocking walk visible far across the plains.",
          quiz: { q: "Which food zone does a giraffe use especially well?", options: ["High tree foliage", "Deep ocean trenches", "Underground roots only"], answer: 0, explanation: "Height gives giraffes access to browse above most herbivores." }
        },
        {
          id: "dung-beetle", common: "Dung beetle", scientific: "Scarabaeinae", icon: "🪲", group: "Small life",
          diet: "Dung and associated microbes", activity: "Varies", adaptation: "Rolling, tunneling, and navigation",
          curious: "A ball of dung can become food, a nursery, and a package of nutrients moved away from the herd.",
          explorer: "Different dung beetles roll, tunnel beneath, or live inside dung. By burying it, they feed soil and reduce breeding habitat for some flies.",
          naturalist: "Scarabaeinae guilds partition dung by behavior, time, and body size. Some species use celestial cues to maintain a straight escape route from competition.",
          role: "These recyclers return nutrients to soil, improve infiltration, disperse seeds, and make the savanna’s waste stream disappear surprisingly fast.",
          look: "Fresh dung with small holes, radiating tracks, excavated soil beneath a pat, or a beetle pushing a ball backward with its hind legs.",
          quiz: { q: "What happens when beetles bury dung?", options: ["Nutrients return to the soil", "The soil permanently dies", "Rain stops falling"], answer: 0, explanation: "Buried organic matter feeds soil organisms and plants." }
        }
      ]
    },
    {
      id: "great-barrier-reef",
      name: "Great Barrier Reef",
      region: "Queensland, Australia",
      lat: -18.2871,
      lon: 147.6992,
      biomeKey: "coral",
      icon: "≈",
      curated: true,
      summary: "A vast reef mosaic where tiny coral animals construct shelter used by fish, turtles, sharks, mollusks, and plankton.",
      subtitle: "Dive into a neighborhood built by partnerships, grazing, cleaning, hiding, and the daily movement of tides.",
      stats: [["Habitat", "Reef + lagoon"], ["Rhythm", "Tides and sunlight"], ["Field clue", "Watch cleaning stations"]],
      habitat: [
        ["Builders", "Reef-building coral polyps add calcium carbonate skeletons over generations, creating three-dimensional habitat."],
        ["Light", "Many shallow-water corals depend on photosynthetic partners, so clear water and sunlight shape where reefs can grow."],
        ["Grazers", "Fish and invertebrates remove algae that might otherwise occupy open reef surfaces and compete with young corals."],
        ["Connections", "Larvae, nutrients, predators, and migrating animals move between reef, seagrass, mangrove, and open ocean."]
      ],
      species: [
        {
          id: "coral-polyp", common: "Reef-building coral", scientific: "Scleractinia", icon: "🪸", group: "Marine",
          diet: "Plankton + photosynthetic sugars", activity: "Day and night", adaptation: "Symbiosis and skeleton building",
          curious: "A coral colony may look like a colorful rock, but it is made of many tiny animals living together.",
          explorer: "Each polyp catches food with tentacles and many also receive sugars from microscopic algae living inside their tissues.",
          naturalist: "Scleractinian corals secrete aragonite skeletons and often host dinoflagellate symbionts. Colony growth creates reef framework and habitat complexity.",
          role: "Corals are the architects of the reef. Their branching, boulder, plate, and table forms create shelter, feeding surfaces, and current breaks.",
          look: "Repeated cups or star-like corallites, tentacles extended after dark, contrasting growth forms, and small fish sheltering close to branches.",
          quiz: { q: "What is a coral polyp?", options: ["A tiny animal", "A kind of stone only", "A seaweed root"], answer: 0, explanation: "Corals are colonies of animals that build skeletons." }
        },
        {
          id: "green-turtle", common: "Green sea turtle", scientific: "Chelonia mydas", icon: "🐢", group: "Marine",
          diet: "Mostly seagrass and algae as adults", activity: "Day and night", adaptation: "Long-distance navigation",
          curious: "A sea turtle may cross whole ocean regions yet return to nesting areas connected to its early life.",
          explorer: "Adults often graze seagrass and algae, surfacing regularly to breathe. Streamlined shells and strong foreflippers support long migrations.",
          naturalist: "Chelonia mydas links feeding and nesting habitats over large spatial scales. Juvenile and adult diets and habitat use can differ substantially.",
          role: "Grazing can influence the productivity and structure of seagrass meadows, while migrations connect distant coastal ecosystems.",
          look: "A smooth oval shell, one pair of scales between the eyes, slow grazing over seagrass, and a gentle rise to the surface for air.",
          quiz: { q: "Why must a sea turtle visit the surface?", options: ["It breathes air", "It charges solar panels", "It cannot swim below one meter"], answer: 0, explanation: "Sea turtles are reptiles with lungs." }
        },
        {
          id: "clownfish", common: "Clownfish", scientific: "Amphiprion species", icon: "🐠", group: "Marine",
          diet: "Small invertebrates and algae", activity: "Daytime", adaptation: "Living with anemones",
          curious: "A protective mucus layer helps clownfish live among an anemone’s stinging tentacles.",
          explorer: "The fish gains shelter while its movement and waste can benefit the host anemone. Social rank within the group affects growth and reproduction.",
          naturalist: "Amphiprion species form obligate associations with selected host anemones. Groups typically include a breeding pair and smaller nonbreeders.",
          role: "The partnership creates a tiny high-activity hub on the reef, concentrating food, defense, and nutrient exchange.",
          look: "Repeated short trips from an anemone, bold white bars, hovering fin movements, and rapid retreats into tentacles when danger approaches.",
          quiz: { q: "What is the main benefit of the anemone to the fish?", options: ["Shelter among stinging tentacles", "A place to fly", "Freshwater to drink"], answer: 0, explanation: "The tentacles discourage many predators." }
        },
        {
          id: "parrotfish", common: "Parrotfish", scientific: "Scarini", icon: "🐟", group: "Marine",
          diet: "Algae and reef-surface material", activity: "Daytime", adaptation: "Beak-like dental plates",
          curious: "Some reef sand begins as bits of hard material ground up and passed by grazing parrotfish.",
          explorer: "Parrotfish scrape algae from reef surfaces with fused teeth. This grazing can clear space and recycle calcium-rich material into sediment.",
          naturalist: "Scarini exhibit diverse scraping and excavating feeding modes. Their grazing affects algal cover, substrate condition, and carbonate budgets.",
          role: "By removing algae and processing reef material, parrotfish help shape the surface where corals and other organisms compete for space.",
          look: "Bright mosaic colors, a beak-like mouth, audible scraping, pale bite marks on reef surfaces, and sleeping fish tucked into crevices.",
          quiz: { q: "What does a parrotfish’s beak help it do?", options: ["Scrape reef surfaces", "Dig through clouds", "Open tree bark"], answer: 0, explanation: "Its fused teeth form strong scraping plates." }
        },
        {
          id: "manta-ray", common: "Reef manta ray", scientific: "Mobula alfredi", icon: "◡", group: "Marine",
          diet: "Plankton", activity: "Flexible", adaptation: "Filter feeding",
          curious: "A manta uses rolled cephalic fins like funnels, guiding plankton-rich water toward its mouth.",
          explorer: "Mantas cruise feeding zones and cleaning stations. Their large wing-like fins generate lift while gill plates filter tiny food from seawater.",
          naturalist: "Mobula alfredi shows site fidelity at some cleaning and feeding areas. Ventral spot patterns can identify individuals in long-term photo studies.",
          role: "Mantas move between plankton patches and reef stations, linking open-water productivity with predictable reef gathering sites.",
          look: "Triangular wings, forward cephalic fins, looping feeding paths, small cleaner fish nearby, and a unique pattern of spots on the belly.",
          quiz: { q: "What does a manta ray mainly filter from the water?", options: ["Plankton", "Large rocks", "Tree leaves"], answer: 0, explanation: "Mantas are large-bodied filter feeders." }
        }
      ]
    },
    {
      id: "svalbard",
      name: "Svalbard Archipelago",
      region: "Norway",
      lat: 78.2232,
      lon: 15.6469,
      biomeKey: "arctic",
      icon: "✦",
      curated: true,
      summary: "High-Arctic islands where sea ice, tundra, cliffs, and open water create a sharply seasonal map of food and shelter.",
      subtitle: "Explore the adaptations that conserve heat, store energy, and synchronize life with brief summers.",
      stats: [["Habitat", "Tundra + sea ice"], ["Rhythm", "Polar night and midnight sun"], ["Field clue", "Watch ice edges"]],
      habitat: [
        ["Sea ice", "Ice is habitat, hunting platform, travel route, and shelter. Its seasonal timing changes where predators and prey can meet."],
        ["Tundra", "Low plants grow close to the ground, using brief summers and sheltered microclimates to complete their life cycles."],
        ["Cliffs", "Seabird colonies transfer marine nutrients onto land through guano, feathers, eggs, and the animals attracted to them."],
        ["Energy", "Insulation, fat, food caches, migration, and reduced winter activity all help animals balance a tight energy budget."]
      ],
      species: [
        {
          id: "polar-bear", common: "Polar bear", scientific: "Ursus maritimus", icon: "🐻‍❄️", group: "Mammal",
          diet: "Mostly seals", activity: "Flexible", adaptation: "Insulation and sea-ice hunting",
          curious: "A polar bear is a marine mammal whose most important hunting ground is frozen ocean, not land.",
          explorer: "Dense fur, body fat, large paws, and an excellent sense of smell support travel and hunting across ice and water.",
          naturalist: "Ursus maritimus depends strongly on marine prey and access to sea ice, though seasonal land use varies across populations and regions.",
          role: "As a top predator, the bear connects seal-rich marine food webs to beaches and tundra where remains may feed scavengers.",
          look: "Large tracks with five toes, a long neck and small head, patient waiting near breathing holes, and careful travel along pressure ridges.",
          quiz: { q: "What is the bear’s primary hunting platform?", options: ["Sea ice", "Tall tropical trees", "Desert dunes"], answer: 0, explanation: "Sea ice provides access to seal habitat." }
        },
        {
          id: "arctic-fox", common: "Arctic fox", scientific: "Vulpes lagopus", icon: "🦊", group: "Mammal",
          diet: "Opportunistic omnivore", activity: "Flexible", adaptation: "Compact body and seasonal coat",
          curious: "Small ears and a compact shape reduce the amount of body surface exposed to cold air.",
          explorer: "Arctic foxes follow food across tundra and coast, cache surplus, and use thick fur that even covers the soles of their feet.",
          naturalist: "Vulpes lagopus shows flexible foraging and can respond strongly to cycles in small-mammal prey, seabird availability, and carrion.",
          role: "The fox links seabird cliffs, tundra prey, shorelines, and carcasses, moving nutrients and seeds as it travels and caches food.",
          look: "A low, compact silhouette, small rounded ears, tracks in a straight purposeful line, food caches, and coat color that changes with season.",
          quiz: { q: "Which body shape helps reduce heat loss?", options: ["Compact body with small ears", "Very large bare ears", "Long uncovered legs"], answer: 0, explanation: "Compact proportions reduce exposed surface area." }
        },
        {
          id: "walrus", common: "Atlantic walrus", scientific: "Odobenus rosmarus rosmarus", icon: "🦭", group: "Mammal",
          diet: "Benthic invertebrates", activity: "Flexible", adaptation: "Sensitive whiskers and tusks",
          curious: "A walrus uses hundreds of stiff whiskers to search the seafloor for buried prey.",
          explorer: "Walruses dive to shallow bottoms, detect clams and other invertebrates with their vibrissae, and rest together on ice or shore.",
          naturalist: "Odobenus rosmarus forages primarily on benthic prey. Tusks function in display, social interactions, and movement around haul-out habitat.",
          role: "Seafloor feeding disturbs sediment and exposes material to other organisms, while large haul-outs concentrate nutrients along coasts.",
          look: "Long tusks, a whiskered muzzle, cinnamon-brown skin, tightly packed resting groups, and rounded heads surfacing near ice.",
          quiz: { q: "What helps a walrus locate prey in sediment?", options: ["Sensitive whiskers", "Colorful feathers", "A long trunk"], answer: 0, explanation: "Vibrissae detect objects and movement near the seafloor." }
        },
        {
          id: "svalbard-reindeer", common: "Svalbard reindeer", scientific: "Rangifer tarandus platyrhynchus", icon: "🦌", group: "Mammal",
          diet: "Tundra plants", activity: "Flexible", adaptation: "Compact build and seasonal fat",
          curious: "This island reindeer is compact and short-legged, a body plan suited to conserving heat.",
          explorer: "It feeds intensively during summer and carries energy into winter as body fat, then searches windswept patches where plants remain reachable.",
          naturalist: "The Svalbard subspecies is relatively sedentary compared with many mainland reindeer and is adapted to an insular High-Arctic environment.",
          role: "Grazing affects low tundra vegetation and returns nutrients through dung, while carcasses become important winter and spring food for scavengers.",
          look: "A stocky body, short legs, pale winter coat, broad hooves, and feeding craters scraped through shallow snow.",
          quiz: { q: "What is a key summer strategy?", options: ["Building fat reserves", "Growing coral", "Avoiding all food"], answer: 0, explanation: "Stored energy helps bridge the long food-limited season." }
        },
        {
          id: "atlantic-puffin", common: "Atlantic puffin", scientific: "Fratercula arctica", icon: "🐧", group: "Bird",
          diet: "Small fish", activity: "Daytime", adaptation: "Wing-propelled diving",
          curious: "A puffin’s wings work in air and underwater, where they become paddles for chasing fish.",
          explorer: "Puffins nest in burrows or rocky crevices, commute out to sea, and can carry several fish crosswise in the bill.",
          naturalist: "Fratercula arctica is a pelagic auk that breeds colonially. Breeding success depends on accessible prey of suitable size and energy content.",
          role: "Seabirds transfer marine nutrients to cliff soils and provide seasonal prey for foxes and other scavengers.",
          look: "A brightly colored triangular bill in breeding season, rapid wingbeats, low flights over water, and lines of birds returning toward colonies.",
          quiz: { q: "How does a puffin move underwater?", options: ["It flies with its wings", "It walks on the seafloor only", "It inflates like a balloon"], answer: 0, explanation: "Auks use their wings for underwater propulsion." }
        }
      ]
    },
    {
      id: "galapagos",
      name: "Galápagos Islands",
      region: "Ecuador",
      lat: -0.9538,
      lon: -90.9656,
      biomeKey: "islands",
      icon: "◉",
      curated: true,
      summary: "Volcanic islands where isolation, ocean currents, and sharp local differences have shaped distinctive bodies and behaviors.",
      subtitle: "Compare island specialists and see how the same landscape can reward very different solutions.",
      stats: [["Habitat", "Lava + coast + highlands"], ["Rhythm", "Currents and rainfall"], ["Field clue", "Compare neighboring islands"]],
      habitat: [
        ["Isolation", "Ocean barriers limit movement. Populations separated on different islands can follow different evolutionary paths."],
        ["Currents", "Cold and warm currents bring changing nutrients and prey, making marine productivity highly variable."],
        ["Elevation", "Dry coasts can give way to cooler, wetter highlands over a short distance, creating compressed habitat zones."],
        ["Novel niches", "With fewer familiar competitors or predators, lineages may expand into feeding roles rarely used by their mainland relatives."]
      ],
      species: [
        {
          id: "giant-tortoise", common: "Galápagos giant tortoise", scientific: "Chelonoidis niger complex", icon: "🐢", group: "Reptile",
          diet: "Plants", activity: "Daytime", adaptation: "Large body and slow metabolism",
          curious: "A giant tortoise can store water and energy, allowing it to move slowly through dry landscapes.",
          explorer: "Different island populations show shell and neck shapes associated with local vegetation and terrain. Some migrate seasonally between elevations.",
          naturalist: "The Galápagos giant tortoises comprise island-associated lineages with substantial variation in morphology, ecology, and conservation history.",
          role: "As large herbivores, tortoises open paths, disperse seeds, and alter plant structure across coastal and highland habitat.",
          look: "Broad trails through vegetation, large fibrous droppings, muddy wallows, worn resting sites, and either domed or raised-front shell profiles.",
          quiz: { q: "How can tortoises influence plants?", options: ["By grazing and dispersing seeds", "By producing ocean tides", "By pollinating only at night with wings"], answer: 0, explanation: "Their feeding and movement reshape vegetation and move seeds." }
        },
        {
          id: "marine-iguana", common: "Marine iguana", scientific: "Amblyrhynchus cristatus", icon: "🦎", group: "Reptile",
          diet: "Marine algae", activity: "Daytime", adaptation: "Diving and salt removal",
          curious: "This is the only living lizard that regularly feeds in the sea.",
          explorer: "Marine iguanas warm on dark lava, dive to graze algae, then expel extra salt through specialized nasal glands.",
          naturalist: "Amblyrhynchus cristatus is an endemic marine-foraging iguanid. Body size, dive behavior, and food access vary among islands and ocean conditions.",
          role: "By transferring marine food into bodies that rest and defecate on land, iguanas move nutrients across the shoreline boundary.",
          look: "Dark rough skin, flattened swimming tail, rows of dorsal spines, crowded basking groups, and bursts of salty spray from the nostrils.",
          quiz: { q: "Why do marine iguanas bask after feeding?", options: ["To restore body temperature", "To grow feathers", "To breathe through leaves"], answer: 0, explanation: "Cold water lowers their body temperature." }
        },
        {
          id: "blue-footed-booby", common: "Blue-footed booby", scientific: "Sula nebouxii", icon: "🐦", group: "Bird",
          diet: "Fish", activity: "Daytime", adaptation: "Plunge diving",
          curious: "A booby folds into a streamlined spear just before it hits the water.",
          explorer: "These seabirds spot schooling fish from the air and plunge into the sea, sometimes coordinating with other birds and marine predators.",
          naturalist: "Sula nebouxii is a colonial sulid whose foraging success tracks prey distribution. Foot coloration is used in courtship display and reflects pigments obtained through diet.",
          role: "Boobies carry ocean-derived nutrients to nesting ground and help reveal where fish schools concentrate near the surface.",
          look: "Powder-blue feet, a pointed bill, deliberate high-stepping courtship, and steep dives with wings swept backward.",
          quiz: { q: "What is the bird doing during a plunge dive?", options: ["Catching fish", "Digging a burrow", "Drinking nectar"], answer: 0, explanation: "Boobies enter the water at speed to pursue fish." }
        },
        {
          id: "galapagos-penguin", common: "Galápagos penguin", scientific: "Spheniscus mendiculus", icon: "🐧", group: "Bird",
          diet: "Small fish", activity: "Daytime", adaptation: "Using cool current zones",
          curious: "A penguin can live near the equator when cold, nutrient-rich water keeps enough fish close to shore.",
          explorer: "Galápagos penguins stay near productive current systems, seek shade on land, and cool themselves by panting and holding flippers away from the body.",
          naturalist: "Spheniscus mendiculus is a small, localized penguin whose breeding and survival respond strongly to ocean temperature and prey availability.",
          role: "The penguin is a visible link between current-driven plankton production, schooling fish, and rocky island nesting habitat.",
          look: "A black chest band, white face line, rapid underwater turns, shaded resting places, and small groups close to rocky coasts.",
          quiz: { q: "What allows penguins to find food near these tropical islands?", options: ["Cool productive currents", "Desert sandstorms", "Forest acorns"], answer: 0, explanation: "Cold upwelling supports rich marine food webs." }
        },
        {
          id: "darwin-finch", common: "Darwin’s finch", scientific: "Geospizinae", icon: "🐤", group: "Bird",
          diet: "Varies by species", activity: "Daytime", adaptation: "Diverse beak forms",
          curious: "Different finch beaks work like different tools—crushers, probes, pickers, and cutters.",
          explorer: "Related finches diversified across islands and foods. Beak size and shape influence which seeds, insects, cactus resources, or other foods each bird can use well.",
          naturalist: "Geospizinae are an adaptive radiation in which ecological divergence, hybridization, and selection continue to shape populations.",
          role: "Finches pollinate, disperse seeds, consume insects, and turn small differences in food availability into measurable ecological change.",
          look: "Start with the beak: deep and heavy, fine and pointed, or long and decurved. Then note habitat, behavior, and song.",
          quiz: { q: "Why are beak shapes important?", options: ["They match different feeding tasks", "They control ocean tides", "They replace wings"], answer: 0, explanation: "Beak structure affects which foods a bird can handle efficiently." }
        }
      ]
    },
    {
      id: "everglades",
      name: "Everglades",
      region: "Florida, United States",
      lat: 25.2866,
      lon: -80.8987,
      biomeKey: "wetlands",
      icon: "≋",
      curated: true,
      summary: "A broad sheet of shallow water moving through marsh, mangrove, slough, and tree island—slowly enough to build an entire world.",
      subtitle: "Trace how water depth creates feeding grounds, refuges, nesting sites, and dry-season survival pockets.",
      stats: [["Habitat", "Marsh + mangrove"], ["Rhythm", "Wet and dry seasons"], ["Field clue", "Watch water levels"]],
      habitat: [
        ["Flow", "The Everglades is not simply a swamp. It is a slow-moving wetland system whose depth and timing shape habitat."],
        ["Refuges", "Deeper pools become increasingly important as seasonal water recedes and aquatic animals concentrate."],
        ["Edges", "Mangroves, sawgrass, tree islands, and open sloughs create boundaries where many animals feed."],
        ["Salinity", "Fresh and salt water meet near the coast, producing estuarine habitat used by marine and freshwater species."]
      ],
      species: [
        {
          id: "american-alligator", common: "American alligator", scientific: "Alligator mississippiensis", icon: "🐊", group: "Reptile",
          diet: "Carnivore", activity: "Flexible", adaptation: "Aquatic ambush and gator holes",
          curious: "When an alligator excavates a deeper pool, many other animals gain a dry-season refuge.",
          explorer: "Alligators maintain open-water holes and trails through vegetation. These features can hold fish, turtles, and invertebrates as marsh water drops.",
          naturalist: "Alligator mississippiensis is both predator and ecosystem engineer. Its effects on microtopography and aquatic refugia vary with water regime.",
          role: "The alligator shapes habitat as well as consuming prey, creating concentrated feeding sites used by wading birds and other predators.",
          look: "Only eyes and nostrils above water, broad U-shaped snout, slides on muddy banks, bellowing in breeding season, and circular deeper pools.",
          quiz: { q: "Why can an alligator hole help other animals?", options: ["It retains deeper water", "It removes all oxygen", "It stops the wet season"], answer: 0, explanation: "Deeper pools can persist as surrounding marsh becomes shallow." }
        },
        {
          id: "roseate-spoonbill", common: "Roseate spoonbill", scientific: "Platalea ajaja", icon: "🦩", group: "Bird",
          diet: "Small aquatic animals", activity: "Daytime", adaptation: "Sweeping tactile bill",
          curious: "A spoonbill feeds by sweeping its bill side to side and snapping it shut when it touches prey.",
          explorer: "Its flattened bill probes shallow water for crustaceans, fish, and insects. Pink feathers come from pigments ultimately obtained through food.",
          naturalist: "Platalea ajaja is a tactile-feeding wader associated with shallow productive wetlands and estuaries. Feeding success depends strongly on water depth.",
          role: "Spoonbills track concentrated prey and help signal where hydrology has created productive shallow-water feeding habitat.",
          look: "Bright pink body, pale neck, flattened spoon-shaped bill, methodical side-to-side feeding, and groups moving through ankle-deep water.",
          quiz: { q: "How does the bird detect much of its prey?", options: ["By touch with its bill", "With echolocation", "By digging tree bark"], answer: 0, explanation: "The bill closes rapidly when it contacts food." }
        },
        {
          id: "manatee", common: "West Indian manatee", scientific: "Trichechus manatus", icon: "🦭", group: "Mammal",
          diet: "Aquatic plants", activity: "Flexible", adaptation: "Slow grazing and warm-water use",
          curious: "A manatee can spend much of the day grazing, resting, and surfacing quietly for air.",
          explorer: "These large herbivores move among rivers, springs, estuaries, and coastal waters, often seeking warm-water refuges during cold periods.",
          naturalist: "Trichechus manatus is an aquatic herbivore with broad habitat use. Temperature, freshwater access, forage, and vessel traffic influence movement.",
          role: "Manatees consume and redistribute aquatic vegetation and connect freshwater, estuarine, and coastal environments through their movements.",
          look: "A round snout at the surface, circular ripples, a paddle-shaped tail, clipped vegetation, and slow travel through calm channels.",
          quiz: { q: "What does a manatee mostly eat?", options: ["Aquatic plants", "Large sharks", "Dry cactus wood"], answer: 0, explanation: "Manatees are primarily herbivorous grazers." }
        },
        {
          id: "anhinga", common: "Anhinga", scientific: "Anhinga anhinga", icon: "🐦", group: "Bird",
          diet: "Fish and aquatic prey", activity: "Daytime", adaptation: "Submerged pursuit",
          curious: "An anhinga often swims with only its long neck above water, earning the nickname “snakebird.”",
          explorer: "It pursues fish underwater, then perches with wings spread. Its plumage is less buoyant than that of many surface-swimming waterbirds.",
          naturalist: "Anhinga anhinga is a foot-propelled pursuit diver. Wing-spreading behavior contributes to drying and thermoregulation after foraging.",
          role: "Anhingas move energy from underwater fish communities into nesting colonies and shoreline perches.",
          look: "A thin S-shaped neck, dagger-like bill, dark body, long tail, submerged swimming, and a cross-shaped wing-drying pose.",
          quiz: { q: "Why is the bird often seen with wings spread?", options: ["To dry and warm them", "To imitate a flower", "To breathe through feathers"], answer: 0, explanation: "Wing spreading helps manage wet plumage and body temperature." }
        },
        {
          id: "florida-panther", common: "Florida panther", scientific: "Puma concolor coryi", icon: "🐈", group: "Mammal",
          diet: "Carnivore", activity: "Dusk and night", adaptation: "Wide-ranging stealth",
          curious: "A single panther can use a territory far larger than the area visible from any one trail or overlook.",
          explorer: "This puma moves through forest, prairie, wetland edges, and human-fragmented landscapes while hunting deer, hogs, and smaller prey.",
          naturalist: "The Florida panther is a regional population of Puma concolor. Connectivity, road mortality, prey, and habitat quality strongly influence recovery.",
          role: "As a wide-ranging predator, the panther depends on connected habitat corridors that also benefit many other animals.",
          look: "Large round tracks without claw marks, scrape piles, camera-trap images, and rare tawny glimpses near dense cover at low light.",
          quiz: { q: "Why are habitat corridors important to panthers?", options: ["They connect large home ranges", "They create ocean waves", "They replace prey"], answer: 0, explanation: "Panthers need safe movement between habitat patches." }
        }
      ]
    },
    {
      id: "yellowstone",
      name: "Yellowstone Plateau",
      region: "United States",
      lat: 44.428,
      lon: -110.5885,
      biomeKey: "temperate",
      icon: "△",
      curated: true,
      summary: "A high-elevation network of forest, meadow, river, geothermal basin, and winter range shaped by snow and fire.",
      subtitle: "See how grazers, predators, scavengers, engineers, and seasonal movement remake the same landscape.",
      stats: [["Habitat", "Forest + meadow"], ["Rhythm", "Snow, fire, migration"], ["Field clue", "Read tracks and edges"]],
      habitat: [
        ["Seasons", "Snow depth and melt timing shift food and movement. Many animals descend, migrate, hibernate, or change diet."],
        ["Fire", "Burned patches open sunlight, release nutrients, and create a changing mosaic of young and old forest."],
        ["Rivers", "Riparian corridors provide willow, water, travel routes, and dense concentrations of tracks."],
        ["Geothermal", "Warm ground and mineral-rich water create unusual microhabitats, but most wildlife still depends on the broader plateau ecosystem."]
      ],
      species: [
        {
          id: "bison", common: "American bison", scientific: "Bison bison", icon: "🦬", group: "Mammal",
          diet: "Grass and sedges", activity: "Day and night", adaptation: "Cold tolerance and snow sweeping",
          curious: "A bison can swing its massive head through snow to expose buried grass.",
          explorer: "Herds move across meadows, river valleys, and winter ranges. Grazing, trampling, wallowing, and dung create habitat for many smaller organisms.",
          naturalist: "Bison bison is a large-bodied grazer whose movement and disturbance generate spatial heterogeneity in grassland and meadow systems.",
          role: "Bison are ecosystem shapers: they crop plants, fertilize soil, make dust wallows, and create short-grass feeding patches.",
          look: "Deep two-part hoofprints, wool caught on trees, oval wallows, broad trails, and dark herds standing out against snow or grass.",
          quiz: { q: "What is a bison wallow?", options: ["A shallow disturbed soil basin", "A tree nest", "An underwater cave"], answer: 0, explanation: "Repeated rolling creates bare depressions used by other organisms." }
        },
        {
          id: "gray-wolf", common: "Gray wolf", scientific: "Canis lupus", icon: "🐺", group: "Mammal",
          diet: "Carnivore", activity: "Flexible", adaptation: "Endurance and cooperation",
          curious: "Wolves can travel many kilometers in a day, reading scent and tracks across a territory far larger than one valley.",
          explorer: "Packs are family groups. Cooperation helps them defend space, raise pups, and hunt prey that would be difficult for one wolf alone.",
          naturalist: "Canis lupus exhibits flexible social and foraging ecology. Pack size, prey selection, and territory use vary through time and among landscapes.",
          role: "Wolves influence prey behavior and abundance, provide carcasses for scavengers, and interact competitively with other predators.",
          look: "Large dog-like tracks in a direct line, long-distance howls, scent marks, and coordinated travel along roads, ridges, and frozen waterways.",
          quiz: { q: "What is a wolf pack usually centered around?", options: ["A family group", "A coral colony", "A migrating insect swarm"], answer: 0, explanation: "Packs commonly include a breeding pair and related offspring." }
        },
        {
          id: "grizzly", common: "Grizzly bear", scientific: "Ursus arctos horribilis", icon: "🐻", group: "Mammal",
          diet: "Omnivore", activity: "Flexible", adaptation: "Seasonal diet switching",
          curious: "A grizzly’s menu can shift from roots and insects to fish, berries, carcasses, or mammals as seasons change.",
          explorer: "Powerful forelimbs dig for roots and rodents. Bears spend much of the active season finding enough energy to support winter denning.",
          naturalist: "Ursus arctos is an omnivore with highly variable diets and home ranges. Food abundance, human activity, and season shape movement.",
          role: "Bears move nutrients, disperse seeds, disturb soil, and open carcasses used by smaller scavengers.",
          look: "A shoulder hump, dished facial profile, long front claws, overturned rocks and logs, digging sites, and large five-toed tracks.",
          quiz: { q: "Why does a grizzly’s diet change through the year?", options: ["Different foods become available", "Its teeth disappear", "It must eat only one color"], answer: 0, explanation: "Seasonal landscapes offer different foods at different times." }
        },
        {
          id: "beaver", common: "North American beaver", scientific: "Castor canadensis", icon: "🦫", group: "Mammal",
          diet: "Bark, twigs, aquatic plants", activity: "Dusk and night", adaptation: "Dam and lodge building",
          curious: "A beaver can turn a narrow stream into a pond complex used by fish, frogs, insects, birds, and moose.",
          explorer: "Cut branches, mud, stones, and repeated repairs slow water. The resulting ponds trap sediment and raise local water tables.",
          naturalist: "Castor canadensis is a keystone ecosystem engineer whose impoundments alter hydrology, geomorphology, vegetation, and habitat connectivity.",
          role: "Beaver wetlands store water, create edge habitat, and diversify stream channels—although their effects vary with valley shape and flow.",
          look: "Chisel-cut stumps, peeled sticks, dams, lodges, muddy slides, and a loud tail slap when a beaver dives.",
          quiz: { q: "What major environmental feature can a beaver create?", options: ["A pond and wetland complex", "A volcano", "A coral atoll"], answer: 0, explanation: "Dams slow streams and expand water across the valley floor." }
        },
        {
          id: "common-raven", common: "Common raven", scientific: "Corvus corax", icon: "🐦‍⬛", group: "Bird",
          diet: "Omnivore and scavenger", activity: "Daytime", adaptation: "Flexible intelligence",
          curious: "Ravens remember places, watch other animals, and solve new problems with remarkable flexibility.",
          explorer: "They investigate carcasses, follow predators, cache food, play in wind, and use a broad vocabulary of calls and gestures.",
          naturalist: "Corvus corax combines complex social cognition with opportunistic foraging. Individuals learn from direct experience and from other animals.",
          role: "Ravens rapidly redistribute carrion and food scraps while signaling opportunities to other scavengers.",
          look: "A wedge-shaped tail, shaggy throat, deep croaks, pairs soaring over ridges, and playful rolls or object manipulation.",
          quiz: { q: "Which trait helps ravens exploit changing food sources?", options: ["Behavioral flexibility", "Living only underwater", "Having no memory"], answer: 0, explanation: "Learning and problem-solving help ravens use new opportunities." }
        }
      ]
    },
    {
      id: "sonoran",
      name: "Sonoran Desert",
      region: "Arizona & Sonora",
      lat: 31.9,
      lon: -112.1,
      biomeKey: "desert",
      icon: "☼",
      curated: true,
      summary: "A biologically rich desert where summer heat, winter rain, monsoon storms, and flowering cacti create multiple seasons of opportunity.",
      subtitle: "Discover how water storage, nocturnal timing, pollination, and burrows make extreme heat livable.",
      stats: [["Habitat", "Desert scrub"], ["Rhythm", "Two rainy seasons"], ["Field clue", "Explore at dawn"]],
      habitat: [
        ["Timing", "Many animals avoid midday heat by being active at night, dawn, dusk, or during brief cool periods after rain."],
        ["Storage", "Succulent stems, underground caches, concentrated urine, and low metabolic rates all stretch limited water."],
        ["Nurse plants", "Young cacti often establish beneath shrubs or trees that provide shade and more moderate temperatures."],
        ["Bloom pulses", "Flowers and fruit create short-lived resource booms that draw bats, birds, insects, mammals, and reptiles."]
      ],
      species: [
        {
          id: "saguaro", common: "Saguaro cactus", scientific: "Carnegiea gigantea", icon: "🌵", group: "Plant",
          diet: "Sunlight, water, minerals", activity: "Year-round", adaptation: "Expandable water-storing stem",
          curious: "After rain, a saguaro’s pleated stem can expand as it stores water for drier months.",
          explorer: "A waxy surface limits water loss, a shallow root network captures brief rain, and white flowers feed night and day pollinators.",
          naturalist: "Carnegiea gigantea is a long-lived columnar cactus with strong age-dependent relationships to nurse plants, cavity nesters, and fruit consumers.",
          role: "Saguaros provide nectar, pollen, fruit, shade, lookout posts, and nest cavities—vertical habitat in an otherwise low landscape.",
          look: "Pleated green columns, old woodpecker cavities, white flowers near stem tops, red summer fruit, and seedlings tucked beneath shrubs.",
          quiz: { q: "Why is the stem pleated?", options: ["It can expand after rain", "It acts as a propeller", "It catches fish"], answer: 0, explanation: "Expandable tissue stores water without splitting." }
        },
        {
          id: "gila-monster", common: "Gila monster", scientific: "Heloderma suspectum", icon: "🦎", group: "Reptile",
          diet: "Eggs and small vertebrates", activity: "Seasonal, often dawn/dusk", adaptation: "Energy storage and venom",
          curious: "A Gila monster stores energy in its thick tail and may spend much of the year sheltered underground.",
          explorer: "Its low-energy lifestyle suits a landscape where meals are unpredictable. It emerges most when temperatures and moisture are favorable.",
          naturalist: "Heloderma suspectum is a venomous, slow-moving lizard that uses burrows and seasonal surface activity to manage heat and water balance.",
          role: "As a nest predator and prey item, it participates in desert food webs while relying on intact burrow-rich habitat.",
          look: "Beaded black-and-orange skin, thick tail, deliberate gait, and tracks near washes or burrows after mild weather.",
          quiz: { q: "Where does this lizard spend much of its time?", options: ["In sheltered burrows", "Flying over the ocean", "Inside coral branches"], answer: 0, explanation: "Underground refuges buffer heat and dryness." }
        },
        {
          id: "roadrunner", common: "Greater roadrunner", scientific: "Geococcyx californianus", icon: "🐦", group: "Bird",
          diet: "Insects and small animals", activity: "Daytime", adaptation: "Fast ground pursuit",
          curious: "A roadrunner can sprint after lizards and insects, using its long tail as a balance and steering surface.",
          explorer: "It warms in morning sun, hunts on foot, and may lower activity during the hottest part of the day.",
          naturalist: "Geococcyx californianus is a terrestrial cuckoo with opportunistic predatory behavior and physiological strategies for desert heat balance.",
          role: "Roadrunners consume insects, reptiles, rodents, and other small prey, linking many branches of the desert food web.",
          look: "A long tail, shaggy crest, blue-and-orange facial skin, X-shaped tracks, and a low streak between shrubs.",
          quiz: { q: "How does a roadrunner catch much of its prey?", options: ["By running on the ground", "By filter feeding", "By grazing grass"], answer: 0, explanation: "It is an agile terrestrial hunter." }
        },
        {
          id: "lesser-long-nosed-bat", common: "Lesser long-nosed bat", scientific: "Leptonycteris yerbabuenae", icon: "🦇", group: "Mammal",
          diet: "Nectar, pollen, fruit", activity: "Night", adaptation: "Long muzzle and hovering flight",
          curious: "A nectar bat can dust its face with pollen while drinking from a cactus flower, then carry that pollen to the next plant.",
          explorer: "Seasonal movements follow flowering and fruiting agaves and cacti. A long tongue and muzzle reach deep nectar sources.",
          naturalist: "Leptonycteris yerbabuenae is a migratory nectarivore and important pollinator whose movements track phenology across Mexico and the U.S. Southwest.",
          role: "By pollinating night-blooming plants and dispersing seeds, bats connect desert flower patches across long distances.",
          look: "Silhouettes hovering at saguaro or agave flowers after dark, rapid wingbeats, pollen-dusted faces, and feeding visits lasting only seconds.",
          quiz: { q: "What service does the bat provide to many desert plants?", options: ["Pollination", "Dam building", "Snow removal"], answer: 0, explanation: "Pollen transfers between flowers during nectar feeding." }
        },
        {
          id: "coyote", common: "Coyote", scientific: "Canis latrans", icon: "🐺", group: "Mammal",
          diet: "Flexible omnivore", activity: "Often dusk and night", adaptation: "Behavioral flexibility",
          curious: "A coyote can switch foods, travel routes, and activity times as conditions change.",
          explorer: "It eats rodents, rabbits, fruit, insects, carrion, and more. Flexible behavior lets coyotes use desert, grassland, farmland, and cities.",
          naturalist: "Canis latrans exhibits broad dietary and habitat plasticity. Social organization ranges from solitary foraging to territorial family groups.",
          role: "Coyotes regulate small-prey populations, disperse seeds through fruit eating, and provide carrion and competition within the predator guild.",
          look: "Narrow oval tracks with claw marks, straight travel lines, pointed ears, black-tipped tail, and yips or group howls after dark.",
          quiz: { q: "Which trait helps coyotes live in many environments?", options: ["Flexible diet and behavior", "A dependence on coral", "Eating only one plant"], answer: 0, explanation: "Adaptability lets coyotes respond to changing opportunities." }
        }
      ]
    }
  ];

  const CONTENT = window.WILDATLAS_CONTENT || { speciesPhotos: {}, extraLocations: [], speciesAdditions: {} };
  const HABITAT_EXTRAS = window.WILDATLAS_HABITAT || {};
  const PLACE_GAZETTEER = (window.WILDATLAS_PLACES && window.WILDATLAS_PLACES.places) || [];
  if (Array.isArray(CONTENT.extraLocations) && CONTENT.extraLocations.length) {
    LOCATIONS.push(...CONTENT.extraLocations);
  }
  const SPECIES_PHOTOS = CONTENT.speciesPhotos || {};
  const SPECIES_ADDITIONS = CONTENT.speciesAdditions || {};
  const BIOME_HABITAT_DEFAULTS = {
    rainforest: {
      climate: "Hot and humid, with frequent rain and short dry spells depending on region.",
      fieldcraft: "Start with sound at dawn, then scan fruiting trees and river edges."
    },
    savanna: {
      climate: "Warm year-round, with a sharp contrast between rainy and dry seasons.",
      fieldcraft: "Use the horizon first, then read tracks, dung, and dust for recent movement."
    },
    coral: {
      climate: "Warm seas, strong light, and sensitivity to heat and water quality.",
      fieldcraft: "Move slowly, watch cleaning stations, and notice partnerships on living coral heads."
    },
    arctic: {
      climate: "Long cold seasons, brief intense summers, and light that can last all day or barely appear.",
      fieldcraft: "Scan ice edges and bird cliffs; keep respectful distance from marine mammals."
    },
    islands: {
      climate: "Ocean-buffered climates that still swing with wind, drought, and storm seasons.",
      fieldcraft: "Compare neighboring islands and look for endemic specialists in small ranges."
    },
    wetlands: {
      climate: "Water level, salinity, and flood timing matter as much as air temperature.",
      fieldcraft: "Read water depth and tide/flood stage before you interpret bird numbers."
    },
    temperate: {
      climate: "Distinct seasons with spring growth, summer insects, autumn fruit, and winter scarcity.",
      fieldcraft: "Walk edges—streams, meadows, ridgelines—where habitats mix."
    },
    desert: {
      climate: "High sun, scarce water, and activity windows shaped by fog, night cool, or rare rain.",
      fieldcraft: "Go early or late; look for shade, blooms, burrows, and wash lines."
    }
  };
  LOCATIONS.forEach((location) => {
    const extras = SPECIES_ADDITIONS[location.id];
    if (Array.isArray(extras) && extras.length) {
      const have = new Set(location.species.map((species) => species.id));
      extras.forEach((species) => {
        if (!have.has(species.id)) location.species.push(species);
      });
    }
    location.species.forEach((species) => {
      const media = SPECIES_PHOTOS[species.id];
      if (media) {
        if (!species.photo) species.photo = media.photo;
        if (!species.photoCredit) species.photoCredit = media.photoCredit;
        if (!species.sourceUrl) species.sourceUrl = media.sourceUrl;
        if (!species.taxonId) species.taxonId = media.taxonId;
      }
      if (species.photo) species.photo = upgradePhotoUrl(species.photo);
    });
    const habitatExtra = HABITAT_EXTRAS[location.id];
    const biomeDefaults = BIOME_HABITAT_DEFAULTS[location.biomeKey] || {};
    if (habitatExtra?.lens) location.lens = habitatExtra.lens;
    location.climate = habitatExtra?.climate || location.climate || biomeDefaults.climate || "";
    location.fieldcraft = habitatExtra?.fieldcraft || location.fieldcraft || biomeDefaults.fieldcraft || "";
    if (!Array.isArray(location.habitat)) location.habitat = [];
    if (Array.isArray(habitatExtra?.cards)) {
      const have = new Set(location.habitat.map((card) => card[0]));
      habitatExtra.cards.forEach((card) => {
        if (!have.has(card[0])) location.habitat.push(card);
      });
    }
  });

  const LOCATION_BY_ID = new Map(LOCATIONS.map((location) => [location.id, location]));
  const SPECIES_INDEX = new Map();
  const SPECIES_BY_TAXON = new Map();
  const SPECIES_BY_SCIENTIFIC = new Map();
  LOCATIONS.forEach((location) => location.species.forEach((species) => {
    SPECIES_INDEX.set(species.id, { species, location });
    if (species.taxonId != null) SPECIES_BY_TAXON.set(String(species.taxonId), { species, location });
    if (species.scientific) SPECIES_BY_SCIENTIFIC.set(species.scientific.trim().toLowerCase(), { species, location });
  }));

  function upgradePhotoUrl(url) {
    if (!url || typeof url !== "string") return url;
    return url
      .replace(/\/(square|small|medium|thumb)\.(jpe?g|png|webp)(\?.*)?$/i, "/large.$2$3")
      .replace(/\/(square|small|medium|thumb)\//i, "/large/");
  }

  function preferPhoto(...candidates) {
    for (const candidate of candidates) {
      if (candidate) return upgradePhotoUrl(candidate);
    }
    return "";
  }

  /** Merge card/live/journal clicks with curated encyclopedia entries from our data. */
  function resolveSpeciesRecord(incoming) {
    if (!incoming) return incoming;
    let match = SPECIES_INDEX.get(incoming.id) || null;
    if (!match && incoming.taxonId != null) match = SPECIES_BY_TAXON.get(String(incoming.taxonId)) || null;
    if (!match && incoming.scientific) {
      match = SPECIES_BY_SCIENTIFIC.get(String(incoming.scientific).trim().toLowerCase()) || null;
    }
    const media = SPECIES_PHOTOS[incoming.id] || (match ? SPECIES_PHOTOS[match.species.id] : null) || null;
    const curated = match?.species || null;
    const location = incoming.parentLocation || match?.location || state.currentLocation;
    const merged = {
      ...incoming,
      parentLocation: location,
      fromCatalog: Boolean(curated),
      count: incoming.count,
      live: Boolean(incoming.live),
    };
    if (curated) {
      ["id", "common", "scientific", "icon", "group", "diet", "activity", "adaptation", "curious", "explorer", "naturalist", "role", "look", "quiz"].forEach((key) => {
        if (curated[key] != null && curated[key] !== "") merged[key] = curated[key];
      });
      merged.id = curated.id;
    }
    merged.photo = preferPhoto(curated?.photo, media?.photo, incoming.photo, location?.image);
    merged.photoCredit = curated?.photoCredit || media?.photoCredit || incoming.photoCredit || "";
    merged.sourceUrl = curated?.sourceUrl || media?.sourceUrl || incoming.sourceUrl || null;
    merged.taxonId = curated?.taxonId || media?.taxonId || incoming.taxonId || null;
    return merged;
  }

  const els = {
    canvas: $("#globeCanvas"),
    markerLayer: $("#markerLayer"),
    heroCopy: $("#heroCopy"),
    placeCard: $("#placeCard"),
    placeImage: $("#placeImage"),
    placeImageBadge: $("#placeImageBadge"),
    placeBiome: $("#placeBiome"),
    placeCoords: $("#placeCoords"),
    biomeDot: $("#biomeDot"),
    placeName: $("#placeName"),
    placeRegion: $("#placeRegion"),
    placeSummary: $("#placeSummary"),
    placeWeather: $("#placeWeather"),
    placeStats: $("#placeStats"),
    savePlaceButton: $("#savePlaceButton"),
    openGuideButton: $("#openGuideButton"),
    guidePanel: $("#guidePanel"),
    guideHero: $("#guideHero"),
    guideEyebrow: $("#guideEyebrow"),
    guideTitle: $("#guideTitle"),
    guideSubtitle: $("#guideSubtitle"),
    guideMeta: $("#guideMeta"),
    guideContent: $("#guideContent"),
    syncLabel: $("#syncLabel"),
    refreshLiveSpecies: $("#refreshLiveSpecies"),
    radiusSelect: $("#radiusSelect"),
    searchOverlay: $("#searchOverlay"),
    searchInput: $("#searchInput"),
    searchResults: $("#searchResults"),
    searchStatus: $("#searchStatus"),
    journeyList: $("#journeyList"),
    profilePopover: $("#profilePopover"),
    profileButton: $("#profileButton"),
    learningLevel: $("#learningLevel"),
    profileLevelLabel: $("#profileLevelLabel"),
    speciesOverlay: $("#speciesOverlay"),
    speciesVisual: $("#speciesVisual"),
    speciesPhoto: $("#speciesPhoto"),
    speciesBigIcon: $("#speciesBigIcon"),
    speciesGroup: $("#speciesGroup"),
    speciesName: $("#speciesName"),
    speciesScientific: $("#speciesScientific"),
    speciesLede: $("#speciesLede"),
    speciesFacts: $("#speciesFacts"),
    speciesRole: $("#speciesRole"),
    speciesLook: $("#speciesLook"),
    miniQuiz: $("#miniQuiz"),
    photoCredit: $("#photoCredit"),
    personalizedBadge: $("#personalizedBadge"),
    saveSpeciesButton: $("#saveSpeciesButton"),
    journalOverlay: $("#journalOverlay"),
    journalSummary: $("#journalSummary"),
    journalContent: $("#journalContent"),
    journalCount: $("#journalCount"),
    aboutOverlay: $("#aboutOverlay"),
    toast: $("#toast"),
    xpValue: $("#xpValue"),
    streakValue: $("#streakValue"),
    discoveriesValue: $("#discoveriesValue"),
    questProgressLabel: $("#questProgressLabel"),
    questProgressBar: $("#questProgressBar")
  };

  const defaultProgress = {
    xp: 0,
    streak: 1,
    lastVisit: null,
    visitedLocations: [],
    openedSpecies: [],
    completedQuizzes: [],
    savedLocations: [],
    savedSpecies: [],
    prefs: { level: "explorer", interests: ["Mammal"] }
  };

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem("wildatlas-progress-v1") || "null");
      return { ...defaultProgress, ...(parsed || {}), prefs: { ...defaultProgress.prefs, ...((parsed || {}).prefs || {}) } };
    } catch {
      return structuredClone(defaultProgress);
    }
  }

  const state = {
    currentLocation: LOCATIONS[0],
    currentSpecies: null,
    guideTab: "species",
    liveCache: new Map(),
    liveStatus: new Map(),
    weatherCache: new Map(),
    weatherStatus: new Map(),
    speciesDisplay: new Map(),
    progress: readProgress(),
    searchAbort: null,
    speciesAbort: null,
    weatherAbort: null,
    searchTimer: null,
    toastTimer: null,
    guideOpen: false,
    userInteracted: false,
    overlayReturnFocus: new Map()
  };

  const WEATHER_CODES = {
    0: ["Clear sky", "☀"],
    1: ["Mainly clear", "🌤"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁"],
    45: ["Fog", "🌫"],
    48: ["Rime fog", "🌫"],
    51: ["Light drizzle", "🌦"],
    53: ["Drizzle", "🌦"],
    55: ["Heavy drizzle", "🌧"],
    56: ["Freezing drizzle", "🌧"],
    57: ["Heavy freezing drizzle", "🌧"],
    61: ["Light rain", "🌧"],
    63: ["Rain", "🌧"],
    65: ["Heavy rain", "🌧"],
    66: ["Freezing rain", "🌧"],
    67: ["Heavy freezing rain", "🌧"],
    71: ["Light snow", "🌨"],
    73: ["Snow", "🌨"],
    75: ["Heavy snow", "❄"],
    77: ["Snow grains", "🌨"],
    80: ["Rain showers", "🌦"],
    81: ["Rain showers", "🌧"],
    82: ["Violent rain showers", "🌧"],
    85: ["Snow showers", "🌨"],
    86: ["Heavy snow showers", "❄"],
    95: ["Thunderstorm", "⛈"],
    96: ["Thunderstorm with hail", "⛈"],
    99: ["Thunderstorm with hail", "⛈"]
  };

  function weatherKey(location) {
    return `${Number(location.lat).toFixed(2)},${Number(location.lon).toFixed(2)}`;
  }

  function weatherLabel(code) {
    return WEATHER_CODES[code] || ["Local conditions", "◌"];
  }

  function formatWindDir(degrees) {
    if (!Number.isFinite(degrees)) return "";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(((degrees % 360) / 45)) % 8];
  }

  function formatDayLabel(isoDate, index) {
    if (!isoDate) return index === 0 ? "Today" : "Later";
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";
    const date = new Date(`${isoDate}T12:00:00`);
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }

  function writeProgress() {
    try {
      localStorage.setItem("wildatlas-progress-v1", JSON.stringify(state.progress));
    } catch {
      // The app remains usable if storage is unavailable.
    }
    updateProgressUI();
  }

  function localDateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function updateStreak() {
    const today = localDateKey();
    if (!state.progress.lastVisit) {
      state.progress.lastVisit = today;
      state.progress.streak = Math.max(1, state.progress.streak || 1);
      writeProgress();
      return;
    }
    if (state.progress.lastVisit === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    state.progress.streak = state.progress.lastVisit === localDateKey(yesterday) ? (state.progress.streak || 1) + 1 : 1;
    state.progress.lastVisit = today;
    writeProgress();
  }

  function updateProgressUI() {
    els.xpValue.textContent = state.progress.xp || 0;
    els.streakValue.textContent = state.progress.streak || 1;
    els.discoveriesValue.textContent = state.progress.visitedLocations.length;
    const quest = Math.min(3, state.progress.openedSpecies.length);
    els.questProgressLabel.textContent = `${quest} / 3`;
    els.questProgressBar.style.width = `${(quest / 3) * 100}%`;
    els.journalCount.textContent = state.progress.savedLocations.length + state.progress.savedSpecies.length;
    els.profileLevelLabel.textContent = ({ curious: "Quick + visual", explorer: "Stories + context", naturalist: "Scientific detail" })[state.progress.prefs.level] || "Personalized";
  }

  function awardXP(amount, message) {
    state.progress.xp = (state.progress.xp || 0) + amount;
    writeProgress();
    if (message) showToast(`+${amount} XP · ${message}`);
  }

  function showToast(message, duration = 2600) {
    clearTimeout(state.toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    state.toastTimer = setTimeout(() => els.toast.classList.remove("show"), duration);
  }

  function formatCoords(lat, lon) {
    const latLabel = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`;
    const lonLabel = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? "E" : "W"}`;
    return `${latLabel}, ${lonLabel}`;
  }

  function normalizeAngle(angle) {
    let value = angle;
    while (value > Math.PI) value -= Math.PI * 2;
    while (value < -Math.PI) value += Math.PI * 2;
    return value;
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function nearbyPlacesFor(location, { radiusKm = 480, limit = 8 } = {}) {
    if (!location) return [];
    return PLACE_GAZETTEER
      .map((place) => ({ ...place, km: haversineKm(location.lat, location.lon, place.lat, place.lon) }))
      .filter((place) => place.km <= radiusKm && place.name.toLowerCase() !== String(location.name || "").toLowerCase())
      .sort((a, b) => a.km - b.km || a.rank - b.rank)
      .slice(0, limit);
  }

  class GlobeEngine {
    constructor(canvas, markerLayer, locations, onPick, onMarker, onPlace) {
      this.canvas = canvas;
      this.markerLayer = markerLayer;
      this.locations = locations;
      this.places = PLACE_GAZETTEER;
      this.onPick = onPick;
      this.onMarker = onMarker;
      this.onPlace = onPlace;
      this.gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
      this.fov = 42 * DEG;
      this.distance = 3.0;
      this.targetDistance = 3.0;
      this.yaw = 0.45;
      this.pitch = -0.08;
      this.targetYaw = this.yaw;
      this.targetPitch = this.pitch;
      this.focusing = false;
      this.dragging = false;
      this.velocityX = 0;
      this.velocityY = 0;
      this.lastFrame = performance.now();
      this.lastInteraction = performance.now();
      this.activePointers = new Map();
      this.markerNodes = new Map();
      this.placeNodes = new Map();
      this.textureSampler = null;
      this.selectedId = locations[0]?.id || null;
      this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!this.gl) {
        canvas.style.background = "radial-gradient(circle at 50% 50%, #17685f 0 18%, #0e3934 38%, transparent 39%)";
        showToast("WebGL is unavailable; the interface is running in map-free mode.", 4500);
        return;
      }
      try {
        this.initGL();
        this.createMarkers();
        this.createPlaceLabels();
        this.bindEvents();
        requestAnimationFrame((time) => this.animate(time));
      } catch (error) {
        console.error(error);
        showToast("The globe could not initialize, but the field guide is still available.", 4500);
      }
    }

    initGL() {
      const gl = this.gl;
      const vertexShaderSource = `
        attribute vec3 a_position;
        attribute vec3 a_normal;
        attribute vec2 a_uv;
        uniform mat4 u_projection;
        uniform float u_yaw;
        uniform float u_pitch;
        uniform float u_distance;
        varying vec2 v_uv;
        varying vec3 v_normal;
        vec3 rotateY(vec3 p, float a) {
          float c = cos(a); float s = sin(a);
          return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
        }
        vec3 rotateX(vec3 p, float a) {
          float c = cos(a); float s = sin(a);
          return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
        }
        void main() {
          vec3 world = rotateX(rotateY(a_position, u_yaw), u_pitch);
          v_normal = normalize(rotateX(rotateY(a_normal, u_yaw), u_pitch));
          v_uv = a_uv;
          gl_Position = u_projection * vec4(world.x, world.y, world.z - u_distance, 1.0);
        }
      `;
      const fragmentShaderSource = `
        precision mediump float;
        uniform sampler2D u_texture;
        uniform float u_textureReady;
        varying vec2 v_uv;
        varying vec3 v_normal;
        void main() {
          vec3 base = mix(vec3(0.04, 0.22, 0.24), texture2D(u_texture, v_uv).rgb, u_textureReady);
          vec3 lightDir = normalize(vec3(-0.55, 0.34, 0.78));
          float diffuse = max(dot(normalize(v_normal), lightDir), 0.0);
          float nightGlow = 0.25 + diffuse * 0.83;
          float facing = max(dot(normalize(v_normal), vec3(0.0, 0.0, 1.0)), 0.0);
          float rim = pow(1.0 - facing, 3.2);
          vec3 color = base * nightGlow;
          color += vec3(0.06, 0.39, 0.62) * rim * 0.85;
          color += vec3(0.1, 0.15, 0.12) * pow(diffuse, 5.0) * 0.18;
          gl_FragColor = vec4(color, 1.0);
        }
      `;
      this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
      gl.useProgram(this.program);

      const geometry = this.createSphereGeometry(72, 144);
      this.indexCount = geometry.indices.length;
      this.positionBuffer = this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(geometry.positions));
      this.normalBuffer = this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(geometry.normals));
      this.uvBuffer = this.createBuffer(gl.ARRAY_BUFFER, new Float32Array(geometry.uvs));
      this.indexBuffer = this.createBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometry.indices));

      this.locationsGL = {
        position: gl.getAttribLocation(this.program, "a_position"),
        normal: gl.getAttribLocation(this.program, "a_normal"),
        uv: gl.getAttribLocation(this.program, "a_uv"),
        projection: gl.getUniformLocation(this.program, "u_projection"),
        yaw: gl.getUniformLocation(this.program, "u_yaw"),
        pitch: gl.getUniformLocation(this.program, "u_pitch"),
        distance: gl.getUniformLocation(this.program, "u_distance"),
        texture: gl.getUniformLocation(this.program, "u_texture"),
        textureReady: gl.getUniformLocation(this.program, "u_textureReady")
      };

      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([11, 53, 54, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      this.textureReady = 0;

      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        this.textureReady = 1;
        const sampler = document.createElement("canvas");
        sampler.width = 1024;
        sampler.height = 512;
        const context = sampler.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, sampler.width, sampler.height);
        this.textureSampler = { canvas: sampler, context };
      };
      image.src = "assets/earth-blue-marble.png";

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clearColor(0, 0, 0, 0);
    }

    createShader(type, source) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message || "Shader compilation failed");
      }
      return shader;
    }

    createProgram(vertexSource, fragmentSource) {
      const gl = this.gl;
      const program = gl.createProgram();
      gl.attachShader(program, this.createShader(gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, this.createShader(gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
      return program;
    }

    createBuffer(target, data) {
      const buffer = this.gl.createBuffer();
      this.gl.bindBuffer(target, buffer);
      this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
      return buffer;
    }

    createSphereGeometry(latSegments, lonSegments) {
      const positions = [];
      const normals = [];
      const uvs = [];
      const indices = [];
      for (let y = 0; y <= latSegments; y += 1) {
        const v = y / latSegments;
        const lat = -Math.PI / 2 + v * Math.PI;
        const cosLat = Math.cos(lat);
        for (let x = 0; x <= lonSegments; x += 1) {
          const u = x / lonSegments;
          const lon = -Math.PI + u * Math.PI * 2;
          const px = cosLat * Math.sin(lon);
          const py = Math.sin(lat);
          const pz = cosLat * Math.cos(lon);
          positions.push(px, py, pz);
          normals.push(px, py, pz);
          uvs.push(u, v);
        }
      }
      const row = lonSegments + 1;
      for (let y = 0; y < latSegments; y += 1) {
        for (let x = 0; x < lonSegments; x += 1) {
          const a = y * row + x;
          const b = a + row;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      return { positions, normals, uvs, indices };
    }

    createMarkers() {
      this.markerLayer.querySelectorAll(".globe-marker, .place-label").forEach((node) => node.remove());
      this.markerNodes.clear();
      this.locations.forEach((location) => {
        const button = document.createElement("button");
        button.className = "globe-marker";
        button.type = "button";
        button.dataset.label = location.name;
        button.setAttribute("aria-label", `Explore ${location.name}`);
        button.style.setProperty("--marker-color", BIOMES[location.biomeKey].color);
        button.innerHTML = `<span class="pin-pulse"></span><span class="pin-core">${escapeHTML(location.icon)}</span>`;
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          this.lastInteraction = performance.now();
          this.onMarker(location);
        });
        this.markerLayer.appendChild(button);
        this.markerNodes.set(location.id, button);
      });
      this.setSelected(this.selectedId);
    }

    createPlaceLabels() {
      this.placeNodes.forEach((node) => node.remove());
      this.placeNodes.clear();
      this.places.forEach((place) => {
        const button = document.createElement("button");
        button.className = `place-label rank-${place.rank || 2}`;
        button.type = "button";
        button.dataset.rank = String(place.rank || 2);
        button.setAttribute("aria-label", `Explore near ${place.name}`);
        button.innerHTML = `<span class="place-dot"></span><span class="place-name">${escapeHTML(place.name)}</span>`;
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          this.lastInteraction = performance.now();
          if (this.onPlace) this.onPlace(place);
        });
        this.markerLayer.appendChild(button);
        this.placeNodes.set(place.id, button);
      });
    }

    placeZoomThreshold(rank) {
      if (rank <= 1) return 3.55;
      if (rank === 2) return 2.95;
      return 2.48;
    }

    bindEvents() {
      const canvas = this.canvas;
      canvas.addEventListener("pointerdown", (event) => {
        canvas.setPointerCapture(event.pointerId);
        this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        this.lastInteraction = performance.now();
        if (this.activePointers.size === 1) {
          this.dragging = true;
          this.didMove = false;
          this.dragStart = { x: event.clientX, y: event.clientY, yaw: this.yaw, pitch: this.pitch, time: performance.now() };
          this.lastPointer = { x: event.clientX, y: event.clientY, time: performance.now() };
        } else if (this.activePointers.size === 2) {
          const points = [...this.activePointers.values()];
          this.pinchStart = { distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y), zoom: this.targetDistance };
          this.didMove = true;
        }
      });

      canvas.addEventListener("pointermove", (event) => {
        if (!this.activePointers.has(event.pointerId)) return;
        this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (this.activePointers.size === 2 && this.pinchStart) {
          const points = [...this.activePointers.values()];
          const currentDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
          if (currentDistance > 10) this.setZoom(this.pinchStart.zoom * (this.pinchStart.distance / currentDistance));
          return;
        }
        if (!this.dragging || !this.dragStart) return;
        const dx = event.clientX - this.dragStart.x;
        const dy = event.clientY - this.dragStart.y;
        if (Math.hypot(dx, dy) > 4) this.didMove = true;
        this.focusing = false;
        this.yaw = this.dragStart.yaw + dx * 0.006;
        this.pitch = clamp(this.dragStart.pitch + dy * 0.0052, -1.48, 1.48);
        const now = performance.now();
        const dt = Math.max(10, now - this.lastPointer.time);
        this.velocityX = ((event.clientX - this.lastPointer.x) * 0.006) / (dt / 16.67);
        this.velocityY = ((event.clientY - this.lastPointer.y) * 0.0052) / (dt / 16.67);
        this.lastPointer = { x: event.clientX, y: event.clientY, time: now };
      });

      const endPointer = (event) => {
        const wasSingle = this.activePointers.size === 1;
        this.activePointers.delete(event.pointerId);
        if (this.activePointers.size < 2) this.pinchStart = null;
        if (wasSingle && this.dragStart && !this.didMove && performance.now() - this.dragStart.time < 600) {
          const picked = this.pick(event.clientX, event.clientY);
          if (picked) this.onPick(picked.lat, picked.lon);
        }
        if (this.activePointers.size === 0) {
          this.dragging = false;
          this.dragStart = null;
        }
      };
      canvas.addEventListener("pointerup", endPointer);
      canvas.addEventListener("pointercancel", endPointer);
      canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        this.lastInteraction = performance.now();
        this.setZoom(this.targetDistance * Math.exp(event.deltaY * 0.0011));
      }, { passive: false });
    }

    perspectiveMatrix(aspect) {
      const f = 1 / Math.tan(this.fov / 2);
      const near = 0.1;
      const far = 100;
      const nf = 1 / (near - far);
      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
      ]);
    }

    rotateY(point, angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { x: c * point.x + s * point.z, y: point.y, z: -s * point.x + c * point.z };
    }

    rotateX(point, angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { x: point.x, y: c * point.y - s * point.z, z: s * point.y + c * point.z };
    }

    latLonPoint(lat, lon) {
      const latitude = lat * DEG;
      const longitude = lon * DEG;
      return { x: Math.cos(latitude) * Math.sin(longitude), y: Math.sin(latitude), z: Math.cos(latitude) * Math.cos(longitude) };
    }

    project(lat, lon) {
      const local = this.latLonPoint(lat, lon);
      const world = this.rotateX(this.rotateY(local, this.yaw), this.pitch);
      const rect = this.canvas.getBoundingClientRect();
      const aspect = rect.width / Math.max(1, rect.height);
      const f = 1 / Math.tan(this.fov / 2);
      const cameraZ = world.z - this.distance;
      const ndcX = (world.x * f / aspect) / -cameraZ;
      const ndcY = (world.y * f) / -cameraZ;
      return {
        x: (ndcX * 0.5 + 0.5) * rect.width,
        y: (-ndcY * 0.5 + 0.5) * rect.height,
        visible: world.z > 0.06 && Math.abs(ndcX) < 1.15 && Math.abs(ndcY) < 1.15,
        depth: world.z
      };
    }

    updateMarkers() {
      const zoomedIn = this.distance < 2.92;
      this.locations.forEach((location) => {
        const node = this.markerNodes.get(location.id);
        if (!node) return;
        const point = this.project(location.lat, location.lon);
        node.style.left = `${point.x}px`;
        node.style.top = `${point.y}px`;
        const opacity = point.visible ? clamp((point.depth + 0.05) * 1.45, 0.12, 1) : 0;
        node.style.opacity = opacity;
        node.style.pointerEvents = opacity > 0.22 ? "auto" : "none";
        node.setAttribute("aria-hidden", opacity > 0.22 ? "false" : "true");
        node.classList.toggle("label-open", zoomedIn && opacity > 0.35);
      });

      const candidates = [];
      this.places.forEach((place) => {
        const node = this.placeNodes.get(place.id);
        if (!node) return;
        const point = this.project(place.lat, place.lon);
        const rank = place.rank || 2;
        const withinZoom = this.distance <= this.placeZoomThreshold(rank);
        const visible = point.visible && withinZoom && point.depth > 0.12;
        if (!visible) {
          node.classList.remove("is-visible");
          node.style.opacity = "0";
          node.style.pointerEvents = "none";
          node.setAttribute("aria-hidden", "true");
          return;
        }
        candidates.push({ place, node, point, rank, score: point.depth * (rank === 1 ? 1.35 : rank === 2 ? 1.1 : 1) });
      });
      candidates.sort((a, b) => b.score - a.score);
      const maxLabels = this.distance < 2.35 ? 48 : this.distance < 2.8 ? 34 : 22;
      candidates.forEach((entry, index) => {
        const show = index < maxLabels;
        entry.node.style.left = `${entry.point.x}px`;
        entry.node.style.top = `${entry.point.y}px`;
        entry.node.style.opacity = show ? clamp((entry.point.depth + 0.08) * 1.2, 0.25, 0.95) : "0";
        entry.node.style.pointerEvents = show ? "auto" : "none";
        entry.node.classList.toggle("is-visible", show);
        entry.node.setAttribute("aria-hidden", show ? "false" : "true");
      });
    }

    pick(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;
      const aspect = rect.width / Math.max(1, rect.height);
      const f = 1 / Math.tan(this.fov / 2);
      let dir = { x: ndcX * aspect / f, y: ndcY / f, z: -1 };
      const length = Math.hypot(dir.x, dir.y, dir.z);
      dir = { x: dir.x / length, y: dir.y / length, z: dir.z / length };
      const origin = { x: 0, y: 0, z: this.distance };
      const b = 2 * (origin.x * dir.x + origin.y * dir.y + origin.z * dir.z);
      const c = this.distance * this.distance - 1;
      const discriminant = b * b - 4 * c;
      if (discriminant < 0) return null;
      const t = (-b - Math.sqrt(discriminant)) / 2;
      if (t < 0) return null;
      const world = { x: origin.x + dir.x * t, y: origin.y + dir.y * t, z: origin.z + dir.z * t };
      const unpitched = this.rotateX(world, -this.pitch);
      const local = this.rotateY(unpitched, -this.yaw);
      const lat = Math.asin(clamp(local.y, -1, 1)) / DEG;
      const lon = Math.atan2(local.x, local.z) / DEG;
      return { lat, lon };
    }

    inferBiome(lat, lon) {
      if (!this.textureSampler) return this.fallbackBiome(lat, lon);
      try {
        const { canvas, context } = this.textureSampler;
        const x = Math.floor((((lon + 180) % 360 + 360) % 360) / 360 * canvas.width);
        const y = Math.floor(clamp((90 - lat) / 180, 0, 0.9999) * canvas.height);
        const [r, g, b] = context.getImageData(x, y, 1, 1).data;
        const absLat = Math.abs(lat);
        const ocean = b > r * 1.12 && b > g * 1.05 && b > 72;
        if (ocean) return { key: absLat < 31 ? "coral" : absLat > 60 ? "arctic" : "coral", ocean: true, rgb: [r, g, b] };
        if (absLat > 62) return { key: "arctic", ocean: false, rgb: [r, g, b] };
        if (g > r * 1.08 && g > b * 0.86) return { key: absLat < 24 ? "rainforest" : "temperate", ocean: false, rgb: [r, g, b] };
        if (r > g * 1.23 && r > b * 1.25) return { key: absLat < 28 ? "desert" : "savanna", ocean: false, rgb: [r, g, b] };
        if (absLat < 16) return { key: "savanna", ocean: false, rgb: [r, g, b] };
        if (absLat < 33) return { key: "desert", ocean: false, rgb: [r, g, b] };
        return { key: "temperate", ocean: false, rgb: [r, g, b] };
      } catch {
        return this.fallbackBiome(lat, lon);
      }
    }

    fallbackBiome(lat) {
      const absLat = Math.abs(lat);
      if (absLat > 64) return { key: "arctic", ocean: false };
      if (absLat < 10) return { key: "rainforest", ocean: false };
      if (absLat < 24) return { key: "savanna", ocean: false };
      if (absLat < 34) return { key: "desert", ocean: false };
      return { key: "temperate", ocean: false };
    }

    setSelected(id) {
      this.selectedId = id;
      this.markerNodes.forEach((node, markerId) => node.classList.toggle("selected", markerId === id));
    }

    focusOn(lat, lon, distance = 2.55) {
      const desiredYaw = -lon * DEG;
      const delta = normalizeAngle(desiredYaw - this.yaw);
      this.targetYaw = this.yaw + delta;
      this.targetPitch = clamp(lat * DEG, -1.44, 1.44);
      this.targetDistance = clamp(distance, 1.92, 5.4);
      this.focusing = true;
      this.lastInteraction = performance.now();
    }

    reset() {
      this.targetYaw = 0.45;
      this.targetPitch = -0.08;
      this.targetDistance = 3.0;
      this.focusing = true;
      this.lastInteraction = performance.now();
    }

    rotateBy(yaw, pitch) {
      this.targetYaw = this.yaw + yaw;
      this.targetPitch = clamp(this.pitch + pitch, -1.48, 1.48);
      this.focusing = true;
      this.lastInteraction = performance.now();
    }

    setZoom(value) {
      this.targetDistance = clamp(value, 1.92, 5.4);
      this.lastInteraction = performance.now();
    }

    animate(time) {
      if (!this.gl) return;
      const dt = Math.min(0.05, Math.max(0.001, (time - this.lastFrame) / 1000));
      this.lastFrame = time;
      const ease = 1 - Math.pow(0.001, dt);
      this.distance += (this.targetDistance - this.distance) * ease;
      if (this.focusing) {
        this.yaw += (this.targetYaw - this.yaw) * ease;
        this.pitch += (this.targetPitch - this.pitch) * ease;
        if (Math.abs(this.targetYaw - this.yaw) < 0.001 && Math.abs(this.targetPitch - this.pitch) < 0.001) this.focusing = false;
      } else if (!this.dragging) {
        this.yaw += this.velocityX;
        this.pitch = clamp(this.pitch + this.velocityY, -1.48, 1.48);
        this.velocityX *= Math.pow(0.91, dt * 60);
        this.velocityY *= Math.pow(0.88, dt * 60);
        if (!this.reducedMotion && performance.now() - this.lastInteraction > 2200 && Math.abs(this.velocityX) < 0.0004) this.yaw += dt * 0.035;
      }
      this.render();
      this.updateMarkers();
      requestAnimationFrame((nextTime) => this.animate(nextTime));
    }

    render() {
      const gl = this.gl;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this.program);
      gl.uniformMatrix4fv(this.locationsGL.projection, false, this.perspectiveMatrix(width / height));
      gl.uniform1f(this.locationsGL.yaw, this.yaw);
      gl.uniform1f(this.locationsGL.pitch, this.pitch);
      gl.uniform1f(this.locationsGL.distance, this.distance);
      gl.uniform1f(this.locationsGL.textureReady, this.textureReady);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(this.locationsGL.texture, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.enableVertexAttribArray(this.locationsGL.position);
      gl.vertexAttribPointer(this.locationsGL.position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.enableVertexAttribArray(this.locationsGL.normal);
      gl.vertexAttribPointer(this.locationsGL.normal, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
      gl.enableVertexAttribArray(this.locationsGL.uv);
      gl.vertexAttribPointer(this.locationsGL.uv, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
    }
  }

  function makeFieldStation(lat, lon, name = null, region = null, source = "Dropped pin") {
    const inferred = globe?.inferBiome(lat, lon) || { key: Math.abs(lat) > 60 ? "arctic" : "temperate", ocean: false };
    const biome = BIOMES[inferred.key];
    const defaults = BIOME_HABITAT_DEFAULTS[inferred.key] || {};
    const isOcean = inferred.ocean;
    const stationName = name || (isOcean ? "Ocean field station" : "Wild field station");
    const nearby = nearbyPlacesFor({ lat, lon, name: stationName }, { radiusKm: 350, limit: 5 });
    const nearbyLine = nearby.length
      ? nearby.map((place) => `${place.name} (${Math.round(place.km)} km)`).join(" · ")
      : "Zoom the globe to reveal nearby town and city names around this point.";
    return {
      id: `field-${lat.toFixed(4)}-${lon.toFixed(4)}-${Date.now()}`,
      name: stationName,
      region: region || source,
      lat,
      lon,
      biomeKey: inferred.key,
      icon: "⌖",
      curated: false,
      dropped: source === "Dropped pin" || source === "Your location",
      source,
      climate: defaults.climate || "",
      fieldcraft: defaults.fieldcraft || "",
      summary: isOcean
        ? "A custom ocean station. Load nearby community observations to see which photographed species have been recorded around these coordinates."
        : `A custom ${biome.label.toLowerCase()} station near ${nearby[0]?.name || "this point"}. Load nearby community observations to build a living field guide.`,
      subtitle: "A live local field guide assembled from nearby public wildlife observations when a network connection is available.",
      stats: [["Lens", biome.label], ["Search", "25–100 km radius"], ["Source", "Community observations"]],
      habitat: [
        ["Estimated habitat", `The visual habitat lens is estimated from latitude and NASA earth imagery. It is a starting point, not a scientific land-cover classification.`],
        ["Climate reading", defaults.climate || "Local climate shifts with season, elevation, and ocean influence."],
        ["Nearby places", nearbyLine],
        ["Fieldcraft", defaults.fieldcraft || "Use multiple clues—habitat, season, tracks, and behavior—before drawing conclusions."],
        ["Nearby records", "Live species cards are based on public observations within the selected radius, so results reflect both wildlife and where people have looked."],
        ["Explore responsibly", "Use records to learn, then follow local access rules and keep sensitive wildlife locations private in the field."]
      ],
      species: []
    };
  }

  const globe = new GlobeEngine(
    els.canvas,
    els.markerLayer,
    LOCATIONS,
    (lat, lon) => {
      const location = makeFieldStation(lat, lon);
      selectLocation(location, { focus: false, award: true });
      state.userInteracted = true;
      els.heroCopy.classList.add("dimmed");
      showToast("Field station placed. Open the local guide to load nearby wildlife.");
    },
    (location) => {
      selectLocation(location, { focus: true, award: true });
      state.userInteracted = true;
      els.heroCopy.classList.add("dimmed");
    },
    (place) => {
      const location = makeFieldStation(place.lat, place.lon, place.name, place.region, "Town / city");
      selectLocation(location, { focus: true, openGuide: true, award: true });
      state.userInteracted = true;
      els.heroCopy.classList.add("dimmed");
      showToast(`${place.name}: local field station ready. Check Habitat for nearby places.`);
    }
  );

  function biomeFor(location) {
    return BIOMES[location.biomeKey] || BIOMES.temperate;
  }

  function locationCacheKey(location, radius = els.radiusSelect.value) {
    return `${location.id}:${radius}`;
  }

  function selectLocation(location, { focus = true, openGuide = false, award = true } = {}) {
    state.currentLocation = location;
    state.currentSpecies = null;
    state.guideTab = "species";
    if (focus && globe) globe.focusOn(location.lat, location.lon);
    if (globe) globe.setSelected(location.curated ? location.id : null);
    renderPlaceCard();
    renderGuideShell();
    loadWeather(location);
    if (!state.progress.visitedLocations.includes(location.id)) {
      state.progress.visitedLocations.push(location.id);
      if (award) awardXP(20, `Discovered ${location.name}`);
      else writeProgress();
    }
    els.placeCard.classList.remove("bump");
    requestAnimationFrame(() => els.placeCard.classList.add("bump"));
    if (openGuide) openGuidePanel();
  }

  function renderPlaceWeather() {
    if (!els.placeWeather) return;
    const location = state.currentLocation;
    const key = weatherKey(location);
    const status = state.weatherStatus.get(key);
    const weather = state.weatherCache.get(key);
    if (status === "loading" && !weather) {
      els.placeWeather.innerHTML = `<span class="weather-loading">Loading local weather…</span>`;
      return;
    }
    if (!weather) {
      els.placeWeather.innerHTML = `<span class="weather-error">${navigator.onLine ? "Weather unavailable right now." : "Weather needs a network connection."}</span>`;
      return;
    }
    const round = (value) => (Number.isFinite(value) ? Math.round(value) : "–");
    const [condition, icon] = weatherLabel(weather.current.code);
    const wind = `${round(weather.current.windSpeed)} km/h ${formatWindDir(weather.current.windDir)}`.trim();
    els.placeWeather.innerHTML = `
      <div class="weather-main">
        <span class="weather-temp">${round(weather.current.temp)}°</span>
        <span class="weather-condition">${escapeHTML(icon)} ${escapeHTML(condition)}</span>
      </div>
      <div class="weather-meta">
        <span>Feels <b>${round(weather.current.feelsLike)}°</b></span>
        <span>Humidity <b>${round(weather.current.humidity)}%</b></span>
        <span>Wind <b>${escapeHTML(wind)}</b></span>
        <span>Today <b>${round(weather.daily[0]?.max ?? weather.current.temp)}° / ${round(weather.daily[0]?.min ?? weather.current.temp)}°</b></span>
      </div>`;
  }

  function weatherPanelHTML(location) {
    const key = weatherKey(location);
    const status = state.weatherStatus.get(key);
    const weather = state.weatherCache.get(key);
    if (status === "loading" && !weather) {
      return `<section class="habitat-weather"><div class="habitat-weather-now"><small>LOCAL WEATHER</small><p>Loading forecast…</p></div></section>`;
    }
    if (!weather) {
      return `<section class="habitat-weather"><div class="habitat-weather-now"><small>LOCAL WEATHER</small><p>Weather is offline or unavailable for this point.</p><span>Open-Meteo supplies live conditions when the browser is online.</span></div></section>`;
    }
    const round = (value) => (Number.isFinite(value) ? Math.round(value) : "–");
    const [condition, icon] = weatherLabel(weather.current.code);
    const wind = `${round(weather.current.windSpeed)} km/h ${formatWindDir(weather.current.windDir)}`.trim();
    return `
      <section class="habitat-weather">
        <div class="habitat-weather-now">
          <small>LOCAL WEATHER · OPEN-METEO</small>
          <strong>${round(weather.current.temp)}°C</strong>
          <p>${escapeHTML(icon)} ${escapeHTML(condition)}</p>
          <span>Feels like ${round(weather.current.feelsLike)}° · Humidity ${round(weather.current.humidity)}% · Wind ${escapeHTML(wind)} · Clouds ${round(weather.current.clouds)}%</span>
          <span>Timezone ${escapeHTML(weather.timezone || "local")} · Updated for this exact coordinate.</span>
        </div>
        <div class="habitat-forecast">
          ${weather.daily.map((day, index) => {
            const [dayCondition] = weatherLabel(day.code);
            return `<div class="forecast-day"><b>${escapeHTML(formatDayLabel(day.date, index))}</b><em>${escapeHTML(dayCondition)}</em><span>${round(day.max)}° / ${round(day.min)}°</span></div>`;
          }).join("")}
        </div>
      </section>`;
  }

  async function loadWeather(location) {
    const key = weatherKey(location);
    if (state.weatherCache.has(key)) {
      state.weatherStatus.set(key, "ready");
      renderPlaceWeather();
      if (state.guideOpen && state.guideTab === "habitat" && state.currentLocation && weatherKey(state.currentLocation) === key) {
        renderHabitatGuide();
      }
      return;
    }
    if (!navigator.onLine) {
      state.weatherStatus.set(key, "error");
      renderPlaceWeather();
      return;
    }
    state.weatherAbort?.abort();
    const controller = new AbortController();
    state.weatherAbort = controller;
    state.weatherStatus.set(key, "loading");
    renderPlaceWeather();
    const params = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lon),
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,is_day",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
      timezone: "auto",
      forecast_days: "3"
    });
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);
      const data = await response.json();
      const current = data.current || {};
      const daily = data.daily || {};
      const weather = {
        timezone: data.timezone,
        current: {
          temp: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          precip: current.precipitation,
          code: current.weather_code,
          clouds: current.cloud_cover,
          windSpeed: current.wind_speed_10m,
          windDir: current.wind_direction_10m,
          isDay: current.is_day
        },
        daily: (daily.time || []).map((date, index) => ({
          date,
          code: daily.weather_code?.[index],
          max: daily.temperature_2m_max?.[index],
          min: daily.temperature_2m_min?.[index],
          precip: daily.precipitation_sum?.[index]
        }))
      };
      state.weatherCache.set(key, weather);
      state.weatherStatus.set(key, "ready");
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn(error);
        state.weatherStatus.set(key, "error");
      }
    } finally {
      if (state.currentLocation && weatherKey(state.currentLocation) === key) {
        renderPlaceWeather();
        if (state.guideOpen && state.guideTab === "habitat") renderHabitatGuide();
        renderGuideShellMetaWeather();
      }
    }
  }

  function renderGuideShellMetaWeather() {
    const location = state.currentLocation;
    if (!location) return;
    const biome = biomeFor(location);
    const weather = state.weatherCache.get(weatherKey(location));
    const chips = [biome.label, formatCoords(location.lat, location.lon)];
    if (weather) {
      const [condition] = weatherLabel(weather.current.code);
      chips.push(`${Math.round(weather.current.temp)}° ${condition}`);
    }
    chips.push(location.curated ? `${location.species.length} editor spotlights` : "Live observations available");
    els.guideMeta.innerHTML = chips.map((item) => `<span>${escapeHTML(item)}</span>`).join("");
  }

  function renderPlaceCard() {
    const location = state.currentLocation;
    const biome = biomeFor(location);
    els.placeImage.src = location.image || biome.image;
    els.placeImage.alt = `Stylized ${biome.label.toLowerCase()} habitat for ${location.name}`;
    els.placeImageBadge.textContent = location.curated ? "CURATED JOURNEY" : location.dropped ? "DROPPED FIELD STATION" : "LIVE PLACE SEARCH";
    els.placeBiome.textContent = biome.label;
    els.placeCoords.textContent = formatCoords(location.lat, location.lon);
    els.biomeDot.style.background = biome.color;
    els.biomeDot.style.color = biome.color;
    els.placeName.textContent = location.name;
    els.placeRegion.textContent = location.region;
    els.placeSummary.textContent = location.summary || biome.summary;
    els.placeStats.innerHTML = (location.stats || []).map(([label, value]) => `<span class="stat-chip"><strong>${escapeHTML(label)}</strong>${escapeHTML(value)}</span>`).join("");
    renderPlaceWeather();
    const saved = state.progress.savedLocations.some((entry) => entry.id === location.id);
    els.savePlaceButton.classList.toggle("saved", saved);
    els.savePlaceButton.textContent = saved ? "✓" : "＋";
    els.savePlaceButton.setAttribute("aria-label", saved ? "Remove location from field journal" : "Save location to field journal");
  }

  function renderGuideShell() {
    const location = state.currentLocation;
    const biome = biomeFor(location);
    els.guideHero.style.backgroundImage = `url("${location.image || biome.image}")`;
    els.guideEyebrow.textContent = location.curated ? "CURATED LOCAL FIELD GUIDE" : "CUSTOM LOCAL FIELD GUIDE";
    els.guideTitle.textContent = location.name;
    els.guideSubtitle.textContent = location.subtitle || biome.summary;
    renderGuideShellMetaWeather();
    updateSyncLabel();
    renderGuideTab();
  }

  function updateSyncLabel() {
    const key = locationCacheKey(state.currentLocation);
    const status = state.liveStatus.get(key);
    const cached = state.liveCache.get(key);
    els.refreshLiveSpecies.classList.toggle("loading", status === "loading");
    if (status === "loading") els.syncLabel.textContent = "Loading sightings…";
    else if (cached?.length) els.syncLabel.textContent = `${cached.length} live species loaded`;
    else els.syncLabel.textContent = "Load live sightings";
  }

  function openGuidePanel() {
    state.guideOpen = true;
    els.guidePanel.classList.add("open");
    els.guidePanel.setAttribute("aria-hidden", "false");
    renderGuideShell();
    if (!state.currentLocation.curated && !state.liveCache.has(locationCacheKey(state.currentLocation))) loadLiveSpecies(state.currentLocation, false);
    setTimeout(() => $("#closeGuide")?.focus(), 180);
  }

  function closeGuidePanel() {
    state.guideOpen = false;
    els.guidePanel.classList.remove("open");
    els.guidePanel.setAttribute("aria-hidden", "true");
  }

  function sortByInterests(speciesList) {
    const interests = new Set(state.progress.prefs.interests || []);
    return [...speciesList].sort((a, b) => Number(interests.has(b.group)) - Number(interests.has(a.group)) || (b.count || 0) - (a.count || 0));
  }

  function speciesCardHTML(species, location, live = false) {
    const resolved = resolveSpeciesRecord({ ...species, parentLocation: location });
    const image = preferPhoto(resolved.photo, location.image, biomeFor(location).image);
    const count = species.count ? `<span class="species-card-count">${species.count.toLocaleString()} observations</span>` : live ? `<span class="species-card-count">LIVE RECORD</span>` : "";
    return `
      <button class="species-card" type="button" data-species-id="${escapeHTML(species.id)}">
        <span class="species-card-media" style="background-image:url('${escapeHTML(image)}')"></span>
        ${count}
        <span class="species-card-icon" aria-hidden="true">${escapeHTML(resolved.icon || species.icon || "◌")}</span>
        <span class="species-card-copy">
          <small>${escapeHTML((resolved.group || species.group || "Species").toUpperCase())}${live ? " · LIVE" : ""}</small>
          <strong>${escapeHTML(resolved.common || species.common)}</strong>
          <em>${escapeHTML(resolved.scientific || species.scientific || "")}</em>
        </span>
      </button>
    `;
  }

  function renderSpeciesGuide() {
    const location = state.currentLocation;
    const radius = els.radiusSelect.value;
    const cacheKey = locationCacheKey(location, radius);
    const liveSpecies = state.liveCache.get(cacheKey) || [];
    const status = state.liveStatus.get(cacheKey);
    state.speciesDisplay.clear();
    let html = `
      <div class="content-intro">
        <div><h3>${location.curated ? "Signature neighbors" : "Wildlife near this point"}</h3><p>${location.curated ? "Editor-selected stories first; load live sightings for a changing local layer." : `Public observations within ${radius} km, prioritized by recorded species count.`}</p></div>
        <small>${escapeHTML(({ curious: "QUICK VISUAL LENS", explorer: "EXPLORER STORY LENS", naturalist: "NATURALIST DETAIL LENS" })[state.progress.prefs.level])}</small>
      </div>`;

    if (location.curated && location.species.length) {
      const curatedSpecies = sortByInterests(location.species);
      curatedSpecies.forEach((species) => state.speciesDisplay.set(species.id, { ...species, parentLocation: location }));
      html += `<div class="species-grid">${curatedSpecies.map((species) => speciesCardHTML(species, location)).join("")}</div>`;
    }

    if (status === "loading") {
      html += `<div class="live-banner"><span class="sync-dot"></span><span><strong>Scanning nearby records.</strong> Live species and attributed photos will appear here.</span></div><div class="species-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>`;
    } else if (liveSpecies.length) {
      const ordered = sortByInterests(liveSpecies);
      ordered.forEach((species) => state.speciesDisplay.set(species.id, { ...species, parentLocation: location }));
      html += `<div class="live-banner"><span class="sync-dot"></span><span><strong>Live community layer.</strong> These are photographed research-grade observations reported within ${radius} km. Observation effort is uneven.</span></div>`;
      if (location.curated) html += `<div class="content-intro"><div><h3>Recently recorded nearby</h3><p>Real photographs and observation counts from iNaturalist.</p></div><small>LIVE DATA</small></div>`;
      html += `<div class="species-grid">${ordered.map((species) => speciesCardHTML(species, location, true)).join("")}</div>`;
    } else if (!location.curated && status === "error") {
      html += `<div class="error-card"><strong>Live records could not load.</strong><br />The prototype needs an internet connection and API access for local sightings.<br /><button type="button" data-action="retry-live">Try again</button></div>`;
    } else if (!location.curated) {
      html += `<div class="error-card"><strong>Build this local field guide.</strong><br />Load nearby public wildlife observations and photos for this point.<br /><button type="button" data-action="retry-live">Load live sightings</button></div>`;
    }

    els.guideContent.innerHTML = html;
  }

  function renderHabitatGuide() {
    const location = state.currentLocation;
    const biome = biomeFor(location);
    const lens = location.lens || biome.lens;
    const climate = location.climate || BIOME_HABITAT_DEFAULTS[location.biomeKey]?.climate || "Season, latitude, and water shape this habitat’s daily rules.";
    const fieldcraft = location.fieldcraft || BIOME_HABITAT_DEFAULTS[location.biomeKey]?.fieldcraft || "Use habitat, season, and multiple field marks together.";
    const nearby = nearbyPlacesFor(location, { radiusKm: location.curated ? 520 : 350, limit: 8 });
    const cards = location.habitat || [];
    els.guideContent.innerHTML = `
      <div class="habitat-story">
        <div class="story-lede">${escapeHTML(lens)}</div>
        ${weatherPanelHTML(location)}
        <div class="habitat-meta-row">
          <div class="habitat-meta"><span>CLIMATE</span><strong>${escapeHTML(climate)}</strong></div>
          <div class="habitat-meta"><span>FIELDCRAFT</span><strong>${escapeHTML(fieldcraft)}</strong></div>
          <div class="habitat-meta"><span>BIOME</span><strong>${escapeHTML(biome.label)}</strong></div>
        </div>
        <div class="story-grid">
          ${cards.map(([title, copy], index) => `<article class="story-card"><span>${String(index + 1).padStart(2, "0")}</span><h4>${escapeHTML(title)}</h4><p>${escapeHTML(copy)}</p></article>`).join("")}
        </div>
        ${nearby.length ? `
          <section class="nearby-places">
            <div class="nearby-places-head">
              <small>NEARBY TOWNS & CITIES</small>
              <strong>Zoom the globe to reveal these labels on the map.</strong>
            </div>
            <div class="nearby-place-grid">
              ${nearby.map((place) => `
                <button type="button" class="nearby-place-chip" data-place-id="${escapeHTML(place.id)}">
                  <strong>${escapeHTML(place.name)}</strong>
                  <span>${escapeHTML(place.region)} · ${Math.round(place.km)} km</span>
                </button>`).join("")}
            </div>
          </section>` : ""}
      </div>`;
    $$(".nearby-place-chip", els.guideContent).forEach((chip) => {
      chip.addEventListener("click", () => {
        const place = PLACE_GAZETTEER.find((entry) => entry.id === chip.dataset.placeId);
        if (!place || !globe) return;
        globe.focusOn(place.lat, place.lon, 2.15);
        showToast(`${place.name} centered on the globe.`);
      });
    });
  }

  function renderMissionGuide() {
    const location = state.currentLocation;
    const targetSpecies = (location.species || []).slice(0, 3);
    els.guideContent.innerHTML = `
      <section class="mission-sheet">
        <p class="eyebrow"><span></span> TEN-MINUTE FIELD MISSION</p>
        <h3>Read ${escapeHTML(location.name)} like a naturalist.</h3>
        <p>Use three kinds of evidence: one body adaptation, one ecological relationship, and one clue you could notice without approaching wildlife.</p>
        <div class="mission-steps">
          <div class="mission-step"><b>1</b><span>Open ${escapeHTML(targetSpecies[0]?.common || "one species")} and identify a feature that fits this habitat.</span></div>
          <div class="mission-step"><b>2</b><span>Find a species that changes the habitat or moves nutrients, seeds, or energy.</span></div>
          <div class="mission-step"><b>3</b><span>Choose one track, sound, feeding sign, or movement pattern you could look for responsibly.</span></div>
        </div>
      </section>`;
  }

  function renderGuideTab() {
    $$(".guide-tabs button").forEach((button) => {
      const active = button.dataset.tab === state.guideTab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (state.guideTab === "habitat") renderHabitatGuide();
    else if (state.guideTab === "mission") renderMissionGuide();
    else renderSpeciesGuide();
  }

  function groupFromIconic(iconic = "") {
    return ({
      Aves: "Bird", Mammalia: "Mammal", Reptilia: "Reptile", Amphibia: "Amphibian",
      Actinopterygii: "Marine", Plantae: "Plant", Insecta: "Small life", Arachnida: "Small life",
      Mollusca: "Marine", Animalia: "Species", Fungi: "Fungi"
    })[iconic] || "Species";
  }

  function iconFromGroup(group) {
    return ({ Bird: "🐦", Mammal: "🐾", Reptile: "🦎", Amphibian: "🐸", Marine: "🐟", Plant: "🌿", "Small life": "🪲", Fungi: "🍄" })[group] || "◌";
  }

  function liveSpeciesFromResult(result, location) {
    const taxon = result.taxon || {};
    const group = groupFromIconic(taxon.iconic_taxon_name);
    const common = taxon.preferred_common_name || taxon.english_common_name || taxon.name || "Unidentified species";
    const scientific = taxon.name || "Scientific name unavailable";
    const photo = taxon.default_photo || {};
    return {
      id: `inat-${taxon.id || scientific.replace(/\W+/g, "-").toLowerCase()}`,
      taxonId: taxon.id,
      common,
      scientific,
      icon: iconFromGroup(group),
      group,
      count: result.count || 0,
      photo: preferPhoto(photo.large_url, photo.medium_url, photo.url, photo.square_url, biomeFor(location).image),
      photoCredit: photo.attribution || (photo.license_code ? `Photo license: ${photo.license_code}` : "Photo via iNaturalist"),
      sourceUrl: taxon.id ? `https://www.inaturalist.org/taxa/${taxon.id}` : null,
      diet: "See species source",
      activity: "Observation-dependent",
      adaptation: `${taxon.rank ? `${taxon.rank} record` : "Community record"}`,
      curious: `${common} has been photographed and identified by community naturalists near ${location.name}.`,
      explorer: `Community observers have contributed ${Number(result.count || 0).toLocaleString()} research-grade records matching this species within the selected search area. Use the photo as a field-mark starting point, then compare habitat, season, and behavior.`,
      naturalist: `${scientific} is represented in the nearby iNaturalist species-count query by ${Number(result.count || 0).toLocaleString()} research-grade observations. Counts reflect observation effort and filters, not a formal abundance estimate.`,
      role: "Every verified record adds one piece to the local biodiversity picture. The species’ ecological role depends on its life history; follow the scientific name to authoritative taxon-specific sources before making management conclusions.",
      look: "Compare overall shape, color pattern, habitat, behavior, and season. Never rely on one photograph alone for a difficult identification.",
      quiz: { q: "Which label is the scientific name?", options: [common, scientific, group], answer: 1, explanation: "Scientific names help connect records across languages and regions." },
      live: true
    };
  }

  async function loadLiveSpecies(location = state.currentLocation, manual = true) {
    const radius = els.radiusSelect.value;
    const key = locationCacheKey(location, radius);
    if (state.liveStatus.get(key) === "loading") return;
    if (!navigator.onLine) {
      state.liveStatus.set(key, "error");
      updateSyncLabel();
      renderGuideTab();
      if (manual) showToast("You appear to be offline. Curated guides still work.");
      return;
    }
    state.speciesAbort?.abort();
    const controller = new AbortController();
    state.speciesAbort = controller;
    state.liveStatus.set(key, "loading");
    updateSyncLabel();
    renderGuideTab();
    const timeout = setTimeout(() => controller.abort(), 16000);
    const params = new URLSearchParams({
      lat: String(location.lat),
      lng: String(location.lon),
      radius: String(radius),
      per_page: "18",
      quality_grade: "research",
      photos: "true",
      locale: "en"
    });
    try {
      const response = await fetch(`https://api.inaturalist.org/v1/observations/species_counts?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`iNaturalist returned ${response.status}`);
      const data = await response.json();
      const mapped = (data.results || []).map((result) => liveSpeciesFromResult(result, location)).filter((species) => species.photo);
      state.liveCache.set(key, mapped);
      state.liveStatus.set(key, "ready");
      if (manual) showToast(mapped.length ? `Loaded ${mapped.length} photographed species near ${location.name}.` : "No photographed research-grade records were returned for this radius.");
    } catch (error) {
      if (error.name !== "AbortError") console.warn(error);
      state.liveStatus.set(key, "error");
      if (manual) showToast("Live sightings could not load. The curated encyclopedia remains available.");
    } finally {
      clearTimeout(timeout);
      updateSyncLabel();
      if (state.currentLocation.id === location.id && state.guideOpen) renderGuideTab();
    }
  }

  function speciesLedeFor(species) {
    return species[state.progress.prefs.level] || species.explorer || species.curious || "Explore this species through its habitat, field marks, and ecological relationships.";
  }

  function openSpecies(species) {
    const resolved = resolveSpeciesRecord(species);
    state.currentSpecies = resolved;
    if (!state.progress.openedSpecies.includes(resolved.id)) {
      state.progress.openedSpecies.push(resolved.id);
      awardXP(10, `Opened ${resolved.common}`);
    }
    const location = resolved.parentLocation || state.currentLocation;
    const biome = biomeFor(location);
    const photoUrl = preferPhoto(resolved.photo, location.image, biome.image);
    const hasPhoto = Boolean(photoUrl);
    els.speciesVisual.classList.toggle("has-photo", hasPhoto);
    els.speciesVisual.style.backgroundImage = "";
    if (els.speciesPhoto) {
      els.speciesPhoto.src = photoUrl || "";
      els.speciesPhoto.alt = hasPhoto
        ? `${resolved.common}${resolved.scientific ? ` (${resolved.scientific})` : ""}`
        : "";
      els.speciesPhoto.hidden = !hasPhoto;
    }
    els.speciesBigIcon.textContent = resolved.icon || "◌";
    const sourceTag = resolved.fromCatalog
      ? (resolved.live ? " · CATALOG + LIVE PHOTO" : " · WILDATLAS CATALOG")
      : (resolved.live ? " · LIVE COMMUNITY RECORD" : "");
    els.speciesGroup.textContent = `${(resolved.group || "Species").toUpperCase()}${sourceTag}`;
    els.speciesName.textContent = resolved.common;
    els.speciesScientific.textContent = resolved.scientific || "";
    els.personalizedBadge.textContent = `${state.progress.prefs.level.toUpperCase()} LENS`;
    els.speciesLede.textContent = speciesLedeFor(resolved);
    els.speciesFacts.innerHTML = [
      ["Diet", resolved.diet || "Varies"],
      ["Activity", resolved.activity || "Varies"],
      ["Adaptation", resolved.adaptation || "Study the field marks"]
    ].map(([label, value]) => `<div class="fact-tile"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`).join("");
    els.speciesRole.textContent = resolved.role || "This species is one participant in a larger local food web and habitat network.";
    els.speciesLook.textContent = resolved.look || "Use multiple field marks, behavior, habitat, and season before making an identification.";
    const credit = resolved.photoCredit
      || (resolved.live ? "Photo and record via iNaturalist" : "WildAtlas catalog imagery");
    if (resolved.sourceUrl) {
      els.photoCredit.innerHTML = `${escapeHTML(credit)} · <a href="${escapeHTML(resolved.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`;
    } else {
      els.photoCredit.textContent = credit;
    }
    const saved = state.progress.savedSpecies.some((entry) => entry.id === resolved.id);
    els.saveSpeciesButton.classList.toggle("saved", saved);
    els.saveSpeciesButton.textContent = saved ? "★ Saved" : "☆ Save";
    renderQuiz(resolved);
    openOverlay("species");
    setTimeout(() => $("[data-close='species']", els.speciesOverlay)?.focus(), 50);
  }

  function renderQuiz(species) {
    const quiz = species.quiz;
    if (!quiz) {
      els.miniQuiz.innerHTML = "";
      return;
    }
    els.miniQuiz.innerHTML = `
      <small>ONE-TAP FIELD CHECK</small>
      <h4>${escapeHTML(quiz.q)}</h4>
      <div class="quiz-options">${quiz.options.map((option, index) => `<button type="button" data-quiz-index="${index}">${escapeHTML(option)}</button>`).join("")}</div>
      <p class="quiz-feedback" aria-live="polite"></p>`;
  }

  function toggleSaveLocation() {
    const location = state.currentLocation;
    const index = state.progress.savedLocations.findIndex((entry) => entry.id === location.id);
    if (index >= 0) {
      state.progress.savedLocations.splice(index, 1);
      showToast(`${location.name} removed from your journal.`);
    } else {
      state.progress.savedLocations.unshift({
        id: location.id, name: location.name, region: location.region, lat: location.lat, lon: location.lon,
        biomeKey: location.biomeKey, image: location.image || biomeFor(location).image, curated: location.curated,
        summary: location.summary, subtitle: location.subtitle, stats: location.stats, habitat: location.habitat, species: location.species || [], source: location.source
      });
      awardXP(5, `Saved ${location.name}`);
    }
    writeProgress();
    renderPlaceCard();
  }

  function toggleSaveSpecies() {
    const species = state.currentSpecies;
    if (!species) return;
    const index = state.progress.savedSpecies.findIndex((entry) => entry.id === species.id);
    if (index >= 0) {
      state.progress.savedSpecies.splice(index, 1);
      showToast(`${species.common} removed from your journal.`);
    } else {
      const location = species.parentLocation || state.currentLocation;
      state.progress.savedSpecies.unshift({ ...species, parentLocation: { id: location.id, name: location.name, region: location.region, lat: location.lat, lon: location.lon, biomeKey: location.biomeKey, image: location.image || biomeFor(location).image, curated: location.curated, summary: location.summary, subtitle: location.subtitle, stats: location.stats, habitat: location.habitat, species: location.species || [] } });
      awardXP(5, `Saved ${species.common}`);
    }
    writeProgress();
    const saved = state.progress.savedSpecies.some((entry) => entry.id === species.id);
    els.saveSpeciesButton.classList.toggle("saved", saved);
    els.saveSpeciesButton.textContent = saved ? "★ Saved" : "☆ Save";
  }

  function renderJournal() {
    const locations = state.progress.savedLocations;
    const species = state.progress.savedSpecies;
    els.journalSummary.innerHTML = `
      <div class="journal-stat"><strong>${locations.length}</strong><span>saved places</span></div>
      <div class="journal-stat"><strong>${species.length}</strong><span>saved species</span></div>
      <div class="journal-stat"><strong>${state.progress.xp}</strong><span>explorer XP</span></div>`;
    if (!locations.length && !species.length) {
      els.journalContent.innerHTML = `<div class="empty-journal"><strong>Your encyclopedia is ready to grow.</strong><br /><br />Save a place or species while exploring the globe.</div>`;
      return;
    }
    const locationHTML = locations.length ? `<section class="journal-section"><h3>Saved field stations</h3><div class="saved-grid">${locations.map((location) => `<button class="saved-card" data-journal-location="${escapeHTML(location.id)}" style="background-image:url('${escapeHTML(location.image || biomeFor(location).image)}')"><span>⌖</span><strong>${escapeHTML(location.name)}</strong><small>${escapeHTML(location.region)}</small></button>`).join("")}</div></section>` : "";
    const speciesHTML = species.length ? `<section class="journal-section"><h3>Personal species collection</h3><div class="saved-grid">${species.map((item) => `<button class="saved-card" data-journal-species="${escapeHTML(item.id)}" style="background-image:url('${escapeHTML(item.photo || item.parentLocation?.image || BIOMES.temperate.image)}')"><span>${escapeHTML(item.icon || "◌")}</span><strong>${escapeHTML(item.common)}</strong><small>${escapeHTML(item.scientific || "")}</small></button>`).join("")}</div></section>` : "";
    els.journalContent.innerHTML = locationHTML + speciesHTML;
  }

  function openJournal() {
    renderJournal();
    openOverlay("journal");
  }

  function renderFeaturedJourneys() {
    const featured = [
      LOCATION_BY_ID.get("madagascar"),
      LOCATION_BY_ID.get("sundarbans"),
      LOCATION_BY_ID.get("raja-ampat"),
      LOCATION_BY_ID.get("kakadu"),
      LOCATION_BY_ID.get("european-alps"),
      LOCATION_BY_ID.get("hawaii"),
      LOCATION_BY_ID.get("congo"),
      LOCATION_BY_ID.get("camargue")
    ].filter(Boolean);
    els.journeyList.innerHTML = featured.map((location) => `<button class="journey-card" data-journey="${location.id}" style="background-image:url('${biomeFor(location).image}')"><small>${escapeHTML(biomeFor(location).label.toUpperCase())}</small><strong>${escapeHTML(location.name)}</strong><span>${escapeHTML(location.region)}</span></button>`).join("");
  }

  function coordinateQuery(query) {
    const match = query.trim().match(/^(-?\d{1,2}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/);
    if (!match) return null;
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 ? { lat, lon } : null;
  }

  function renderSearchResults(query = "", livePlaces = [], loading = false) {
    const normalized = query.trim().toLowerCase();
    const coordinate = coordinateQuery(query);
    const matchingLocations = normalized
      ? LOCATIONS.filter((location) => `${location.name} ${location.region} ${biomeFor(location).label}`.toLowerCase().includes(normalized))
      : LOCATIONS.slice(0, 6);
    const matchingSpecies = normalized
      ? [...SPECIES_INDEX.values()].filter(({ species, location }) => `${species.common} ${species.scientific} ${species.group} ${location.name}`.toLowerCase().includes(normalized)).slice(0, 8)
      : [];
    const sections = [];
    if (coordinate) {
      sections.push(`<div class="result-group-label">COORDINATES</div><button class="result-row" data-result-type="coords" data-lat="${coordinate.lat}" data-lon="${coordinate.lon}"><span class="result-thumb">⌖</span><span class="result-copy"><strong>Build a field guide here</strong><span>${escapeHTML(formatCoords(coordinate.lat, coordinate.lon))}</span></span><span class="result-meta"><b>LAND</b>Any point</span></button>`);
    }
    if (matchingLocations.length) {
      sections.push(`<div class="result-group-label">CURATED PLACES</div>${matchingLocations.map((location) => `<button class="result-row" data-result-type="location" data-id="${location.id}"><span class="result-thumb"><img src="${biomeFor(location).image}" alt="" /></span><span class="result-copy"><strong>${escapeHTML(location.name)}</strong><span>${escapeHTML(location.region)} · ${escapeHTML(biomeFor(location).label)}</span></span><span class="result-meta"><b>${location.species.length}</b>spotlights</span></button>`).join("")}`);
    }
    if (matchingSpecies.length) {
      sections.push(`<div class="result-group-label">ANIMALS & PLANTS</div>${matchingSpecies.map(({ species, location }) => {
        const thumb = species.photo
          ? `<img src="${escapeHTML(species.photo)}" alt="" />`
          : escapeHTML(species.icon || "◌");
        return `<button class="result-row" data-result-type="species" data-id="${species.id}"><span class="result-thumb">${thumb}</span><span class="result-copy"><strong>${escapeHTML(species.common)}</strong><span><i>${escapeHTML(species.scientific)}</i> · ${escapeHTML(location.name)}</span></span><span class="result-meta"><b>OPEN</b>${escapeHTML(species.group)}</span></button>`;
      }).join("")}`);
    }
    if (livePlaces.length) {
      sections.push(`<div class="result-group-label">LIVE PLACE SEARCH</div>${livePlaces.map((place, index) => `<button class="result-row" data-result-type="live-place" data-index="${index}"><span class="result-thumb">⌖</span><span class="result-copy"><strong>${escapeHTML(place.name)}</strong><span>${escapeHTML([place.admin1, place.country].filter(Boolean).join(", "))}</span></span><span class="result-meta"><b>LIVE</b>${Number(place.latitude).toFixed(2)}, ${Number(place.longitude).toFixed(2)}</span></button>`).join("")}`);
    }
    if (!sections.length) sections.push(`<div class="search-empty"><strong>${loading ? "Searching the world…" : "No local match yet."}</strong>${loading ? "Checking the live place index." : "Try a city, ecosystem, animal, or a latitude/longitude pair."}</div>`);
    els.searchResults.innerHTML = sections.join("");
    els.searchStatus.textContent = loading ? "SEARCHING LIVE PLACE INDEX…" : normalized ? "CURATED + LIVE PLACE SEARCH" : "START WITH A JOURNEY OR SEARCH ANYWHERE";
    els.searchResults._livePlaces = livePlaces;
  }

  async function geocodeSearch(query) {
    state.searchAbort?.abort();
    const controller = new AbortController();
    state.searchAbort = controller;
    renderSearchResults(query, [], true);
    try {
      const params = new URLSearchParams({ name: query, count: "6", language: "en", format: "json" });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`Geocoding returned ${response.status}`);
      const data = await response.json();
      if (els.searchInput.value.trim() !== query) return;
      renderSearchResults(query, data.results || [], false);
    } catch (error) {
      if (error.name !== "AbortError") renderSearchResults(query, [], false);
    }
  }

  function overlayMap() {
    return { search: els.searchOverlay, species: els.speciesOverlay, journal: els.journalOverlay, about: els.aboutOverlay };
  }

  function openOverlay(name) {
    const overlay = overlayMap()[name];
    if (!overlay) return;
    if (document.activeElement instanceof HTMLElement) state.overlayReturnFocus.set(name, document.activeElement);
    overlay.hidden = false;
  }

  function openSearch() {
    openOverlay("search");
    els.searchInput.value = "";
    renderSearchResults("");
    renderFeaturedJourneys();
    setTimeout(() => els.searchInput.focus(), 50);
  }

  function closeOverlay(name) {
    const overlay = overlayMap()[name];
    if (!overlay) return;
    const fallback = {
      search: $("#searchTrigger"),
      species: state.guideOpen ? $("#closeGuide") : $("#openGuideButton"),
      journal: $("#journalButton"),
      about: $("[data-nav='about']")
    }[name];
    const returnTarget = state.overlayReturnFocus.get(name) || fallback;
    overlay.hidden = true;
    state.overlayReturnFocus.delete(name);
    const target = returnTarget instanceof HTMLElement && returnTarget.isConnected && !returnTarget.closest("[hidden]") ? returnTarget : fallback;
    target?.focus();
  }

  function surpriseMe(openGuide = false) {
    const options = LOCATIONS.filter((location) => location.id !== state.currentLocation.id);
    const location = options[Math.floor(Math.random() * options.length)];
    selectLocation(location, { focus: true, openGuide, award: true });
    els.heroCopy.classList.add("dimmed");
    state.userInteracted = true;
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      showToast("Location access is not supported in this browser.");
      return;
    }
    showToast("Finding your local field station…", 5000);
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const location = makeFieldStation(latitude, longitude, "Wildlife near you", "Your current coordinates", "Your location");
      selectLocation(location, { focus: true, openGuide: true, award: true });
      els.heroCopy.classList.add("dimmed");
    }, () => showToast("Location permission was not available. You can still search or click the globe."), { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  function applyPreferencesFromUI() {
    state.progress.prefs.level = els.learningLevel.value;
    state.progress.prefs.interests = $$("#interestGrid input:checked").map((input) => input.value);
    writeProgress();
    if (state.guideOpen) renderGuideTab();
    if (!els.speciesOverlay.hidden && state.currentSpecies) openSpecies(state.currentSpecies);
  }

  function initializePreferences() {
    els.learningLevel.value = state.progress.prefs.level;
    $$("#interestGrid input").forEach((input) => { input.checked = (state.progress.prefs.interests || []).includes(input.value); });
  }

  function locationFromSaved(saved) {
    return LOCATION_BY_ID.get(saved.id) || { ...saved, icon: "⌖", curated: Boolean(saved.curated), species: saved.species || [], habitat: saved.habitat || [] };
  }

  function bindUI() {
    $("#searchTrigger").addEventListener("click", openSearch);
    $("#startExploring").addEventListener("click", openSearch);
    $("#useLocation").addEventListener("click", useCurrentLocation);
    $("#openGuideButton").addEventListener("click", openGuidePanel);
    $("#closeGuide").addEventListener("click", closeGuidePanel);
    $("#savePlaceButton").addEventListener("click", toggleSaveLocation);
    $("#saveSpeciesButton").addEventListener("click", toggleSaveSpecies);
    $("#journalButton").addEventListener("click", openJournal);
    $("#surpriseButton").addEventListener("click", () => surpriseMe(true));
    $("#dropPinHint").addEventListener("click", () => showToast("Click any visible point on the globe to create a field station."));
    $("#missionInfo").addEventListener("click", () => showToast("Small missions reward exploration. Progress is stored only in this browser."));
    $("#refreshLiveSpecies").addEventListener("click", () => loadLiveSpecies(state.currentLocation, true));
    els.radiusSelect.addEventListener("change", () => {
      updateSyncLabel();
      renderGuideTab();
      if (!state.currentLocation.curated) loadLiveSpecies(state.currentLocation, false);
    });
    $("#zoomIn").addEventListener("click", () => globe?.setZoom(globe.targetDistance - 0.35));
    $("#zoomOut").addEventListener("click", () => globe?.setZoom(globe.targetDistance + 0.35));
    $("#resetGlobe").addEventListener("click", () => globe?.reset());
    $("#homeButton").addEventListener("click", () => {
      closeGuidePanel();
      selectLocation(LOCATIONS[0], { focus: true, award: false });
      els.heroCopy.classList.remove("dimmed");
      state.userInteracted = false;
      globe?.reset();
    });

    $$(".guide-tabs button").forEach((button) => button.addEventListener("click", () => {
      state.guideTab = button.dataset.tab;
      renderGuideTab();
    }));

    els.guideContent.addEventListener("click", (event) => {
      const card = event.target.closest("[data-species-id]");
      if (card) {
        const species = state.speciesDisplay.get(card.dataset.speciesId);
        if (species) openSpecies(species);
        return;
      }
      if (event.target.closest("[data-action='retry-live']")) loadLiveSpecies(state.currentLocation, true);
    });

    els.miniQuiz.addEventListener("click", (event) => {
      const button = event.target.closest("[data-quiz-index]");
      const species = state.currentSpecies;
      if (!button || !species?.quiz) return;
      const index = Number(button.dataset.quizIndex);
      const buttons = $$("[data-quiz-index]", els.miniQuiz);
      buttons.forEach((item) => { item.disabled = true; });
      button.classList.add(index === species.quiz.answer ? "correct" : "wrong");
      if (index !== species.quiz.answer) buttons[species.quiz.answer]?.classList.add("correct");
      $(".quiz-feedback", els.miniQuiz).textContent = species.quiz.explanation;
      if (!state.progress.completedQuizzes.includes(species.id)) {
        state.progress.completedQuizzes.push(species.id);
        awardXP(index === species.quiz.answer ? 8 : 3, index === species.quiz.answer ? "Field check correct" : "Field check completed");
      }
    });

    els.profileButton.addEventListener("click", (event) => {
      event.stopPropagation();
      els.profilePopover.hidden = !els.profilePopover.hidden;
      els.profileButton.setAttribute("aria-expanded", String(!els.profilePopover.hidden));
    });
    els.learningLevel.addEventListener("change", applyPreferencesFromUI);
    $("#interestGrid").addEventListener("change", applyPreferencesFromUI);
    $("[data-close='profile']").addEventListener("click", () => { els.profilePopover.hidden = true; });
    document.addEventListener("click", (event) => {
      if (!els.profilePopover.hidden && !els.profilePopover.contains(event.target) && !els.profileButton.contains(event.target)) els.profilePopover.hidden = true;
    });

    $("#clearSearch").addEventListener("click", () => {
      els.searchInput.value = "";
      renderSearchResults("");
      els.searchInput.focus();
    });
    els.searchInput.addEventListener("input", () => {
      const query = els.searchInput.value.trim();
      clearTimeout(state.searchTimer);
      renderSearchResults(query);
      if (query.length >= 3 && !coordinateQuery(query)) state.searchTimer = setTimeout(() => geocodeSearch(query), 420);
    });
    els.searchResults.addEventListener("click", (event) => {
      const row = event.target.closest("[data-result-type]");
      if (!row) return;
      const type = row.dataset.resultType;
      if (type === "location") {
        selectLocation(LOCATION_BY_ID.get(row.dataset.id), { focus: true, award: true });
        closeOverlay("search");
        els.heroCopy.classList.add("dimmed");
      } else if (type === "species") {
        const entry = SPECIES_INDEX.get(row.dataset.id);
        if (!entry) return;
        selectLocation(entry.location, { focus: true, award: true });
        closeOverlay("search");
        openGuidePanel();
        setTimeout(() => openSpecies({ ...entry.species, parentLocation: entry.location }), 240);
      } else if (type === "coords") {
        const location = makeFieldStation(Number(row.dataset.lat), Number(row.dataset.lon));
        selectLocation(location, { focus: true, openGuide: true, award: true });
        closeOverlay("search");
        els.heroCopy.classList.add("dimmed");
      } else if (type === "live-place") {
        const place = els.searchResults._livePlaces?.[Number(row.dataset.index)];
        if (!place) return;
        const region = [place.admin1, place.country].filter(Boolean).join(", ") || "Live place search";
        const location = makeFieldStation(Number(place.latitude), Number(place.longitude), place.name, region, "Open-Meteo place search");
        selectLocation(location, { focus: true, openGuide: true, award: true });
        closeOverlay("search");
        els.heroCopy.classList.add("dimmed");
      }
    });
    els.journeyList.addEventListener("click", (event) => {
      const card = event.target.closest("[data-journey]");
      if (!card) return;
      selectLocation(LOCATION_BY_ID.get(card.dataset.journey), { focus: true, openGuide: true, award: true });
      closeOverlay("search");
      els.heroCopy.classList.add("dimmed");
    });

    $$('[data-close]').forEach((button) => button.addEventListener("click", () => closeOverlay(button.dataset.close)));

    els.journalContent.addEventListener("click", (event) => {
      const locationButton = event.target.closest("[data-journal-location]");
      const speciesButton = event.target.closest("[data-journal-species]");
      if (locationButton) {
        const saved = state.progress.savedLocations.find((entry) => entry.id === locationButton.dataset.journalLocation);
        if (!saved) return;
        closeOverlay("journal");
        selectLocation(locationFromSaved(saved), { focus: true, openGuide: true, award: false });
      } else if (speciesButton) {
        const saved = state.progress.savedSpecies.find((entry) => entry.id === speciesButton.dataset.journalSpecies);
        if (!saved) return;
        closeOverlay("journal");
        const location = locationFromSaved(saved.parentLocation || state.currentLocation);
        selectLocation(location, { focus: true, award: false });
        openGuidePanel();
        setTimeout(() => openSpecies({ ...saved, parentLocation: location }), 180);
      }
    });

    $$(".rail-button").forEach((button) => button.addEventListener("click", () => {
      const nav = button.dataset.nav;
      if (nav === "explore") {
        closeGuidePanel();
        els.heroCopy.classList.toggle("dimmed");
      } else if (nav === "surprise") surpriseMe(true);
      else if (nav === "quests") {
        openGuidePanel();
        state.guideTab = "mission";
        renderGuideTab();
      } else if (nav === "about") openOverlay("about");
    }));

    document.addEventListener("keydown", (event) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        openSearch();
      } else if (event.key === "Escape") {
        if (!els.speciesOverlay.hidden) closeOverlay("species");
        else if (!els.searchOverlay.hidden) closeOverlay("search");
        else if (!els.journalOverlay.hidden) closeOverlay("journal");
        else if (!els.aboutOverlay.hidden) closeOverlay("about");
        else if (state.guideOpen) closeGuidePanel();
        else els.profilePopover.hidden = true;
      } else if (!typing && event.key === "+") globe?.setZoom(globe.targetDistance - 0.3);
      else if (!typing && event.key === "-") globe?.setZoom(globe.targetDistance + 0.3);
      else if (!typing && event.key === "ArrowLeft") globe?.rotateBy(-0.12, 0);
      else if (!typing && event.key === "ArrowRight") globe?.rotateBy(0.12, 0);
      else if (!typing && event.key === "ArrowUp") globe?.rotateBy(0, -0.1);
      else if (!typing && event.key === "ArrowDown") globe?.rotateBy(0, 0.1);
    });

    window.addEventListener("online", () => showToast("Back online. Live place search and wildlife sightings are available."));
    window.addEventListener("offline", () => showToast("Offline mode: curated journeys remain available."));
  }

  function init() {
    initializePreferences();
    updateStreak();
    updateProgressUI();
    renderPlaceCard();
    renderGuideShell();
    loadWeather(state.currentLocation);
    renderFeaturedJourneys();
    renderSearchResults("");
    bindUI();
    setTimeout(() => globe?.focusOn(state.currentLocation.lat, state.currentLocation.lon), 500);
  }

  init();
})();
