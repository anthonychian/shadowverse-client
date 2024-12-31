export const cardEffect = (cardName) => {
    switch (cardName) {
      case "Ladica, the Stoneclaw":
        return "[evolve] [cost01]: Evolve this follower. Activate only if you've played at least 5 cards this turn. \n Whenever a Naterran Great Tree is put onto your field, recover 1 play point.";
      case "Cynthia, the Queen's Blade":
        return "[fanfare] Put a Fairy Wisp token into your EX area. Give each Pixie token on your field [attack]+2. \n While this card is on your field, each Pixie token on your field has Storm and Assail. \n Whenever a Pixie token is put onto your field, give it [attack]+2.";
      case "Primal Giant":
        return "When this card is discarded, put a Naterran Great Tree token into your EX area. When playing this card, bury 4 Natura cards: This card costs 4 less to play. \n ---------- \n [fanfare] Select a [forestcraft] follower that costs 5 or less in your cemetery and summon it.";
      case "Setus, the Beastblade":
        return "[evolve] [cost02]: Evolve this follower. \n Ward. \n At the start of your end phase, give your leader [defense]+4 and, if a follower was put from your field into the cemetery this turn, give this follower [attack]+2 / [defense]+2.";
      case "Send 'Em Packing":
        return "Select a Ladica, the Stoneclaw on your field and give it [attack]+1 / [defense]+1. Combo (5) - Deal damage equal to its attack to each enemy follower on the field.";
      case "Blossom Spirit":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Put a Naterran Great Tree or Fairy token into your EX area.";
      case "Avatar of Fruition":
        return "[fanfare] Put a Naterran Great Tree token into your EX area. \n While this card is on your field, any Naterran Great Tree you play costs 1 less.";
      case "Divine Smithing":
        return "Select up to 2 Pixie followers on your field or in your EX area and give them [attack]+1. Combo (3) - Draw a card.";
      case "Chesire Cat":
        return "[fanfare] Select an enemy leader or enemy follower on the field and deal it 1 damage. If this card wasn't put onto the field from hand, deal 2 damage instead. \n [act] [engage], put this card on the bottom of its owner's deck: Select a Fable follower on your field or in your EX area and place 2 Fable counters on it.";
      case "Ghastly Treant":
        return "[fanfare] Put a Naterran Great Tree token into your EX area. \n [act] Banish a Naterran Great Tree from your field: Give your leader [defense]+3. Activate only once per turn.";
      case "Forest Hermit":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Put a Naterran Great Tree token into your EX area.";
      case "Marvelously Mad Hatter":
        return "[fanfare] If there's another Fable card on your field, search your deck for a Fable follower, put it into your EX area, then shuffle your deck. You may place a Fable counter on that follower.";
      case "Fertile Aether":
        return "Put a Naterran Great Tree token into your EX area. Combo (3) - Put 2 instead and give your leader [defense]+2.";
  
      case "Bayleon, Sovereign Light":
        return "[evolve] [cost01]: Evolve this follower. \n Ward. \n [fanfare] You may put a Naterran Great Tree token onto your field or into your EX area.";
      case "Mistolina, Forest Princess":
        return "Storm. \n [fanfare] Select a Princess's Strike in your cemetery and play it for 0 play points. \n [act] [engage] 2 cards named Naterran Great Tree on your field: Give this follower [attack]+3. Give your leader [defense]+2.";
      case "Tsubaki of the Demon Blade":
        return "[fanfare] If there are at least 5 [swordcraft] followers in your cemetery, select an enemy follower on the field and destroy it. \n While there are at least 10 [swordcraft] followers in your cemetery, this follower has Storm.";
      case "Leod, the Crescent Blade":
        return "[evolve] [cost02]: Evolve this follower. \n While this card is reserved on your field, it has Intimidate and Aura. \n At the start of your end phase, select an enemy follower on the field and deal it 1 damage.";
      case "King's Might":
        return "When playing this card, [engage] 2 cards named Naterran Great Tree on your field: This card costs 2 less to play. \n This card costs 1 less to play if there's a Bayleon, Sovereign Light on your field. \n ---------- \n Select an enemy follower on the field and deal it 4 damage.";
      case "Troya, Thunder of Hagelberg":
        return "[evolve] [cost01]: Evolve this follower. \n Bane.";
      case "Valse, Champion Deadeye":
        return "[act] [cost01], [engage]: Select an enemy leader or enemy follower on the field and deal it damage equal to this follower's attack. \n [act] [cost03], [engage]: Select an enemy amulet on the field and banish it.";
      case "Princess's Strike":
        return "[quick] Select an enemy follower on the field and deal it 2 damage. If there's a Mistolina, Forest Princess on your field, deal 6 damage instead.";
      case "Swift Tigress":
        return "[fanfare] [engage] a Naterran Great Tree on your field: Give this follower Storm.";
      case "Lupine Axeman":
        return "[fanfare] You may put a Naterran Great Tree token onto your field or into your EX area. \n [act] [engage] this card and any number of cards named Naterran Great Tree on your field: Select an enemy follower on the field and deal it damage equal to the number of cards named Naterran Great Tree engaged this way.";
      case "Dauntless Commander":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Tempered Aether":
        return "Put a Naterran Great Tree token onto your field and into your EX area.";
      case "Elegance in Action":
        return ".When this card is discarded, select an enemy follower on the field and engage it. \n ---------- \n Select an enemy follower on the field. Engage it and draw a card.";
  
      case "Tetra, Sapphire Rebel":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Put a Repair Mode token into your EX area.";
      case "Belphomet, Lord of Aiolon":
        return "Rush. \n [fanfare] Look at the top 5 cards of your deck. From among them, you may summon any number of Machina followers that cost a total of 6 or less. Put the rest on the bottom of your deck in any order. \n At the start of your end phase, give each other Machina follower on your field [attack]+1 / [defense]+1.";
      case "Riley, Hydroshaman":
        return "[fanfare] Earth Rite: Choose one of the following. If this card was put onto the field from the cemetery, choose up to 3 instead. (1) Select an enemy follower on the field and deal it 5 damage. (2) Give this follower [attack]+3. (3) Draw 2 cards. \n [act] [cost06]: Summon this card from your cemetery. Give it Storm and \" [lastwords] Banish this card.\"";
      case "Eleanor, Cosmic Flower":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Discard a spell: Draw a card.";
      case "Delta Cannon":
        return "When a Tetra, Sapphire Rebel is put onto your field, [cost01]: Put this card from your cemetery into your EX area. \n ---------- \n [quick] \n Select an enemy follower on the field and deal it 2 damage.";
      case "Displacer Bot":
        return "[evolve] [cost02]: Evolve this follower. \n Ward. \n [fanfare] Look at the top 4 cards of your deck. You may put a Machina card from among them into your EX area. Put the rest on the bottom of your deck in any order.";
      case "Mechanized Lifeform":
        return "[fanfare] Put a Repair Mode token into your EX area. \n Once per turn, when you play a Machina card, draw a card.";
      case "Splendid Conjury":
        return "Select up to 3 enemy followers on the field and deal 3 damage divided between them. If there's an Eleanor, Cosmic Flower on your field, deal 5 damage divided between them instead.";
      case "Mechastaff Sorcerer":
        return "[fanfare] Put an Assembly Droid or Repair Mode token into your EX area. \n [act] [engage], banish a Machina card from your EX area: Select an enemy follower on the field and deal it damage equal to the number of Machina cards in your EX area.";
      case "Prototype Warrior":
        return "[fanfare] Choose one of the following. (1) Put an Assembly Droid token into your EX area. (2) If there are at least 3 Machina cards in your EX area, give this follower [attack]+1 / [defense]+1 and Rush.";
      case "Magiblade Witch":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Presto Chango":
        return "Select an enemy card on the field and put it on the bottom of its owner's deck. Its controller may summon a follower or amulet from their hand.";
      case "Sagacious Core":
        return "[fanfare] Look at the top 2 cards of your deck. You may reveal a Machina card from among them and add it to your hand. Put the rest on the bottom of your deck in any order. \n [act] [engage], bury this card: Deal 1 damage to each enemy leader. Activate only if there are at least 3 Machina cards in your EX area.";
  
      case "Valdain, Cursed Shadow":
        return "[evolve] [cost02]: Evolve this follower. \n [evolve] [cost00]: Evolve this follower. Activate only if there are at least 10 Natura cards in your cemetery. \n [fanfare] Look at the top 3 cards of your deck. You may reveal a Natura card from among them and add it to your hand. Bury the rest.";
      case "Neptune, Tidemistress":
        return "Ward. \n [fanfare] Look at the top 5 cards of your deck. From among them, you may reveal up to 2 Marine followers not named Neptune, Tidemistress and add them to your hand. Put the rest on the bottom of your deck in any order. You may summon a Marine follower that costs 5 or less from your hand and give it [attack]+2 / [defense]+2.";
      case "Wildfire Tyrannosaur":
        return "When this card is discarded, [cost01]: Select an enemy follower on the field and deal it 3 damage. \n ---------- \n [act] Banish a Naterran Great Tree from your field: Deal 3 damage to each enemy follower on the field.";
      case "Marion, Elegant Dragonewt":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If Overflow is active for you, look at the top 3 cards of your deck. You may put a [dragoncraft] follower from among them into your EX area. Put the rest on the bottom of your deck in any order.";
      case "Shadow's Corrosion":
        return "This card can't be played from the EX area. \n At the start of your end phase, if this card is in your EX area, deal 1 damage to each enemy leader for every 5 Natura cards in your cemetery. \n ---------- \n Select an enemy follower on the field. Deal it 4 damage and, if there's a Valdain, Cursed Shadow on your field, put this card into its owner's EX area.";
      case "Bubbleborne Mermaid":
        return "[fanfare] Give your leader [defense]+1 for every Marine follower on your field.";
      case "Hoarfrost Triceratops":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Banish a Naterran Great Tree from your field: Give this follower [attack]+2/[defense]+2. \n [lastwords] Summon a Naterran Great Tree token.";
      case "Whirlwind Pteranodon":
        return "[fanfare] Banish a Naterran Great Tree from your field: Increase your max play points by 1. \n [lastwords] Summon a Naterran Great Tree token.";
      case "Dragonewt Needler":
        return "Whenever a Dragonewt follower on your field attacks, deal 2 damage to each enemy leader.";
      case "Lightning Velociraptor":
        return "[fanfare] Summon a Naterran Great Tree token. If Overflow is active for you, summon up to 2 instead and give this follower Rush.";
      case "Doting Dragoneer":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] If Overflow is active for you, select an enemy follower on the field and deal it 2 damage.";
      case "Boomfish":
        return "[act] [cost02], bury this card: Deal 3 damage to each follower on the field and your leader.";
      case "Feral Aether":
        return "Summon a Naterran Great Tree token. If Overflow is active for you, summon up to 3 instead.";
  
      case "Mono, Garnet Rebel":
        return "[evolve] [cost01]: Evolve this follower. Activate only if there are 5 Machina followers on your field. \n [act] Banish 2 Machina cards from your cemetery: Summon an Assembly Droid token. Activate only once per turn.";
      case "Kudlak":
        return "[fanfare] Select up to 2 Vampire cards that cost a total of 6 or less in your cemetery and put them into your EX area. They cost 0 play points to play this turn. \n [act] [engage]: Select an enemy follower on the field and deal it damage equal to the number of Vampire cards on your field.";
      case "Aenea, Amethyst Rebel":
        return "[fanfare] Search your deck for a Machina follower that costs 3 or less, summon it, then shuffle your deck. \n [lastwords] Give your leader [defense]+2.";
      case "Doublame, Duke and Dame":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Bury the top card of your deck.";
      case "Alpha Drive":
        return "Choose one of the following. (1) Select a Machina follower in your cemetery and add it to your hand. (2) Select a Mono, Garnet Rebel in your cemetery and summon it.";
      case "Nicola, Forbidden Strength":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Bury the top 2 cards of your deck.";
      case "Hellblaze Demon":
        return "[fanfare] Discard a card: Put the top card of your deck into your EX area. If it's a follower, give it [attack]+1 / [defense]+1.";
      case "Forbidden Art":
        return "Select an enemy follower on the field and deal it 4 damage. If there's a Nicola, Forbidden Strength on your field, deal 6 damage instead.";
      case "Robozombie":
        return "Assail. Bane. \n While there's another Machina follower on your field, this follower has Rush.";
      case "Bone Drone":
        return "[lastwords] Summon an Assembly Droid token.";
      case "Berserk Demon":
        return "[evolve] [cost03]: Evolve this follower. \n [fanfare] Deal 3 damage to your leader.";
      case "Ghostwriter":
        return "Whenever a follower on your field evolves, summon 2 Ghost tokens. \n [act] [engage]: Select a Ghost on your field and give it Bane.";
      case "Sanguine Core":
        return "[fanfare] Look at the top 2 cards of your deck. You may reveal a Machina card from among them and add it to your hand. Put the rest on the bottom of your deck in any order. \n [act] [engage], bury this card: Put an Assembly Droid token into your EX area. Activate only if there are at least 5 Machina cards in your cemetery.";
  
      case "Limonia, Flawed Saint":
        return "[evolve] [cost07]: Evolve this follower. \n [fanfare] Put a Repair Mode token into your EX area. \n [act] Banish a Repair Mode from your EX area: This card's [evolve] costs 1 less this turn.";
      case "Lapis, Glorious Seraph":
        return "Ward. \n When this card leaves the field, draw a card for every prayer counter on it. \n At the start of your end phase, select a card on your field. Place a prayer counter on it and give your leader [defense]+2.";
      case "Father Refinement":
        return "Rush. \n [fanfare] Put 2 Repair Mode tokens into your EX area. Recover 2 play points. \n Strike - Draw a card. If there are 5 cards named Repair Mode in your EX area, draw 2 instead.";
      case "Marione, Light of Balance":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Each player puts a Repair Mode token into their EX area.";
      case "Augmentation Bestowal":
        return "Choose one of the following. (1) Banish 2 cards named Repair Mode from your EX area: Search your deck for a Machina follower that costs 3 or less, summon it, then shuffle your deck. (2) Banish 5 cards named Repair Mode from your EX area: Search your deck for a Machina follower that costs 6 or less, summon it, then shuffle your deck.";
      case "Bunny-Eared Administrator":
        return "[fanfare] If this card wasn't put onto the field from hand, select an enemy follower on the field and deal it 3 damage. \n [act] [cost01], discard this card: Give your leader [defense]+1. Put this card into your deck 3rd from the top.";
      case "Robofalcon":
        return "[evolve] [cost01]: Evolve this follower. \n Storm. \n Strike - Put a Repair Mode token into your EX area. Then, if there are at least 3 cards named Repair Mode in your EX area, give this follower [attack]+1.";
      case "Marcotte, Heretical Sister":
        return "Ward. \n [fanfare] Draw a card. If there are 5 cards in your EX area, instead search your deck for any card, add it to your hand, then shuffle your deck.";
      case "Ironknuckle Nun":
        return "Ward. \n [fanfare][lastwords] Put a Repair Mode token into your EX area.";
      case "Dark Bishop":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Meowskers, Ruff-Tuff Major":
        return "Storm. \n Strike - Select an enemy leader or enemy follower on the field and deal it 1 damage.";
      case "Saintly Core":
        return "[fanfare] Look at the top 2 cards of your deck. You may reveal a Machina card from among them and add it to your hand. Put the rest on the bottom of your deck in any order. \n [act] [engage], bury this card: Put a Repair Mode token into your EX area. Activate only if there are at least 2 Machina followers on your field.";
      case "Meowskers Ambush!":
        return "[fanfare] Look at the top 3 cards of your deck. You may reveal a [havencraft] follower from among them and add it to your hand. Put the rest on the bottom of your deck in any order. \n [act] [cost01], [engage], bury this card: You may summon a follower with \"Meowskers\" in its name from your hand.";
  
      case "Technolord":
        return "[fanfare] Banish 3 Machina cards from your cemetery: Choose up to 2 of the following. (1) Select an enemy follower on the field and destroy it. (2) Select an enemy amulet on the field and destroy it. (3) Deal 3 damage to each enemy leader. (4) Search your deck for a Machina card not named Technolord, reveal it, add it to your hand, then shuffle your deck.";
      case "Technolord (b)":
        return "[fanfare] Banish 3 Machina cards from your cemetery: Choose up to 2 of the following. (1) Select an enemy follower on the field and destroy it. (2) Select an enemy amulet on the field and destroy it. (3) Deal 3 damage to each enemy leader. (4) Search your deck for a Machina card not named Technolord, reveal it, add it to your hand, then shuffle your deck.";
      case "Viridia Magna":
        return "Rush. Assail. Bane. \n [lastwords] Banish a Naterran Great Tree from your field or EX area: Put this card onto its owner's field engaged and evolve it. If you didn't evolve it, banish it.";
      case "Mechawing Angel":
        return "Ward. \n [fanfare] Put an Assembly Droid or Repair Mode token into your EX area. \n [act] [engage]: Select an enemy follower on the field and deal it 4 damage. Activate only if there are at least 5 Machina cards in your cemetery.";
      case "Desert Pathfinder":
        return "[fanfare] You may put a Naterran Great Tree token onto your field or into your EX area. Then, if there are at least 5 Natura cards on your field and/or in your EX area, look at the top 3 cards of your deck. You may reveal a Natura card from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Maisha, Hero of Purgation":
        return "[evolve] [cost02]: Evolve this follower. \n Strike - Select a [neutral] spell that costs 3 or less in your cemetery and play it for 0 play points.";
      case "Robogoblin":
        return "[evolve] [cost01]: Evolve this follower. \n [lastwords] Put a Repair Mode token into your EX area.";
      case "Colorful Cook":
        return "[fanfare] You may put a Naterran Great Tree token onto your field or into your EX area. Give your leader [defense]+1. \n [lastwords] Discard a Natura card: Draw a card.";
      case "Purgation's Blade":
        return "Select an enemy follower on the field. Destroy it and give each Maisha, Hero of Purgation on your field [attack]+1 for every follower in your cemetery.";
      case "Aldis, Trendsetting Seraph":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Give your leader [defense]+3.";
      case "Mechagun Wielder":
        return "[fanfare] Put an Assembly Droid or Repair Mode token into your EX area. \n [lastwords] Discard a Machina card: Draw a card.";
      case "Extreme Carrot":
        return "Rush. \n [lastwords] [cost01], banish a Naterran Great Tree from your field or EX area: Search your deck for an Extreme Carrot, summon it, then shuffle your deck. Give your leader [defense]+1.";
  
      case "Uzuki Shimamura [P.C.S.]":
        return "[fanfare] Select up to 1 Cute follower that costs 4 or less and up to 1 Cute follower that costs 2 or less in your cemetery. Summon them and give them [attack]+1 / [defense]+1. \n [act] Lesson (1): Give your leader [defense]+3. Activate only once per turn.";
      case "Kyoko Igarashi [P.C.S.]":
        return "Ward. \n [fanfare] Select an enemy follower on the field and give it [attack]-1/[defense]-1 for every Cute follower on your field. \n [act] Lesson (1): Select an enemy follower on the field and give it [attack]-1/[defense]-1. Activate only once per turn.";
      case "Miho Kohinata [P.C.S.]":
        return "[fanfare] Look at the top card of your deck. If it's a Cute card, you may reveal it and add it to your hand. \n While there are at least 3 Cute followers on your field, this follower has Rush.";
      case "Chika Yokoyama":
        return "[fanfare] If there are at least 5 Cute cards in your cemetery, give this follower [attack]+1/[defense]+2 and Ward.";
      case "Momoka Sakurai":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] [cost02], Lesson (1): Give this follower [attack]+1 / [defense]+1.";
      case "Akiha Ikebukuro":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Select another Cute follower on your field and give it [defense]+1.";
      case "Nene Kurihara":
        return "[evolve] [cost01]: Evolve this follower. \n Ward. \n [fanfare] Select an enemy follower on the field and deal it 3 damage.";
      case "Karin Domyoji":
        return "Ward. \n [fanfare] Discard a Cute card: Give this follower [defense]+2. Draw a card.";
  
      case "Rin Shibuya [Triad Primus]":
        return "Storm. \n [fanfare] If there are at least 3 Cool followers on your field, select another follower with 3 attack or less on your field and give it Storm. \n [act] [cost01], Lesson (1): Give this follower [attack]+1. Activate only once per turn.";
      case "Nao Kamiya [Over the Rainbow]":
        return "[fanfare] Look at the top 5 cards of your deck. From among them, you may summon up to 2 Cool followers that cost a total of 4 or less. Put the rest on the bottom of your deck in any order.";
      case "Karen Hojo [Song for Life]":
        return "At the start of your end phase, if there are no other Cool followers on your field, deal 1 damage to this follower. \n [act] [cost03], Lesson (1): Give each follower on your field [attack]+1.";
      case "Yasuha Okazaki":
        return "[fanfare] Search your deck for a Cool follower that costs 2 or less, summon it, then shuffle your deck.";
      case "Yukimi Sajo":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] [cost02], Lesson (1): Give this follower [attack]+1 / [defense]+1. ";
      case "Kako Takafuji":
        return "[evolve] [cost02]: Evolve this follower.";
      case "Chizuru Matsuo":
        return "[fanfare] Select another Cool follower on your field and give it [attack]+1. \n [lastwords] Select a Cool follower on your field and give it [attack]+1.";
      case "Seira Mizuki":
        return "[evolve] [cost02]: Evolve this follower. \n Storm.";
  
      case "Mio Honda [Positive Passion]":
        return "Rush. \n [fanfare] Look at the top 2 cards of your deck. You may summon a Passion follower from among them. Bury the rest. \n [act] [cost02], Lesson (2): Look at the top 2 cards of your deck. You may summon a Passion follower from among them. Bury the rest.";
      case "Aiko Takamori [Handmade Hapiness]":
        return "[act] [engage] 3 Passion followers on your field: You may summon a Passion follower from your hand and give it \"At the start of your end phase, return this card to its owner's hand.\"";
      case "Akane Hino [Positive Passion]":
        return "Storm. \n [fanfare] Lesson (3), discard 2 Passion cards: Deal 6 damage to each enemy follower on the field. Draw 2 cards.";
      case "Kaoru Ryuzaki":
        return "[act] [cost02]: If there are at least 5 Passion cards in your cemetery, select a follower in your cemetery and add it to your hand. Activate only once per turn.";
      case "Suzuho Ueda":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Look at the top card of your deck.";
      case "Miria Akagi":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] [cost02], Lesson (1): Give this follower [attack]+1 / [defense]+1. ";
      case "Miu Yaguchi":
        return "Ward. \n [fanfare] Bury the top card of your deck. If it costs an odd number of play points, draw a card. If not, give your leader [defense]+2.";
      case "Kumiko Matsuyama":
        return "[evolve] [cost01]: Evolve this follower.";
  
      case "Aiko Takamori":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Look at the top 3 cards of your deck. You may reveal a Passion card from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Miku Maekawa":
        return "Strike - Select an enemy follower on the field and deal it 2 damage. \n [act] [cost01], Lesson (1): Give this follower Storm.";
      case "Yuzu Kitami":
        return "[evolve] [cost02]: Evolve this follower. \n Ward. \n [act] Lesson (1): Select another card that costs 1 or less on your field and return it to its owner's hand. For the rest of this turn, this card's [act] abilities except [evolve] can't be activated.";
      case "Anastasia":
        return "[fanfare] Recover 2 play points. \n Whenever you play a card during your turn, if it's the 3rd you've played this turn, recover 2 play points. If it's the 5th, give each follower on your field [attack]+1 / [defense]+1.";
      case "Brand New Beat":
        return "When this card leaves the field, if a Magical Item was banished from your EX area this turn, draw a card. \n [act] [engage], bury this card: Select a follower on your field and give it [attack]+1 / [defense]+1.";
      case "Shinobu Kudo":
        return "[fanfare] Search your deck for up to two 1-cost iM@S CG followers and/or 1-cost iM@S CG amulets with different names, summon them, then shuffle your deck.";
      case "Yumi Aiba":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If there are at least 3 Passion followers on your field, select an enemy follower on the field and deal it 2 damage.";
      case "Goddess by the Sunlit Sea":
        return "Draw a card. If there's a follower that costs 5 or more on your field, recover 1 play point.";
      case "Honoka Ayase":
        return "[fanfare] Select another iM@S CG follower on your field and give it Rush.";
      case "Azuki Momoi":
        return "This card costs 3 less to play if there are at least 3 iM@S CG followers on your field. \n --------- \n Ward.";
      case "Kana Imai":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Otaha Umeki":
        return "Whenever you play a card, select an enemy follower on the field and deal it 1 damage.";
      case "A Single Vessel":
        return "[fanfare][lastwords] Select an enemy follower on the field and deal it 3 damage. \n [act] [cost02], [engage], discard a card: Bury this card.";
  
      case "Kyoko Igarashi":
        return "[evolve] [cost01]: Evolve this follower. \n Ward. \n [fanfare] Give your leader [defense]+3. Draw 2 cards.";
      case "Nagi Hisakawa":
        return "[fanfare] Banish two 1-cost cards from your cemetery: Choose up to 2 of the following. (1) Select an enemy follower on the field and destroy it. (2) Deal 2 damage to each enemy leader. (3) Draw a card. Discard a card. \n [act] [cost01], Lesson (1): Give this follower Rush.";
      case "Rin Shibuya":
        return "Ward. \n [fanfare] If there's a follower with \"Uzuki Shimamura\" in its name on your field, select an enemy follower on the field and deal it 5 damage. \n [fanfare] If there's a follower with \"Mio Honda\" in its name on your field, deal 5 damage to each enemy leader.";
      case "Mio Honda":
        return "Storm. \n Strike - If there's a follower with \"Uzuki Shimamura\" in its name on your field, give this follower [defense]+1. \n Strike - If there's a follower with \"Rin Shibuya\" in its name on your field, give this follower [attack]+1.";
      case "Uzuki Shimamura":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Lesson (1): Give your leader [defense]+1.";
      case "Anzu Futaba":
        return "[fanfare] If there are 2 iM@S CG followers or less on your field, engage this card. \n This card doesn't refresh during your start phase. \n At the start of your main phase, [cost02]: Refresh this card.";
      case "Karen Hojo":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If there are at least 3 iM@S CG followers on your field, give this follower [defense]+2.";
      case "Sparkling Days":
        return "Look at the top 2 cards of your deck. You may reveal a Cool or Passion card from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Nao Kamiya":
        return "[fanfare] If there are at least 3 iM@S CG followers on your field, select an enemy follower on the field and deal it 2 damage.";
      case "Mayu Sakuma":
        return "Assail. Bane. Drain.";
      case "Kirari Moroboshi":
        return "This card costs 3 less to play if there's a 1-cost follower on your field. \n ---------- \n Ward. \n [fanfare] Refresh each follower on your field.";
      case "Miho Kohinata":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Angelic Maid":
        return "[quick] \n Select a follower on your field. Give it [attack]+1/[defense]+3 and your leader [defense]+3.";
  
      case "Mizuki Kawashima":
        return "[act] [engage]: Deal 3 damage to each enemy leader and enemy follower on the field. If there are at least 9 cards with different base costs in your cemetery, deal 7 damage instead.";
      case "Shiki Ichinose":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] Look at the top 3 cards of your deck. You may put one of them into your EX area. Bury the rest. \n [act] [engage], discard a card: Select an enemy follower on the field and deal it 5 damage.";
      case "Syuko Shiomi":
        return "When playing this card, discard 3 iM@S CG cards: This card costs 6 less to play. \n ---------- \n [fanfare] Select an enemy follower on the field. Deal it 4 damage and draw 2 cards.";
      case "Kanade Hayami":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Center Street":
        return "[quick] \n Select an enemy follower on the field. Deal it 5 damage and, if there's a Passion follower on your field, draw a card.";
      case "Hina Araki":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Frederica Miyamoto":
        return "Once per turn, when you play a card that originally costs 5 or more, select an enemy leader or enemy follower on the field. Deal it 3 damage and draw a card.";
      case "Precocious Little Devil":
        return "[quick] \n Select an enemy follower on the field and deal it 2 damage. If there are at least 3 iM@S CG followers on your field, deal 3 damage instead.";
      case "Sarina Matsumoto":
        return "Whenever you play a spell, select an enemy follower on the field and deal it 2 damage.";
      case "Rika Jougasaki":
        return "[evolve] [cost02]: Evolve this follower.";
      case "Sae Kobayakawa":
        return "[fanfare] Select another iM@S CG follower on your field and give it [attack]+1 / [defense]+1.";
      case "Tomoe Murakami":
        return "When playing this card, discard a card: This card costs 2 less to play. \n ---------- \n [fanfare] Search your deck for up to 2 spells with different names, reveal them, add them to your hand, then shuffle your deck.";
      case "Full Bloom Panorama":
        return "[quick] \n Select up to 2 enemy followers on the field and destroy them.";
  
      case "Akari Tsujino":
        return "Ward. \n [fanfare] Give your leader [defense]+3. If you have 10 max play points, deal 3 damage to each enemy leader. \n Whenever this follower takes at least 5 damage, increase your max play points by 1.";
      case "Yui Ohtsuki":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] Lesson (1): Select an enemy follower on the field and deal it 4 damage.";
      case "Fumika Sagisawa":
        return "[fanfare] Search your deck for a 3-cost follower and 1-cost follower, summon them, then shuffle your deck. \n Whenever another iM@S CG follower is put onto your field, select an enemy follower on the field and deal it 2 damage.";
      case "Akira Sunazuka":
        return "[fanfare] Discard up to 3 cards: If you discarded at least 1 Cute card, give your leader [defense]+2. If you discarded at least 1 Cool card, draw a card. If you discarded at least 1 Passion card, deal 2 damage to each enemy leader. \n [fanfare] If you have 10 max play points, draw 2 cards.";
      case "Tsukasa Kiryu":
        return "[evolve] [cost02]: Evolve this follower. \n [evolve] Lesson (3): Evolve this follower. \n [fanfare] Increase your max play points by 1.";
      case "Arisu Tachibana":
        return "[fanfare] If there are at least 3 iM@S CG followers on your field, search your deck for a 1-cost spell or 1-cost amulet, reveal it, add it to your hand, then shuffle your deck.";
      case "Yuka Nakano":
        return "[evolve] [cost02]: Evolve this follower.";
      case "Unbound Emotion":
        return "This card costs 1 more to play for every follower on the field. \n ---------- \n Deal 7 damage to each follower on the field.";
      case "Tokiko Zaizen":
        return "[fanfare] Deal each enemy leader damage equal to the number of other iM@S CG followers on your field.";
      case "Noriko Shiina":
        return "[fanfare] If there are at least 3 iM@S CG followers on your field, give this follower [attack]+1 and Rush. \n Strike - Give your leader [defense]+2.";
      case "Yukari Mizumoto":
        return "[fanfare] Choose one of the following. (1) Select an enemy amulet on the field and destroy it. (2) Draw a card.";
      case "Noa Takamine":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Mode Estivale":
        return "Draw 3 cards.";
  
      case "Ranko Kanzaki":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and deal it 2 damage. \n [act] [cost01], Lesson (2): Select up to 2 enemy followers on the field and deal them 2 damage.";
      case "Sachiko Koshimizu":
        return "[fanfare] Deal 2 damage to your leader. \n While your leader's defense is 10 or less, this follower has Storm and Bane.";
      case "Takumi Mukai":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Chitose Kurosaki":
        return "While this card is on your field, your leader and each other follower on your field don't take ability damage during your turn. \n [act] [cost01], Lesson (1): Select an enemy follower on the field and deal it 3 damage. Activate only once per turn.";
      case "Whispers of a Dream":
        return "[quick] \n Select an enemy follower that costs 3 or less on the field. Destroy it and bury the top card of your deck.";
      case "Chiyo Shirayuki":
        return "[fanfare] Deal 2 damage to your leader. Draw 2 cards.";
      case "Aki Yamato":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and deal it 5 damage.";
      case "My Life, My Sounds":
        return "Select an enemy follower on the field. Destroy it and, if Sanguine is active for you, deal 2 damage to its leader.";
      case "Ryo Matsunaga":
        return "Ward. \n [lastwords] Select an iM@S CG spell in your cemetery and add it to your hand.";
      case "Mirei Hayasaka":
        return "[fanfare] Look at the top 3 cards of your deck. Put one of them on the top of your deck. Bury the rest. \n While there are at least 5 iM@S CG cards in your cemetery, this follower has Rush.";
      case "Rina Fujimoto":
        return "This card costs 1 less to play if a follower on your field evolved this turn. \n ---------- \n [fanfare] If Sanguine is active for you, select an enemy follower on the field and deal it 3 damage.";
      case "Syoko Hoshi":
        return "[evolve] [cost01]: Evolve this follower. \n This follower can't attack enemies. \n At the start of your end phase, give your leader [defense]+1.";
      case "Last Daylight":
        return "Select an enemy follower on the field. Deal it 3 damage and give [attack]+1 to each follower that costs 1 or less on your field.";
  
      case "Kaede Takagaki":
        return "Ward. \n [fanfare] Select an enemy follower on the field and banish it. \n At the start of your end phase, if your leader's defense is 5 or less, give it [defense]+5 and draw a card. \n [act] [cost01], Lesson (1): Give this follower Aura.";
      case "Shin Sato":
        return "[evolve] [cost06]: Evolve this follower. \n [fanfare] Draw a card.";
      case "Nana Abe":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Look at the top 5 cards of your deck. You may reveal an amulet from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Akane Hino":
        return "Rush. Assail. \n Strike - Deal 2 damage to each enemy leader. \n [act] [cost02], Lesson (1): Give this follower Storm.";
      case "Classroom Lily":
        return "[fanfare] Give your leader [defense]+2. Draw a card. \n [q] [act] [cost02], [engage], bury this card: Select an iM@S CG follower in your cemetery and add it to your hand.";
      case "Risa Matoba":
        return "[fanfare] Look at the top 3 cards of your deck. You may summon an iM@S CG follower that costs 2 or less from among them. Put the rest on the bottom of your deck in any order.";
      case "Haru Yuuki":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If there's a Risa Matoba on your field, give this follower [attack]+1 / [defense]+1 and Storm.";
      case "Psychic Maiden":
        return "[fanfare] Select an enemy follower with 4 defense or less on the field and banish it. \n [act] [cost05], [engage], bury this card: Select an enemy follower on the field and banish it.";
      case "Natalia":
        return "Storm. \n [fanfare] Select an enemy follower on the field and deal it damage equal to the number of other Passion followers on your field.";
      case "Shizuku Oikawa":
        return "[fanfare] Give your leader [defense]+2. If there are at least 5 Passion cards in your cemetery, give [defense]+4 instead.";
      case "Layla":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Sanae Katagiri":
        return "Rush. Ward. \n If this follower would take more than 3 damage, it takes 3 instead.";
      case "Winter Night Prayer":
        return "[quick] \n Select an enemy follower on the field. Banish it and, if there's a Cute follower on your field, give your leader [defense]+3.";
  
      case "New Generations":
        return "When playing this card, banish 3 Cute cards, 3 Cool cards, and 3 Passion cards from your cemetery: This card costs 9 less to play. \n ---------- \n Storm. Bane. Ward.";
      case "New Wave":
        return "[fanfare] Lesson (5): Destroy each enemy card on the field.";
      case "Master Trainer":
        return "[fanfare] Put 5 Magical Item tokens into your EX area. Recover 4 play points.";
      case "Expert Trainer":
        return "[fanfare] Put 2 Magical Item tokens into your EX area.";
      case "Trainer":
        return "[fanfare] Select another iM@S CG follower on your field and give it Bane or Drain.";
      case "Rookie Trainer":
        return "[act] [engage]: Select another iM@S CG follower on your field and give it [attack]+1.";
  
      case "Lymaga, Forest Champion":
        return "[evolve] [cost02]: Evolve this follower. \n Storm. Bane. \n [fanfare] Look at the top 4 cards of your deck. You may summon a Hunter follower that costs 4 or less from among them. Put the rest on the bottom of your deck in any order.";
      case "Amataz, Fairy Blader":
        return "[fanfare] Put a Fairy token into your EX area. Give each Pixie follower in your EX area [attack]+1 / [defense]+1. \n [act] [engage]: Select up to 2 Pixie followers that cost 1 or less on your field and give them Storm.";
      case "Greenbrier Elf":
        return "[fanfare] Banish a Pixie token from your EX area: Look at the top 4 cards of your deck. You may reveal a [forestcraft] card from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Wildwood Matriarch":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] If this card was put onto the field by an ability, evolve it.";
      case "Fairy Dragon":
        return "Ward. \n [fanfare] Give this follower [attack]+1 for every Pixie token on your field and in your EX area. \n [lastwords] Put a Fairy Wisp and Fairy token into your EX area.";
      case "Woodland Cleaver":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If this card was put onto the field by an ability, give it Storm.";
      case "Assault Jaguar":
        return "Rush. \n [lastwords] Look at the top 2 cards of your deck. You may reveal a Hunter card from among them and add it to your hand. Bury the rest.";
      case "Spiritshine":
        return "Choose one of the following. (1) Select a Pixie token on your field or in your EX area and give it [attack]+2 / [defense]+2. (2) Put 2 Fairy tokens into your EX area.";
      case "Greenwood Guardian":
        return "Ward. \n [fanfare] Bury the top card of your deck. Then, if there are at least 3 Hunter cards in your cemetery, give this follower [defense]+1.";
      case "Crossbow Sniper":
        return "[fanfare] Discard a Hunter card: Select an enemy leader or enemy follower on the field. Deal it 1 damage and draw a card.";
      case "Mallet Monkey":
        return "[evolve] [cost01]: Evolve this follower. \n Storm. \n [fanfare] [cost02]: Search your deck for a Mallet Monkey, summon it, then shuffle your deck.";
      case "Elven Sentry":
        return "This card costs 1 less to play for every Fairy on your field. \n ---------- \n Rush. Assail.";
      case "Synchronized Slash":
        return "[engage] 2 Hunter followers on your field: Select an enemy follower on the field and deal it 4 damage.";

      
      case "Kagemitsu, Matchless Blade":
        return "Rush. \n [fanfare] Give this follower [attack]+X / [defense]+X, where X equals the number of faceup evolved followers in your evolve deck. If X is at least 3, give it Assail. If X is at least 7, give it \"Strike - Refresh this follower. Perform only once per turn.\"";
      case "Ralmia, Sonic Racer":
        return "[evolve] [cost03]: Evolve this follower. \n This card's [evolve] costs 1 less for every other follower on your field. \n Rush.";
      case "Steadfast Samurai":
        return "This follower doesn't take combat damage. \n [act] [cost02]: Give this follower [attack]+1 / [defense]+1 and Rush.";
      case "Hero of Antiquity":
        return "[evolve] [cost01]: Evolve this follower. \n Rush. Aura. \n This card can't be destroyed or banished by abilities. (It can still be destroyed by ability damage.)";
      case "Courtly Dance":
        return "Look at the top 5 cards of your deck. From among them, you may summon any number of [swordcraft] followers that cost 3 or less each, up to a total cost of 7. Put the rest on the bottom of your deck in any order.";
      case "Quickdraw Maven":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Twinsword Master":
        return "Strike - Refresh this follower. Perform only once per turn.";
      case "Grand Acquisition":
        return "[quick] \n Each opponent buries the top 3 cards of their deck.";
      case "Samurai Outlaw":
        return "[evolve] [cost04]: Evolve this follower.";
      case "Adept Thief":
        return "[fanfare] Choose one of the following. (1) Each opponent buries the top card of their deck. (2) Draw a card. Discard a card.";
      case "Petalwink Paladin":
        return "[fanfare] Select an enemy follower on the field. Destroy it and draw a card.";
      case "Levin Scholar":
        return "[fanfare] Search your deck for a Levin follower, reveal it, add it to your hand, then shuffle your deck.";
      case "Breakneck Draw":
        return "[engage] a [swordcraft] follower on your field: Select an enemy follower on the field and destroy it.";
      
      
      case "Kuon, Founder of Onmyodo":
        return "This card costs 1 less to play for every spell and Onmyoji card in your cemetery. \n ---------- \n [fanfare] If there's no Celestial Shikigami on your field, summon one. \n [act] [engage]: Select up to 2 Shikigami followers on your field and give them Storm.";
      case "Mysteria, Magic Founder":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Reveal an Academic follower from your hand: Select an enemy follower on the field and deal it 2 damage. \n While this card is on your field, any Academic follower you play costs 1 less.";
      case "Curse Crafter":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Summon a Paper Shikigami token. \n [act] Bury a Shikigami follower: Select an enemy follower on the field and deal it 4 damage. For the rest of this turn, this card's [act] abilities except [evolve] can't be activated.";
      case "Hulking Giant":
        return "[fanfare] Earth Rite: Select an enemy follower on the field and deal it 5 damage. \n [lastwords] Earth Rite: Deal 3 damage to each enemy leader.";
      case "Shikigami Summons":
        return "Summon a Paper Shikigami token. If there are at least 7 spells and Onmyoji cards in your cemetery, draw a card.";
      case "Demoncaller":
        return "[evolve] [cost01]: Evolve this follower. \n Whenever a Shikigami follower is put onto your field, give it [attack]+1 and Rush.";
      case "Traditional Sorcerer":
        return "Whenever a Shikigami follower is put onto your field, give it Ward. \n [fanfare] If there are at least 7 spells and Onmyoji cards in your cemetery, summon a Paper Shikigami token and give your leader [defense]+2.";
      case "Crimson Meteor Storm":
        return "Spellchain (10) - This card costs 2 less to play. \n ---------- \n Deal 6 damage to each enemy follower on the field. Deal 3 damage to each enemy leader.";
      case "Talisman Disciple":
        return "[lastwords] Search your deck for a Shikigami Summons, reveal it, add it to your hand, then shuffle your deck.";
      case "Charming Gentlemouse":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] [cost02]: Search your deck for a Charming Gentlemouse, summon it, then shuffle your deck.";
      case "Passionate Potioneer":
        return "[fanfare][lastwords] Summon a Magic Sediment token.";
      case "Golem's Rampage":
        return "Bury a Golem follower: Deal 3 damage to each enemy leader and enemy follower on the field.";
      case "Mirror of Truth":
        return "Stack. \n [fanfare] Select an Alchemist follower that costs 3 or less in your cemetery and summon it.";


      case "Garyu, Surpreme Dragonkin":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Draw a card. \n While this card is on your field, each other [dragoncraft] follower on your field has Ward.";
      case "Filene, Whitefrost Dragonewt":
        return "[fanfare] Select an enemy follower on the field and engage it. It doesn't refresh during its controller's next start phase. \n [fanfare] If Overflow is active for you, search your deck for a Whitefrost Whisper, put it into your EX area, then shuffle your deck.";
      case "Phoenix Empress":
        return "Rush. \n [lastwords] Decrease your max play points by 1: Put this card onto its owner's field engaged.";
      case "Wyrm God of the Skies":
        return "This card can only be played from hand. \n ---------- \n [evolve] [cost01]: Evolve this follower. \n [act] [cost02], bury this card from your EX area: Select a follower on your field and give it [attack]+4 / [defense]+4. For the rest of this turn, it can't attack enemies.";
      case "Whitefrost Whisper":
        return "This card costs 1 less to play if Overflow is active for you. \n ---------- \n Select an engaged enemy follower on the field and destroy it. If there's a Filene, Whitefrost Dragonewt on your field, deal 2 damage to the selected follower's leader.";
      case "Ice Dancing Dragonewt":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If Overflow is active for you, give this follower [attack]+1 and Storm.";
      case "Jadelong Tactician":
        return "Storm. \n Strike - Select another follower on your field and give it [attack]+1 / [defense]+1. If it's a Garyu, Supreme Dragonkin, give [attack]+2 / [defense]+2 instead.";
      case "Aquascale Stalwart":
        return "Ward. \n [fanfare] If Overflow is active for you, look at the top 5 cards of your deck. You may reveal a [dragoncraft] follower that costs 5 or more from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Swordwhip Dragoon":
        return "[fanfare] Select up to 2 enemy followers on the field and deal 2 damage divided between them. If Overflow is active for you, deal 4 damage divided between them instead.";
      case "Dragonblader":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Each player puts a Dragon token into their EX area.";
      case "Trident Merman":
        return "[fanfare] Summon 2 Megalorca tokens.";
      case "Dragon Chef":
        return "[fanfare] Give your leader [defense]+2. If there's an amulet on your field, give [defense]+4 instead.";
      case "Flamewinged Might":
        return "Select a follower on your field and give it [attack]+2.";


      case "Ginsetsu, Great Fox":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Put 5 One-Tailed Fox tokens into your EX area.";
      case "Aragavy the Berserker":
        return "[fanfare] [cost05]: Deal 5 damage to each other follower on the field. Give this follower [attack]+2 / [defense]+2 and Storm. \n At the start of your end phase, if Sanguine is active for you, select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Shuten-Doji":
        return "[evolve] [cost01]: Evolve this follower. \n Bane. \n [fanfare] Banish 2 Yokai cards from your cemetery: Evolve this follower.";
      case "Bear Pelt Warrior":
        return "Rush. \n Strike - Deal 1 damage to each leader. \n [lastwords] Give your leader [defense]+4.";
      case "Yuzuki, Righteous Demon":
        return "Bane. \n [fanfare] Each opponent buries a follower. Necrocharge (10) - They bury 2 instead. \n [act] [cost03], discard this card: Select an enemy follower on the field. Deal it 5 damage and bury the top card of your deck.";
      case "Kasha":
        return "[fanfare] Choose one of the following. (1) Select an enemy follower on the field. Deal it 1 damage and bury the top card of your deck. (2) Select a Yokai follower not named Kasha in your cemetery and add it to your hand.";
      case "Cougar Pelt Warrior":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Unleash the Nightmare":
        return "This card costs 1 less to play if there's a Vampire card on your field. \n ---------- \n Summon 3 Forest Bat tokens. Draw 2 cards.";
      case "Zashiki-Warashi":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Antelope Pelt Warrior":
        return "At the start of your main phase, deal 1 damage to your leader.";
      case "Rookie Succubus":
        return "[fanfare][lastwords] Summon a Forest Bat token.";
      case "Demonic Procession":
        return "Look at the top 5 cards of your deck. You may reveal a Yokai follower from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Berserker's Pelt":
        return "Once on each of your turns, when your leader loses defense, select a follower on your field and give it [attack]+1 / [defense]+1. \n [act] [engage], bury this card: Give your leader [defense]+2. Activate only if your leader's defense is 10 or less.";


      case "Wilbert, Grand Knight":
        return "Ward. \n [fanfare] Look at the top 5 cards of your deck. From among them, you may summon a follower with Ward not named Wilbert, Grand Knight that costs 5 or less. Put the rest on the bottom of your deck in any order. \n Whenever a follower with Ward is put from your field into the cemetery, deal 1 damage to each enemy leader.";
      case "Karula, Arts Master":
        return "[evolve] [cost01]: Evolve this follower. \n At the start of your end phase, if you have at least 2 play points, deal 2 damage to each enemy leader. If you have at least 4, draw a card. If you have at least 6, select up to 1 enemy follower on the field and destroy it.";
      case "Saintly Leader":
        return "Ward. \n [act] [engage], banish 3 followers with Ward from your cemetery: Select an enemy follower on the field and banish it.";
      case "Phantom Blade Wielder":
        return "[evolve] [cost01]: Evolve this follower. \n At the start of your end phase, if you have at least 2 play points, select an enemy follower on the field and deal it 2 damage.";
      case "Manifest Devotion":
        return "Look at the top 7 cards of your deck. You may summon up to 1 amulet that costs 5 or less and up to 1 amulet that costs 3 or less from among them. Put the rest on the bottom of your deck in any order.";
      case "Holy Lancer":
        return "[evolve] [cost01]: Evolve this follower. \n Ward. \n [fanfare] If there's another follower with Ward on your field, select an enemy follower on the field and deal it 3 damage.";
      case "Boost Kicker":
        return "[fanfare] [cost0X]: Deal X damage to each enemy follower on the field. X equals a number of your choice. \n At the start of your end phase, recover 1 play point.";
      case "Feather Sanctuary":
        return "[fanfare] Summon a Holy Falcon token. \n [act] [engage], bury an amulet: Summon a Holy Falcon token.";
      case "Winged Staff Priestess":
        return "Ward. \n [lastwords] Search your deck for a Winged Staff Priestess, reveal it, add it to your hand, then shuffle your deck.";
      case "Gravity Grappler":
        return "At the start of your end phase, if you have at least 2 play points, summon a Mystic Artifact token.";
      case "Barrage Brawler":
        return "[evolve] Discard a card: Evolve this follower. \n At the start of your end phase, if you have at least 2 play points, select an enemy leader and deal it 1 damage.";
      case "Holy Counterattack":
        return "[quick] \n This card can't be played during your turn. \n ---------- \n Select an engaged enemy follower on the field and deal it 2 damage. If there's a follower with Ward on your field, deal 4 damage instead.";
      case "Focus":
        return "[quick] \n This card can't be played during your turn. \n ---------- \n If you have at least 2 play points, give your leader [defense]+1 and draw a card.";


      case "Mammoth God's Colosseum":
        return "[fanfare] Each player buries each follower on their field except for one of their choice. \n [lastwords] Search your deck for a Colosseum on High, summon it, then shuffle your deck.";
      case "Badb Catha":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] Choose one of the following. (1) Select another follower on your field and give it [attack]+1 / [defense]+1. (2) Give your leader [defense]+2. (3) Look at the top 3 cards of your deck. Put any number of them on the top of your deck in any order. Put the rest on the bottom in any order.";
      case "Mithra, Daybreak Diety":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Each player rolls a 6-sided die. If they roll a 1, 2, or 3, they draw 2 cards. If they roll a 4, 5, or 6, they discard 2 random cards.";
      case "Fall from Grace":
        return "[quick] \n Select a follower on the field. Banish it and give its leader [defense]+2. Its controller draws a card.";
      case "Colosseum on High":
        return "[fanfare] Each player looks at the top 3 cards of their deck. They may summon a follower from among them. They bury the rest. \n While this card is on the field, if a follower on the field can attack a follower, it can't attack leaders.";
      case "Chaht, Ringside Announcer":
        return "This card costs 3 less to play if there's a Colosseum on High on your field. \n ---------- \n [evolve] [cost01]: Evolve this follower.";
      case "Clash of Heroes":
        return "Select a follower on your field and an enemy follower on the field. Deal the first follower damage equal to the second's attack. Deal the second follower damage equal to the first's attack.";
      case "Biofrabrication":
        return "Select a faceup evolved follower in your evolve deck. Turn it facedown and draw a card.";
      case "Sweet-Tooth Sleuth":
        return "[fanfare] Select an opponent. They reveal their hand.";
      case "Bazooka Goblins":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] Select an enemy card that costs 2 or less on the field and destroy it.";
      case "Sentry Gate":
        return "Whenever an enemy follower on the field attacks, its controller may pay [cost02] to destroy this amulet. If they don't pay, deal 2 damage to the follower.";
  
      case "Izudia, Omen of Unkilling":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If there are at least 3 Hunter cards in your cemetery, select an enemy follower on the field. Change it into an amulet and give it \"[act] [cost02]: Put this card into its owner's cemetery.\" (It keeps all existing abilities, including [evolve] and [feed].)";
      case "Spinaria, Keeper of Enigmas":
        return "Ward. \n [fanfare] Look at the top 4 cards of your deck. From among them, you may reveal up to 1 [forestcraft] follower and up to 1 [forestcraft] spell and add them to your hand. Put the remaining cards on the bottom of your deck in any order. Combo (3): Recover 3 play points.";
      case "Apostle of Unkilling":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Morton the Manipulator":
        return "At the start of your end phase, an opponent chooses one of the following. (1) They can't draw a card during their next start phase. (2) They can't increase their maximum play points by 1 during their next start phase. (3) They can't play followers during their next main phase.";
      case "Fairy Torrent":
        return "[quick] \n Select up to 2 Pixie followers on your field and put them into their owners' EX areas. If at least 1 Pixie follower was put into an EX area by this ability, give your leader [defense]+2.";
      case "Disciple of Unkilling":
        return "[fanfare] Look at the top card of your deck. If it's a Hunter card, you may reveal it and add it to your hand.";
      case "Noah, Vengeful Puppeteer":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] Put 2 Puppet tokens into your EX area. \n Whenever a Puppet is put onto your field, give it [attack]+1 and Storm.";
      case "Mark of the Unkilling":
        return "Select an enemy follower on the field and deal it X damage. X equals its defense minus 1. If there are at least 3 Hunter cards in your cemetery, draw a card.";
      case "Servant of Unkilling":
        return "[fanfare] If there are at least 3 Hunter cards in your cemetery, give your leader [defense]+2.";
      case "Mechanical Bowman":
        return "[fanfare] Banish a card in your EX area: Select an enemy follower on the field and deal it 5 damage.";
      case "Flower Doll":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Put a Puppet token into your EX area.";
      case "Automaton Soldier":
        return "Ward. \n [fanfare] Put 2 Puppet tokens into your EX area.";
      case "Mark of the Six":
        return "[quick] \n The next time your leader would take damage this turn, it doesn't take damage.";
  
      case "Octrice, Omen of Usurpation":
        return "[evolve] [cost02]: Evolve this follower. \n [evolve] [cost00]: Evolve this follower. This ability can be activated if there are at least 10 cards in opponents' cemeteries. \n [fanfare] Each opponent puts the top 2 cards of their deck into their cemetery. \n [act] [cost08]: Select a card in an opponent's cemetery and play it for 0 play points.";
      case "Magna Legacy":
        return "[fanfare] Banish the top half of your deck (round up). Deal 4 damage to each enemy leader and enemy follower on the field. If at least 15 cards were banished by this ability, deal 8 damage instead.";
      case "Apostle of Usurpation":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Each opponent puts the top 2 cards of their deck into their cemetery. Then, if there are at least 10 cards in opponents' cemeteries, draw a card.";
      case "Empyreal Swordsman":
        return "At the start of your end phase, select an enemy follower on the field. Deal 4 damage to it and 2 damage to its leader.";
      case "Confront Adversity":
        return "Summon a Shield Guardian and Knight token. If there is an enemy follower that costs at least 6 play points on the field, give the summoned tokens [attack]+3 / [defense]+3 and recover 2 play points.";
      case "Disciple of Usurpation":
        return "Storm. \n Strike: Each opponent puts the top card of their deck into their cemetery. Then, if there are at least 10 cards in opponents' cemeteries, give this follower [attack]+2.";
      case "Fervent Maachine Soldier":
        return "[fanfare] Discard a Commander card: Search your deck for a Commander card, reveal it, add it to your hand, then shuffle your deck.";
      case "Geno, Machine Artisan":
        return "[evolve] [cost01]: Evolve this follower. \n Whenever you play an amulet, select a follower on your field and give it [defense]+1.";
      case "Servant of Usurpation":
        return "[fanfare] Each opponent puts the top card of their deck into their cemetery. \n During your turn, whenever a card is put from an opponent's deck into the cemetery, give this follower [attack]+1.";
      case "Captain Meteo":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Select an enemy leader and deal it 4 damage.";
      case "Gravikinetic Warrior":
        return "[fanfare] Select a token follower on your field and give it [attack]+2 / [defense]+2.";
      case "Usurping Spineblade":
        return "[quick] \n Select an enemy follower on the field. Deal it 3 damage, and each opponent puts the top card of their deck into their cemetery. Then, if there are at least 10 cards in opponents' cemeteries, deal 2 more damage to the selected follower.";
      case "Avaritia":
        return "Look at the top 4 cards of your deck. You may reveal a Thief card from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. If you revealed an Octrice, Omen of Usurpation, return this card to its owner's hand.";
  
      case "Raio, Omen of Truth":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] Discard a Mage card: Select an enemy follower on the field and deal it 9 damage.";
      case "Lishenna, Omen of Destruction":
        return "[fanfare] Put a Destruction in White and Destruction in Black token into your EX area.";
      case "Apostle of Truth":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] If there are at least 3 Mage followers on your field, give this follower [attack]+2 / [defense]+2 and Ward.";
      case "Safira, Synthetic Beast":
        return "Rush. \n [fanfare] Give this follower [attack]+X. X equals the number of [runecraft] followers in your cemetery. \n [act] [cost05]: Give this follower Storm.";
      case "Destructive Refrain":
        return "Choose one of the following. (1) Search your deck for a Lishenna, Omen of Destruction, reveal it, add it to your hand, then shuffle your deck. (2) [cost02]: Deal X damage to each enemy follower on the field. X equals the number of Idolatry cards on your field.";
      case "Iron Staff Mechanic":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Search your deck for a card that costs 1 play point, put it into your EX area, then shuffle your deck. It costs 1 less to play this turn.";
      case "Truth's Adjudication":
        return "Choose one of the following. If there are at least 2 Mage followers on your field, choose up to 2 instead. (1) Draw 2 cards. (2) Deal 3 damage to each enemy leader. (3) Select an enemy follower on the field and deal it 3 damage.";
      case "Monochromatic Destruction":
        return "[quick] \n Select an enemy follower on the field. Deal it 2 damage and, if there are at least 2 Idolatry cards on your field, deal 2 damage to its leader and give your leader [defense]+2.";
      case "Disciple of Truth":
        return "Whenever you play a Mage card, give your leader [defense]+1.";
      case "Disciple of Destruction":
        return "Ward. \n [fanfare] If there are at least 3 Idolatry cards on your field, draw 2 cards.";
      case "Servant of Destruction":
        return "[evolve] [cost02]: Evolve this follower. \n [fanfare] If there are at least 3 Idolatry cards on your field, change this card's [evolve] cost to 0 for the rest of this turn.";
      case "Honest Cohort":
        return "[quick] \n Select an enemy follower on the field and deal it 3 damage. If there is a Raio, Omen of Truth on your field, deal 6 damage to the selected follower and 3 damage to its leader instead.";
      case "Metaproduction":
        return "[quick] \n Look at the top 2 cards of your deck. You may reveal a spell from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
  
      case "Galmieux, Omen of Disdain":
        return "[evolve] [cost02]: Evolve this follower. \n During your turn, whenever this follower takes ability damage, change its [evolve] cost to 0 for the rest of the turn.";
      case "Electromagical Rhino":
        return "Storm. \n [fanfare] Give this follower [attack]+3. Put the top 4 cards of your deck into your cemetery. If an Electromagical Rhino was put into your cemetery by this ability, repeat this [fanfare]. \n [lastwords] Select any number of cards named Electromagical Rhino in your cemetery (including this one). Return them to your deck and shuffle it.";
      case "Apostle of Disdain":
        return "[evolve] [cost01]: Evolve this follower. \n During your turn, whenever this follower takes ability damage, give it [attack]+1 and Storm.";
      case "God Bullet Golem":
        return "This follower can't attack enemy leaders. \n [act] [engage], put another follower from your field into its owner's cemetery: Select an enemy leader or enemy follower on the field and deal it X damage. X equals the attack of the follower you put into the cemetery.";
      case "Disdainful Rending":
        return "Select a follower on your field and an enemy follower on the field. Deal 1 damage to the first follower and 3 damage to the second.";
      case "Disciple of Disdain":
        return "[act] [cost00]: Select a follower on your field and deal it 1 damage. This ability can be activated once per turn.";
      case "Cursed Stone":
        return "[evolve] [cost01]: Evolve this follower. \n Ward.";
      case "Amethyst Giant":
        return "[fanfare] Discard a card: Give this follower Rush and Aura. \n Strike: Refresh this follower. This ability can be performed once per turn.";
      case "Servant of Disdain":
        return "[fanfare] If Overflow is active for you, select another follower on the field. Deal 1 damage to it and this follower. \n During your turn, whenever this follower takes ability damage, draw a card.";
      case "Silver Automaton":
        return "Ward. \n [lastwords] Put 2 Puppet tokens into your EX area.";
      case "Airship Whale":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Colossal Construct":
        return "Ward. \n [fanfare] Return 5 cards from your cemetery to your deck and shuffle it: Select an enemy follower on the field and deal it 5 damage.";
      case "Total Domination":
        return "Select a follower on your field. Deal 2 damage to it and each enemy follower on the field. Then, if there is a Galmieux, Omen of Disdain on your field, deal 2 more damage to each enemy follower on the field.";
  
      case "Valnareik, Omen of Lust":
        return "While Sanguine is active for you, this follower has Storm. \n Strike: Deal X damage to each enemy leader. X equals the number of times your leader has lost defense this turn. If your leader's defense is 7, give this follower [attack]+2 / [defense]+2.";
      case "Rulenye, Omen of Silence":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Necrocharge (10): Select an enemy follower that costs 3 play points or less on the field and destroy it. \n While this card is on your field, any spell an opponent plays costs 1 more.";
      case "Apostle of Lust":
        return "[act] [engage], give your leader [defense]-1: Select a follower that costs 2 play points or less in your cemetery and put it onto your field. \n Whenever another Demon follower is put onto your field, give your leader [defense]+1.";
      case "Apostle of Silence":
        return "[evolve] [cost01]: Evolve this follower. \n At the start of your end phase, select an enemy leader. If there are 3 cards or less in its controller's hand, deal it 3 damage.";
      case "Disciple of Lust":
        return "[fanfare] Deal 1 damage to each leader. \n Strike: Deal 1 damage to each leader.";
      case "Masked Puppet":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Put a Puppet token into your EX area. \n During your turn, whenever a follower is put from your field into the cemetery, give this follower [attack]+1.";
      case "Wings of Lust":
        return "Choose up to 2 of the following. (1) Select a follower on your field. Give it Rush and deal 1 damage to your leader. (2) Select an enemy follower on the field. Deal 2 damage to it and 1 damage to your leader. (3) Deal 1 damage to your leader. Draw a card. Discard a card.";
      case "Silent Purge":
        return "Select an enemy follower on the field and destroy it. Its controller discards a random card.";
      case "Servant of Lust":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Deal 1 damage to your leader.";
      case "Servant of Silence":
        return "Whenever an opponent discards a card, deal 2 damage to their leader and put the top 2 cards of your deck into your cemetery.";
      case "Hamelin":
        return "[fanfare] Select a token card in your EX area. Put a token of the same name into your EX area.";
      case "Embracing Wings":
        return "Select an enemy follower on the field. Destroy it, deal 2 damage to your leader, and select up to 1 Valnareik, Omen of Lust in your cemetery and add it to your hand.";
      case "Thundering Roar":
        return "Choose one of the following. Necrocharge (10): Choose up to 2 instead. (1) Each opponent discards a random card. (2) Select an enemy follower on the field and deal it 3 damage.";
  
      case "Marwynn, Omen of Repose":
        return "[evolve] [cost04]: Evolve this follower. \n [evolve] Skip your next turn: Evolve this follower.";
      case "Deus Ex Machina":
        return "At the start of your end phase, choose one of the following. (1) Discard your hand. Draw 4 cards. (2) Recover 4 play points.";
      case "Apostle of Repose":
        return "[evolve] [cost02]: Evolve this follower. \n At the start of each opponent's main phase, recover 1 play point.";
      case "Hakrabi":
        return "Ward. \n [fanfare] Discard an amulet: Search your deck for an amulet that costs 1 play point, put it onto your field, then shuffle your deck.";
      case "Ancient Protector":
        return "While this card is on your field, you can't lose the game, and opponents can't win. \n When your leader's defense becomes 0 or less, put this card into its owner's cemetery and change your leader's defense to 1.";
      case "Disciple of Repose":
        return "At the start of each opponent's main phase, select an enemy follower on the field and deal it 1 damage.";
      case "Unidentified Subject":
        return "[evolve] [cost02]: Evolve this follower. \n Whenever you draw a card outside of your start phase, give this follower [attack]+1 / [defense]+1.";
      case "Silver Cog Spinner":
        return "[fanfare] If there are at least 5 cards in your hand, recover 2 play points. If there are 5 or less cards, draw a card.";
      case "Servant of Repose":
        return "At the start of each opponent's main phase, give your leader [defense]+1.";
      case "Demon's Epitaph":
        return "[evolve] Discard a card: Evolve this follower.";
      case "The Saviors":
        return "Choose one of the following. (1) Search your deck for a Marwynn, Omen of Repose, reveal it, add it to your hand, then shuffle your deck. (2) Select an enemy follower with 2 defense or less on the field and banish it.";
      case "Realm of Repose":
        return "[q][act] [engage], put this card into its owner's cemetery: For the rest of this turn, if your leader would take more than 4 damage, it takes 4 instead.";
      case "Ancient Amplifier":
        return "[fanfare] Summon a Mystic Artifact token. [act] [cost01], [engage], put this card into its owner's cemetery: Select a token follower on your field and give it [attack]+2 / [defense]+1.";
  
      case "Mjerrabaine, Omen of One":
        return "[evolve] [cost01]: Evolve this follower. \n Rush. \n At the start of your end phase, if there are 2 cards or less in your hand, deal 3 damage to each enemy leader. If there are 0 cards in your hand, deal 3 damage to each enemy follower on the field.";
      case "Gilnelise, Omen of Craving":
        return "Drain. \n [fanfare] [cost03]: Search your deck for an Apostle of Craving and Craving's Splendor, put them into your EX area, then shuffle your deck. \n [fanfare] If each player has 10 maximum play points, draw 3 cards. \n Whenever you play a [neutral] card, deal 1 damage to each enemy leader.";
      case "Apostle of Craving":
        return "If there is a Gilnelise, Omen of Craving on your field, this card costs 3 less to play from the EX area. \n [evolve] [cost01]: Evolve this follower. \n [fanfare] Select another follower on your field and give it Rush.";
      case "Lyrial, Archer Throne":
        return "[q][act] [engage]: Deal 2 damage to each enemy leader. \n While this card is on your field, your leader doesn't take ability damage.";
      case "Feena, Dynamite Daredevil":
        return "[fanfare] Choose one of the following. (1) Look at the top 5 cards of your deck. You may reveal a follower that costs 1 play point from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. (2) Select an enemy follower that costs 1 play point on the field and destroy it.";
      case "Rosa, Mech Wing Maiden":
        return "[evolve] [cost01]: Evolve this follower. \n Ward.";
      case "Enlightenment":
        return "Select a follower on your field and give it [attack]+1 / [defense]+1. If it's a Mjerrabaine, Omen of One, give [attack]+3 / [defense]+3 and Assail instead, and for the rest of this turn, it has \"This follower doesn't take damage.\"";
      case "Craving's Splendor":
        return "[quick] \n If there is a Gilnelise, Omen of Craving on your field, this card costs 3 less to play from the EX area. \n Select an enemy follower on the field. Deal it 4 damage and give your leader [defense]+1.";
      case "Cat Cannoneer":
        return "[evolve] [cost01]: Evolve this follower.";
      case "Steel Demolitionist":
        return "[fanfare] Banish a card in your EX area: Select an enemy leader or enemy follower on the field and deal it 2 damage.";
      case "Gliesaray":
        return "Select an enemy follower on the field and deal it 2 damage. If there is a Gilnelise, Omen of Craving on your field, banish the selected follower instead.";
  
      case "Cassiopeia":
        return "[fanfare] Select any number of enemy followers on the field and deal X damage divided between them. X equals the total number of cards in your hand and EX area.";
      case "C.C. Woodland Witch":
        return "[fanfare] Select any number of enemy followers on the field and deal X damage divided between them. X equals the total number of cards in your hand and EX area.";
      case "Deepwood Anomaly":
        return "[evolve][cost01]: Evolve this follower. \n When this follower deals attack damage to an enemy leader, you win the game.";
      case "King Elephant":
        return "[evolve][cost04]: Evolve this follower. \n Storm. \n [fanfare] Select any number of cards on your field. Return them to their owners' hands and give this follower [attack]+X / [defense]+X. X equals the number of cards in your hand.";
      case "Fashionista Nelcha":
        return "[act][engage]: Combo (3) - Choose one of the following. (1) Select another follower on your field and give it [attack]+2 / [defense]+2. (2) Select an enemy follower on the field and give it [attack]-2 / [defense]-2.";
      case "Spring-Green Protection":
        return "[act][cost01], [engage], put this card into its owner's cemetery: Select a [forestcraft] follower on your field and give it [defense]+1. Combo (3): Give it [attack]+1 more. \n When this card leaves the field, put a Fairy Wisp token into your EX area.";
      case "Inviolable Verdancy":
        return "[act][cost01], [engage], put this card into its owner's cemetery: Select a [forestcraft] follower on your field and give it [defense]+1. Combo (3): Give it [attack]+1 more. \n When this card leaves the field, put a Fairy Wisp token into your EX area.";
      case "Sukuna, Brave and Small":
        return "[evolve][cost01]: Evolve this follower.";
      case "Dolorblade Demon":
        return "[fanfare][lastwords] Deal 1 damage to each enemy leader and enemy follower on the field.";
      case "Elf Song":
        return "Summon a Fairy token. Combo (3): Give each [forestcraft] follower on your field [attack]+1 / [defense]+1.";
      case "Starry Elf":
        return "[fanfare] Search your deck for an amulet, reveal it, and add it to your hand.";
      case "Fita the Gentle Elf":
        return "[evolve][cost01]: Evolve this follower.";
      case "Dryad":
        return "Strike: Select an enemy follower on the field and give it [attack]-1.";
      case "Beetle Warrior":
        return "[fanfare] Combo (3): Give this follower [attack]+1/[defense]+1 and Storm.";
      case "Ivy Spellbomb":
        return "Select an enemy follower on the field and deal it 5 damage. Combo (3): Deal 3 damage to its leader.";
      case "Mars, Silent Flame General":
        return "[evolve][cost00]: Evolve this follower. \n Whenever an Officer follower is put onto your field, give it [attack]+1.";
      case "Gawain of the Round Table":
        return "Rush. \n [fanfare] Reveal 2 Commander or Arthurian cards in your hand: Recover 2 play points. \n While this card is on your field, the 1st Commander card you play each turn costs 1 less.";
      case "Barbarossa":
        return "If there are at least 3 enemy cards on the field, this card costs 2 less to play. \n [evolve][cost01]: Evolve this follower. \n Assail.";
      case "Perseus":
        return "[fanfare] If there are at least 4 followers on your field (including this one), give this follower [attack]+1 / [defense]+1.";
      case "Cyclone Blade":
        return "Select a Commander follower on your field and deal X damage to each enemy follower on the field. X equals the selected follower's attack.";
      case "Chivalrous Charge":
        return "Select a Commander follower on your field and deal X damage to each enemy follower on the field. X equals the selected follower's attack.";
      case "Shrouded Assassin":
        return "[evolve][cost02]: Evolve this follower. \n Bane.";
      case "Lord General Romeo":
        return "If there is a Princess Juliet on your field, this card costs 2 less to play. \n Ward. \n At the start of your end phase, if there is a Princess Juliet on your field, give your leader [defense]+2.";
      case "Round Table Assembly":
        return "Choose one of the following. (1) Search your deck for an Arthurian follower, reveal it, and add it to your hand. (2) Select an Arthurian follower on your field and give it [attack]+1 / [defense]+2.";
      case "Princess Juliet":
        return "If there is a Lord General Romeo on your field, this card costs 2 less to play. \n Storm. \n At the start of your end phase, if there is a Lord General Romeo on your field, select an enemy follower on the field and deal it 2 damage.";
      case "Flail Knight":
        return "Strike: Select an enemy follower on the field. Deal 1 damage to it and its leader.";
      case "Pollux":
        return "[fanfare] If there is a non-Swordcraft follower on your field, give this follower [attack]+1/[defense]+1 and Rush.";
      case "Tristan of the Round Table":
        return "[evolve][cost01]: Evolve this follower. \n Ward.";
      case "Armor of the Stars":
        return "Select a follower on your field. Give it [attack]+1 / [defense]+2 and Aura.";
      case "Wordwielder Ginger":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] You may put a follower from your hand onto your field. Its [fanfare] abilities can't be performed. For the rest of this turn, it can't attack enemies.";
      case "Giant Chimera":
        return "[fanfare] Spellchain (10): Deal 5 damage to each enemy leader and enemy follower on the field. SC (20): Deal 10 damage instead. SC (30): Deal 30 damage instead.";
      case "Star Reader Stella":
        return "[fanfare] Look at the top 4 cards of your deck. Add one of them to your hand, put one into your cemetery, put one on top of your deck, and put one on the bottom of your deck. \n Strike: Look at the top card of your deck. You may put it into your cemetery.";
      case "Europa":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Select a faceup Europa in your evolve deck. Turn it facedown and give this follower [attack]+1 / [defense]+1.";
      case "Chain of Calling":
        return "[quick] \n Look at the top 5 cards of your deck. You may reveal a [runecraft] follower from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. Spellchain (10): Recover 1 play point.";
      case "Noble Instruction":
        return "[quick] \n Look at the top 5 cards of your deck. You may reveal a [runecraft] follower from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. Spellchain (10): Recover 1 play point.";
      case "Freshman Lou":
        return "[fanfare] Search your deck for a spell that costs 1 play point, reveal it, and add it to your hand.";
      case "Magic Illusionist":
        return "[evolve][cost02]: Evolve this follower. \n [lastwords] Earth Rite: Put this follower onto its owner's field.";
      case "Concentration":
        return "Give your leader [defense]+3. Draw a card. Earth Rite: Draw 2 instead.";
      case "Show of Loyalty":
        return "Give your leader [defense]+3. Draw a card. Earth Rite: Draw 2 instead.";
      case "Dazzling Healer":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] If there is a spell in your cemetery, give your leader [defense]+2.";
      case "Mage of Nightfall":
        return "Intimidate. \n [fanfare] Earth Rite: Give this follower [attack]+2/[defense]+1.";
      case "Astrologist of the Mist":
        return "Ward. \n [fanfare] Earth Rite: Give each follower on your field [attack]+1/[defense]+1.";
      case "Magic Owl":
        return "Rush. \n [fanfare][lastwords] Discard a spell: Draw a card.";
      case "Starseer's Telescope":
        return "Stack. \n [fanfare] Look at the top card of your deck.";
      case "Sibyl of the Waterwyrm":
        return "[fanfare] If Overflow is active for you, give this follower [attack]+1 / [defense]+1 and increase your maximum play points by 1. At the start of your end phase, give your leader [defense]+1. If Overflow is active for you, give [defense]+2 instead.";
      case "Kallen, Crimson Yaksha":
        return "[fanfare] If Overflow is active for you, give this follower [attack]+1 / [defense]+1 and increase your maximum play points by 1. At the start of your end phase, give your leader [defense]+1. If Overflow is active for you, give [defense]+2 instead.";
      case "Python":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Search your deck for up to 10 cards and banish them.";
      case "Prime Dragon Keeper":
        return "[fanfare] If Overflow is active for you, give this follower [attack]+1 / [defense]+1 and Intimidate. \n Whenever another [dragoncraft] follower that costs 3 play points or less is put onto your field, select an enemy follower on the field. Deal 2 damage to it and 1 damage to its leader.";
      case "Star Phoenix":
        return "[evolve][cost01]: Evolve this follower. \n During your turn, when you play a [dragoncraft] spell, [cost01]: Put this card from your cemetery onto your field.";
      case "Lightning Blast":
        return "[quick] \n You may play this card for 5 more play points. \n Select an enemy follower on the field and banish it. If you played this card for 5 more play points, instead of banishing that follower, banish each enemy follower on the field.";
      case "Guren Revolt":
        return "[quick] \n You may play this card for 5 more play points. \n Select an enemy follower on the field and banish it. If you played this card for 5 more play points, instead of banishing that follower, banish each enemy follower on the field.";
      case "Venomous Pucewyrm":
        return "[fanfare] Discard a card. \n At the start of your main phase, discard a card.";
      case "Cetus":
        return "[evolve][cost01]: Evolve this follower.";
      case "Dragonewt Fist":
        return "When this card is discarded, you may put it into your EX area. \n ---------- \n Select an enemy follower on the field and deal it 3 damage.";
      case "Divine Tiger":
        return "When this card is discarded, you may put it into your EX area. \n ---------- \n Select an enemy follower on the field and deal it 3 damage.";
      case "Dragonrearer Matilda":
        return "[act][cost01], [engage], put this card into its owner's cemetery: Look at the top 3 cards of your deck. You may reveal a [dragoncraft] follower that costs 3 play points or less from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Aqua Nerid":
        return "Ward. \n [fanfare] Summon a Megalorca token. If Overflow is active for you, give it Storm.";
      case "Hippocampus":
        return "[evolve][cost04]: Evolve this follower. \n Ward.";
      case "Scaled Berserker":
        return "Rush. \n Whenever this follower takes damage, give it [attack]+2 / [defense]+2.";
      case "Dragon's Nest":
        return "[act][engage], put this card into its owner's cemetery: Give your leader [defense]+2. If Overflow is active for you, draw a card.";
      case "Venomfang Medusa":
        return "[act][cost00]: Summon a Serpent token. This ability can be activated once per turn. \n [q][act][engage], put 2 cards named Serpent from your field into their owners' cemeteries: Select an enemy follower on the field and destroy it.";
      case "Howling Demon":
        return "[evolve][cost03]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and deal it 4 damage. If Sanguine is active for you, deal 8 damage instead.";
      case "Demonlord Eachtar":
        return "[fanfare] Necrocharge (10): Select up to 2 [abysscraft] followers that cost 2 play points or less in your cemetery and put them onto your field. Give each other follower on your field [attack]+1 / [defense]+1. NC (20): Give [attack]+3 / [defense]+3 instead. \n While this card is on your field, each [abysscraft] follower on your field has Rush.";
      case "Lelouch, Leader of the Black Knights":
        return "[fanfare] Necrocharge (10): Select up to 2 [abysscraft] followers that cost 2 play points or less in your cemetery and put them onto your field. Give each other follower on your field [attack]+1 / [defense]+1. NC (20): Give [attack]+3 / [defense]+3 instead. \n While this card is on your field, each [abysscraft] follower on your field has Rush.";
      case "Stheno":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Summon a Serpent token. \n Whenever a Serpent is put onto your field, select an enemy follower on the field and deal it 2 damage.";
      case "Trial of the Gorgons":
        return "Search your deck for a Venomfang Medusa, Stheno, and Euryale and put them onto your field.";
      case "Fenrir":
        return "[evolve][cost01]: Evolve this follower. \n During your turn, whenever this follower takes damage, select an enemy follower on the field and deal it 3 damage.";
      case "Euryale":
        return "[fanfare] Put a Serpent token into your EX area. \n While this card is on your field, each Venomfang Medusa and Stheno on your field has Aura.";
      case "Grave Desecration":
        return "[fanfare] Put the top 2 cards of your deck into your cemetery. \n [act][cost02], [engage], put this card into its owner's cemetery: Select a Departed follower in your cemetery and add it to your hand.";
      case "Emperor's Command":
        return "[fanfare] Put the top 2 cards of your deck into your cemetery. \n [act][cost02], [engage], put this card into its owner's cemetery: Select a Departed follower in your cemetery and add it to your hand.";
      case "Demonic Drummer":
        return "Ward. \n [fanfare][cost02]: Search your deck for a Demonic Drummer and put it onto your field. \n [lastwords] Give your leader [defense]+1.";
      case "Castor":
        return "[lastwords][cost02]: Put this follower onto its owner's field.";
      case "Frogbat":
        return "[evolve] Banish 2 cards in your cemetery: Evolve this follower.";
      case "Scorpius":
        return "Bane. \n Strike: Deal 1 damage to each leader.";
      case "Venomous Bite":
        return "Summon a Serpent token. If there is a Gorgon follower on your field, give the Serpent token Rush and Assail.";
      case "Aether of the White Wing":
        return "Ward. \n[fanfare] Search your deck for a [havencraft] follower with a different name from this card that costs less than your maximum play points and put it onto your field.";
      case "Dark Jeanne":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Deal 2 damage to each other follower on the field. Give each other follower on your field [attack]+2.";
      case "Zoe, Princess of Goldenia":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Deal 2 damage to each other follower on the field. Give each other follower on your field [attack]+2.";
      case "Andromeda":
        return "[fanfare] For the rest of this turn, your leader and each follower currently on your field (including this one) have \"This doesn't take ability damage.\"";
      case "Globe of the Starways":
        return "[fanfare] Search your deck for an amulet, reveal it, and add it to your hand. \n [q][act] [cost02], [engage], put this card into its owner's cemetery: Give your leader [defense]+1. Draw a card.";
      case "Dark Charisma":
        return "[fanfare] Search your deck for an amulet, reveal it, and add it to your hand. \n [q][act] [cost02], [engage], put this card into its owner's cemetery: Give your leader [defense]+1. Draw a card.";
      case "Star Priestess":
        return "[evolve] Banish an amulet on your field: Evolve this follower. \n [fanfare][engage] 2 amulets on your field: Select an enemy follower on the field. Deal it 3 damage and give your leader [defense]+3.";
      case "Calydonian Boar":
        return "Rush. \n Once per turn, when an amulet you control leaves the field, give this follower [attack]+2/[defense]+2 and Assail.";
      case "Star Torrent":
        return "[quick] \n Deal 3 damage to each engaged enemy follower on the field. If there is an amulet on your field, give your leader [defense]+2.";
      case "Starchaser Sprite":
        return "[fanfare][engage] 2 amulets on your field: Draw 2 cards. Discard a card.";
      case "Sister of Punishment":
        return "Once per turn, when an amulet you control leaves the field, select an enemy follower on the field and deal it 2 damage.";
      case "Mist Shaman":
        return "[evolve][cost01]: Evolve this follower.";
      case "Octobishop":
        return "Ward. \n At the start of your end phase, give this follower [defense]+2.";
      case "Candelabra of Prayers":
        return "Once per turn, when another amulet is put onto your field, give your leader [defense]+1.";
      case "Zodiac Demon":
        return "[act][engage], discard a follower: Select an enemy follower on the field. Deal X damage to it and Y damage to its leader. X equals the discarded follower's cost. Y equals half the discarded follower's cost (rounded up).";
      case "Israfil":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Give your leader [defense]+4. \n Strike: Deal 3 damage to each enemy follower on the field.";
      case "Grimnir, War Cyclone":
        return "[evolve][cost02]: Evolve this follower. \n Ward.";
      case "Arriet, Soothing Harpist":
        return "[fanfare] Select an engaged follower on your field. Give it [attack]+2 / [defense]+2 and refresh it. For the rest of this turn, it can't attack enemies.";
      case "Staircase to Paradise":
        return "Whenever a follower is put from your field into a cemetery, put a soul counter on this card. \n [act][engage], put this card into its owner's cemetery: Look at the top 5 cards of your deck. You may reveal up to 2 followers from among them and add them to your hand. Put the remaining cards on the bottom of your deck in any order. This ability can be activated if this card has at least 6 soul counters.";
      case "Purehearted Singer":
        return "[fanfare][lastwords] Draw a card.";
      case "Goblin Princess":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Search your deck for a [neutral] follower that costs 1 play point and put it onto your field.";
      case "Mystic Ring":
        return "[quick] \n Put a card from your hand on the bottom of your deck. Draw a card.";
      case "Owlcat":
        return "[evolve][cost01]: Evolve this follower.";
      case "Mr. Full Moon":
        return "[fanfare][lastwords] Select an enemy follower on the field and give it [attack]-3/[defense]-3.";
      case "Night's Way":
        return "[act][engage]: If there are no cards in your EX area, put the top card of your deck into your EX area.";
  
      
      case "Beauty and the Beast":
        return "Rush. Aura. \n [fanfare] Put a Fable counter on this card. If this card was put onto the field from anywhere other than your hand, give it Storm. \n [act][cost01], remove any number of Fable counters from this card: Give this follower [attack]+X / [defense]+X. X equals the number of counters removed.";
      case "Cosmos Fang":
        return "[evolve][cost01], return another follower on your field to its owner's hand: Evolve this follower. \n [fanfare] Search your deck for a Beast follower, reveal it, and add it to your hand. If it costs 2 play points or less, you may put it onto your field instead.";
      case "Magical Fairy, Lilac":
        return "[act][engage]: Put a Fable counter on this card. \n [act][cost01], remove a Fable counter from this card: Select an enemy follower on the field and destroy it.";
      case "Slade Blossoming Wolf":
        return "[act][engage]: Put a Fable counter on this card. \n [act][cost01], remove a Fable counter from this card: Select an enemy follower on the field and destroy it.";
      case "Elf Twins' Assault":
        return "[quick] \n Select up to 2 enemy followers on the field and deal X damage divided between them. X equals the number of cards in your EX area.";
      case "Abby the Axe Girl":
        return "Strike: Give this follower [attack]+1. Then, if this follower has at least 5 attack, deal 2 damage to each enemy leader.";
      case "Gerbera Bear":
        return "[evolve][cost01]: Evolve this follower. \n Whenever a card on your field is returned to hand, give your leader [defense]+1.";
      case "Flower Princess":
        return "[fanfare] Put a Fairy token into your EX area. Combo (3): Put a Fable counter on this card. \n [act][engage], remove a Fable counter from this card: Select an enemy follower on the field and deal it 3 damage.";
      case "Wood of Brambles":
        return "[fanfare] Summon a Fairy token. Combo (3): Give it Rush. \n At the start of your main phase, destroy this card. \n While this card is on your field, your followers have \"Follower Strike: Deal 2 damage to the enemy follower.\"";
      case "Fen Sprite":
        return "[fanfare] Select an enemy follower on the field. During its controller's next turn, it can't attack enemies.";
      case "Tweedle Dum, Tweedle Dee":
        return "[evolve][cost01]: Evolve this follower.";
      case "Floral Breeze":
        return "Select a card on your field. Return it to its owner's hand and give your leader [defense]+1.";
      case "Woodland Band":
        return "[fanfare] Look at the top 4 cards of your deck. You may put a Fable follower from among them into your EX area. Put the remaining cards on the bottom of your deck in any order. \n [act][engage], put this card into its owner's cemetery: Select a Fable follower on your field and put a Fable counter on it.";
      case "Cinderella":
        return "Storm. \n [fanfare] If there is another Fable follower on your field, put a Fable counter on this card. \n Strike, remove a Fable counter from this card: Look at the top 4 cards of your deck. You may put a follower that costs 5 play points or less from among them onto your field. Put the remaining cards into your cemetery.";
      case "Valiant Fencer":
        return "[evolve][cost01]: Evolve this follower. This ability can be activated if there are 2 cards or less in your hand. \n [fanfare] Search your deck for a Heroic card with a different name from this card, reveal it, and add it to your hand.";
      case "Maisy, Red Riding Hood":
        return "[fanfare] If there is another Fable follower on your field, put a Fable counter on this card. \n [act][cost01], [engage], remove a Fable counter from this card: Select an enemy follower on the field and destroy it.";
      case "Amerro, Spear Knight":
        return "[evolve][cost03]: Evolve this follower. \n Strike: If there is another Heroic follower on your field, give this follower [attack]+1 / [defense]+1.";
      case "Castle in the Sky":
        return "[fanfare] Search your deck for a follower with Storm, reveal it, and add it to your hand. \n [act][engage], put this card into its owner's cemetery: Select a follower with Storm on your field and give it [attack]+1. \n [act][cost10], [engage], put this card into its owner's cemetery: You may put any number of followers with Storm from your hand onto your field. Give them [attack]+2/[defense]+2.g";
      case "Young Ogrehunter Momo":
        return "Assail. \n [fanfare] If there is another Fable follower on your field, give this follower Rush. \n Follower Strike: If the enemy follower has 5 defense or less, draw a card, then discard a card.";
      case "Mach Knight":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] If this card was put onto the field from anywhere other than your hand, give it Storm.";
      case "Kiss of the Princess":
        return "If there is a Princess follower on your field, this card costs 1 less to play. \n Choose one of the following. (1) Select a follower on your field and give it [attack]+1. You may put a Fable counter on it. (2) Select up to 3 [swordcraft] followers in your cemetery. Return them to your deck, shuffle it, and draw a card.";
      case "Rabbit Ear Attendant":
        return "[fanfare] If there is another Fable follower on your field, draw a card.";
      case "Old Man and Old Woman":
        return "Bane.";
      case "Bladed Hedgehog":
        return "[evolve][cost02]: Evolve this follower. \n During your turn, whenever an enemy follower is destroyed, give this follower [attack]+1.";
      case "Ironwrought Defender":
        return "[fanfare] If there are at least 2 Heroic cards in your cemetery, give this follower [defense]+1 and Ward.";
      case "Heroic Entry":
        return "Look at the top 4 cards of your deck. You may put a [swordcraft] follower that costs 3 play points or less from among them onto your field. If it's a Heroic follower, give it [attack]+1/[defense]+1. Put the remaining cards on the bottom of your deck in any order.";
      case "Wizardess of Oz":
        return "[fanfare] Summon a Magic Sediment token. Add 1 to a Stack on your field. Draw a card. \n [q][act] Earth Rite: The next spell you play this turn costs 4 less. This ability can be activated once per turn.";
      case "Witch of Calamity, Millie Parfait":
        return "[fanfare] Summon a Magic Sediment token. Add 1 to a Stack on your field. Draw a card. \n [q][act] Earth Rite: The next spell you play this turn costs 4 less. This ability can be activated once per turn.";
      case "Mystic King":
        return "[evolve][cost02]: Evolve this follower. \n [act] Put another Chess follower from your field into its owner's cemetery: Select an enemy follower on the field and deal it 5 damage. For the rest of this turn, this card's [act] abilities except [evolve] can't be activated.";
      case "Falise, Leonardian Mage":
        return "[fanfare] Earth Rite: Give this follower Storm. \n [fanfare] Spellchain (7): Deal 4 damage to each enemy follower on the field.";
      case "Milady, Mystic Queen":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Summon a Magical Pawn token. Put a Magical Pawn token into your EX area.";
      case "Check":
        return "Select an enemy follower on the field. Deal it 4 damage and look at the top 3 cards of your deck. You may reveal a Chess card with a different name from this card from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.Select an enemy follower on the field.";
      case "Mr. Heinlein, Shadow Mage":
        return "[fanfare] Put the top 4 cards of your deck into your cemetery. Recover X play points. X equals the number of spells put into your cemetery by this ability. \n [act][engage], discard a spell: Select an enemy follower on the field and deal it 4 damage.";
      case "Magical Knight":
        return "[evolve][cost01]: Evolve this follower. \n Whenever another Chess follower is put onto your field, give it [attack]+1.";
      case "Gingerbread House":
        return "Stack. \n [fanfare] Give your leader [defense]+3.";
      case "It's a Sweets Buffet!":
        return "Stack. \n [fanfare] Give your leader [defense]+3.";
      case "Witch of Sweets":
        return "[evolve][cost00]: Evolve this follower.";
      case "Magical Rook":
        return "[fanfare] If there is a Magical Pawn in your EX area, give this follower [defense]+1 and Ward.";
      case "Magical Bishop":
        return "[fanfare] Put a Magical Pawn token into your EX area. \n At the start of your end phase, if there is another Chess follower on your field, deal 1 damage to each enemy leader and give your leader [defense]+1.";
      case "Blitz":
        return "Select an enemy follower on the field and deal it X damage. X equals the number of cards named Magical Pawn on your field plus 2.";
      case "Witch's Cauldron":
        return "Stack. \n [fanfare] Look at the top 4 cards of your deck. You may reveal a card with Earth Rite from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "The Cauldron of Calamity":
        return "Stack. \n [fanfare] Look at the top 4 cards of your deck. You may reveal a card with Earth Rite from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Jabberwock U":
        return "[fanfare] Put another follower from your field into its owner's cemetery: Reveal the top card of your deck. Repeat until you reveal a follower that costs more than the follower you put into the cemetery and put it onto your field. Shuffle the remaining cards and put them on the bottom of your deck.";
      case "Lævateinn Dragon":
        return "[evolve][cost01]: Evolve this follower into an evolved follower with \"Lævateinn Dragon\" in its name.";
      case "Red Ragewyrm":
        return "[act][engage]: Give this follower [attack]+5. If Overflow is active for you, give [attack]+10 instead.";
      case "Draconir, Knuckle Dragon":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Summon a Draconic Weapon token.";
      case "Tilting at Windmills":
        return "[act][cost03], [engage]: You may put a follower from your hand onto your field and give it \"At the start of your end phase, destroy this card.\"";
      case "Master of Draconic Arts":
        return "Assail. Ward. \n [fanfare] If Overflow is active for you, give this follower [attack]+4 and Rush.";
      case "Hammer Dragonewt":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Look at the top 4 cards of your deck. You may reveal an Armed spell from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Draconic Smash":
        return "[quick] \n Select an enemy follower on the field. Deal it 3 damage and summon a Draconic Weapon token.";
      case "Elder Tortoise":
        return "[fanfare] Gain 1 Evolution Point. If Overflow is active for you, give this follower [attack]+2 / [defense]+2.";
      case "Trinity Dragon":
        return "Intimidate.";
      case "Dragon Summoner":
        return "[evolve][cost01]: Evolve this follower.";
      case "Lance Lizard":
        return "[fanfare] If Overflow is active for you, summon a Draconic Weapon token. \n Once on each of your turns, when this follower is selected for an ability, give it [attack]+1 and deal 1 damage to each enemy leader.";
      case "Armor Burst":
        return "Select an Armed follower on your field and an enemy follower on the field. Put the first follower into its owner's EX area, deal 3 damage to the second, and summon a Draconic Weapon token.";
      case "Dark Alice":
        return "Rush. \n Strike: Each opponent discards a card. \n [lastwords] Banish the top 10 cards of your deck: Put this follower onto its owner's field. Discard a card.";
      case "Masquerade Ghost":
        return "[evolve][cost01]: Evolve this follower. \n Whenever a Ghost is put onto your field, give it [attack]+1.";
      case "Odile, Black Swan":
        return "[fanfare] Deal 2 damage to each enemy leader and enemy follower on the field. Necrocharge (20): Give this follower Storm. \n Strike: Deal 2 damage to each enemy leader and enemy follower on the field.";
      case "Demonium, Punk Devil":
        return "Ward. \n [act] Give your leader [defense]-2: Give this follower Bane. \n This ability can be activated once per turn. \n [lastwords] Give your leader [defense]+2.";
      case "Baccherus, Peppy Ghostie":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] If there is a Gargantuan Ghost on your field, draw a card. \n This follower's name is also Ghos";
      case "Demon Maestro":
        return "[act] Give your leader [defense]-2: Draw a card. This ability can be activated once per turn.";
      case "Trombone Devil":
        return "[evolve][cost01]: Evolve this follower. \n At the start of your end phase, if Sanguine is active for you, select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Furtive Fangs":
        return "Select a follower on your field. For the rest of this turn, it has \"Strike: Select an enemy follower on the field and deal it X damage. X equals this follower's attack.\"";
      case "Pumpkin Necromancer":
        return "[fanfare] Put a Gargantuan Ghost token into your EX area.";
      case "Parade Raven":
        return "[fanfare] Put another follower from your field into its owner's cemetery: Select a follower that costs 5 play points or less in your cemetery and put it onto your field.";
      case "Mischievous Zombie":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Discard a card: Summon a Ghost token. If you discarded a Departed card, draw a card.";
      case "Devilish Flautist":
        return "Rush. \n [fanfare] Discard a random card: Give this follower [attack]+1 and Drain.";
      case "Infernal Orchestration":
        return "Deal 1 damage to your leader. The next time you put a follower onto your field this turn by playing it, give it [attack]+1 / [defense]+1.";
      case "Princess Snow White":
        return "Ward. \n [fanfare] If this card was put onto the field from your hand, put a Fable counter on it. If not, give it [attack]+1 / [defense]+1. \n [lastwords] If this card had a Fable counter, put this card into its owner's EX area.";
      case "Diamond Master":
        return "[evolve][cost03]: Evolve this follower. \n [fanfare] Choose one of the following. (1) Give this follower Storm. (2) Give this follower Ward. \n Whenever an opponent is selecting cards for an ability, if they can select this card, they must select it.";
      case "Odette, White Swan":
        return "[fanfare] Give [defense]+2 to your leader and each other follower on your field. \n [lastwords] Give [defense]+2 to your leader and each follower on your field.";
      case "Wingy Chirpy Gemstone":
        return "[evolve][cost02]: Evolve this follower. \n Ward.";
      case "Alice's Adventure":
        return "[fanfare] Search your deck for a Fable card, reveal it, and add it to your hand. \n [act][cost01], [engage], put this card into its owner's cemetery: Select a Fable follower on your field and give it Rush and Assail.";
      case "White Knight":
        return "If your leader's [defense] is 5 or less, this card costs 5 less to play. \n Rush. Ward.";
      case "Ruby Falcon":
        return "[evolve][cost01]: Evolve this follower. \n Ward. \n [act][cost02]: Give this follower Storm. \n Whenever another follower you control with Storm or Ward attacks, deal 1 damage to each enemy leader.";
      case "March Hare's Teatime":
        return "[fanfare] Look at the top 5 cards of your deck. You may put a Fable follower that costs 5 play points or less from among them onto your field. Put the remaining cards on the bottom of your deck in any order. \n [act][cost02], [engage], put this card into its owner's cemetery: Select a Fable follower that costs 3 play points or less in your cemetery and put it onto your field.";
      case "Tin Soldier":
        return "[fanfare] If this card was put onto the field from anywhere other than your hand, put a Fable counter on it. \n [act] Remove a Fable counter from this card: Select an enemy leader or enemy follower on the field and deal it 2 damage.";
      case "Pinion Prince":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Select a Fable card in your cemetery and put it into your EX area. You may put a Fable counter on it.";
      case "Birdkeeping Disciple":
        return "Ward. \n [fanfare][engage] an amulet on your field: Summon a Holy Falcon token.";
      case "Amethyst Lion":
        return "Storm. \n [fanfare] Select another follower with Storm or Ward on your field and give it [attack]+1.";
      case "Bejeweled Shrine":
        return "[act][cost01], [engage]: Select a follower with Storm or Ward on your field and give it [attack]+1 / [defense]+1.";
      case "Alice, Wonderland Explorer":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Put a Fable counter on this card. \n [act] Remove a Fable counter from this card: Select a Fable follower on your field or in your EX area and put a Fable counter on it.";
      case "Angel of Chaos":
        return "Ward. \n [act] Banish 3 Fallen Angel cards in your cemetery: Select an enemy follower on the field. Steal it and refresh it. This ability can be activated once per turn. (Stolen followers are moved to your field. When they leave the field, they are put into their owner's corresponding zone.)";
      case "Rapunzel":
        return "Ward. \n If this follower has no Fable counters, it can't attack enemies.";
      case "Seraph of Sin":
        return "[fanfare] Select an enemy leader or enemy follower on the field and deal it 2 damage. \n [lastwords] Select a Fallen Angel card that costs 3 play points or less in your cemetery and add it to your hand.";
      case "Garuel, Seraphic Leo":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] You may put a [neutral] follower that costs X play points or less from your hand onto your field and give it \"At the start of your end phase, put this card on the bottom of its owner's deck.\" X equals your maximum play points.";
      case "Actress Feria":
        return "[act][engage]: Select another Fable follower on your field and put a Fable counter on it.";
      case "Humpty Dumpty":
        return "[evolve][cost00]: Evolve this follower.";
      case "Winged Inversion":
        return "Choose one of the following. (1) Discard an Angel follower: Select an enemy follower on the field and destroy it. (2) Discard a Fallen Angel follower: Give your leader [defense]+3. Draw a card.";
      case "Angel of Darkness":
        return "[act][engage], put a Fallen Angel follower from your field into its owner's cemetery: Select an enemy follower on the field and deal it 4 damage.";
      case "Harbringer of the Night":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and deal it 1 damage.";
      case "Eggsplosion":
        return "Deal X damage to each follower on the field and each enemy leader. X equals the number of cards named Eggsplosion or Humpty Dumpty in your cemetery plus 1. (This card doesn't count.)";
      
      
      case "Tazuna Hayakawa [Traccen Reception]":
        return "Ward. [fanfare] Select an Umamusume follower or Umamusume amulet that costs 4 play points or less in your cemetery and put it onto your field.";
      case "Riko Kashimoto":
        return "[act][engage]: Select an Umamusume follower on your field and give it [attack]+1. If it's a racing follower, give it [attack]+2 instead.";
      case "Aoi Kiryuin":
        return "[act][engage]: Select an Umamusume follower on your field and give it [defense]+1. If it's a racing follower, give it [defense]+2 instead.";
      case "Silence Suzuka":
        return "[evolve][cost02]: Evolve this follower. \n [feed][cost01]: Race this follower. \n Storm.";
      case "Smart Falcon":
        return "[feed][cost01]: Race this follower. \n [fanfare] Return any number of other Umamusume cards on your field to their owners' hands: Deal X damage to each enemy follower on the field. X equals 2 times the number of cards returned.";
      case "Gold City":
        return "[feed][cost01]: Race this follower. \n [fanfare] Recover 3 play points. \n While there are at least 8 cards on the field, this follower has Storm.";
      case "Eat Fast! Yum Fast!":
        return "Choose one of the following. (1) Search your deck for a follower with Storm, reveal it, and add it to your hand. (2) Select a follower with Storm on your field and give it [attack]+3.";
      case "Shinko Windy":
        return "[feed][cost01]: Race this follower. \n [fanfare] Look at the top card of your deck. You may put it on the bottom of your deck.";
      case "Eishin Flash":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Select up to 1 enemy follower on the field and return it to its owner's hand.";
      case "Systematic Squats":
        return "[fanfare] Draw a card. \n When this card leaves the field, select an Umamusume follower on your field and give it [attack]+1 / [defense]+1.";
      case "Marvelous Sunday":
        return "[feed][cost01]: Race this follower. \n [fanfare] Return another card on your field to its owner's hand: Give your leader [defense]+2.";
      case "Yukino Bijin":
        return "[feed][cost01]: Race this follower. \n Ward. \n[fanfare] Return another card on your field to its owner's hand: Give this follower [attack]+1/[defense]+1.";
      case "Ines Fujin":
        return "[feed][cost01]: Race this follower. Rush. Assail. \n [fanfare] Select another card on your field and return it to its owner's hand.";
      case "Taiki Shuttle":
        return "[feed][cost01]: Race this follower. \n When this card is returned to hand from your field, select an enemy follower on the field and deal it 2 damage.";
      case "Haru Urara":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. For the rest of this turn, this follower doesn't take damage.";
      case "Tokai Teio":
        return "[evolve][cost02]: Evolve this follower. \n [feed][cost01]: Race this follower. \n [fanfare] Select an enemy follower on the field and deal it X damage. X equals 2 times the number of followers on your field, including this one.";
      case "Narita Brian":
        return "[feed][cost01]: Race this follower. \n Bane. Ward. Aura. \n [act][engage]: Select an enemy leader or enemy follower on the field and deal it 5 damage.";
      case "Winning Ticket":
        return "[feed][cost01]: Race this follower. \n Storm. \n [fanfare] If there is a Trial Initiation and Narita Taishin in your cemetery, give this follower [attack]+3 / [defense]+1.";
      case "Outrunning the Encroaching Heat":
        return "Select a follower on your field. Give it Storm and, if it's an Umamusume follower, [attack]+1 / [defense]+1.";
      case "Air Groove":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Select up to 1 other follower on your field and refresh it. For the rest of this turn, that follower can't attack enemies.";
      case "Hishi Amazon":
        return "[feed][cost01]: Race this follower. \n Rush. \n [fanfare][cost03]: Search your deck for an Umamusume follower that costs 3 play points and put it onto your field.";
      case "Trial Initiation":
        return "Choose one of the following. (1) Look at the top 2 cards of your deck. You may reveal an Umamusume card from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. (2) Select a BNW follower in your cemetery and add it to your hand.";
      case "Sirius Symboli":
        return "[feed][cost01]: Race this follower. \n Bane.";
      case "Narita Taishin":
        return "[feed][cost01]: Race this follower. \n Rush.";
      case "Symboli Rudolf":
        return "[feed][cost01]: Race this follower. \n [lastwords] Search your deck for a Tokai Teio, reveal it, and add it to your hand.";
      case "Biko Pegasus":
        return "[feed][cost01]: Race this follower. \n On Race: Select an enemy follower on the field and engage it.";
      case "Fuji Kiseki":
        return "[feed][cost01]: Race this follower. \n [act][cost03], [engage]: Select an enemy follower on the field and deal it 3 damage.";
      case "Agnes Tachyon":
        return "[evolve][cost01]: Evolve this follower. \n [feed][cost01]: Race this follower. \n Whenever you play a spell, select an enemy follower on the field and give it [attack]-1 / [defense]-1.";
      case "Daiwa Scarlet":
        return "[feed][cost01]: Race this follower. \n [fanfare] Search your deck for an Umamusume spell, reveal it, and add it to your hand. \n While this card is on your field, the 1st Umamusume spell you play each turn costs 1 less to play. When you play a spell, if it's your 3rd this turn, select an Umamusume follower on your field. Give it and this follower Storm.";
      case "Vodka":
        return "If there is a Daiwa Scarlet on your field, this card costs 2 less to play. \n [feed][cost01]: Race this follower. \n Once per turn, when you play a spell, give each Umamusume follower on your field [attack]+1 / [defense]+1 and Rush.";
      case "Make! Some! NOISE!":
        return "[quick] \n Select an enemy follower on the field and deal it 3 damage. If there is an Umamusume card on your field, deal 4 damage instead.";
      case "Zenno Rob Roy":
        return "[feed][cost01]: Race this follower. \n Whenever another one of your followers races, look at the top 4 cards of your deck. You may reveal a spell or amulet from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Agens Digital":
        return "[feed][cost01]: Race this follower. \n On Race: Draw a card, then discard a card.";
      case "Lamplit Training of a Witch-to-Be":
        return "[quick] \n Select an enemy follower on the field and deal it 2 damage. If there is a racing follower on your field, deal 3 damage instead.";
      case "Admire Vega":
        return "[feed][cost01]: Race this follower. \n [act][engage]: Select a spell that costs 2 play points or less in your hand and put it into your EX area. For the rest of this turn, it costs 0 play points to play.";
      case "Kawakami Princess":
        return "[feed][cost01]: Race this follower. \n [fanfare] Discard a card: Select an enemy follower on the field and deal it 4 damage.";
      case "Nakayama Festa":
        return "[feed][cost01]: Race this follower. \n [fanfare] Deal 5 damage to each enemy leader and enemy follower on the field. Discard your hand.";
      case "Tosen Jordan":
        return "[feed][cost01]: Race this follower. \n [lastwords] Select a spell in your cemetery and add it to your hand.";
      case "Narita Top Road":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Draw 2 cards, then discard a card.";
      case "Special Week":
        return "[evolve][cost01]: Evolve this follower. \n [feed][cost01]: Race this follower. \n [fanfare] Look at the top card of your deck. If it's an Umamusume card, you may reveal it and add it to your hand.";
      case "Oguri Cap":
        return "[feed][cost01]: Race this follower. \n[feed][feed][cost02]: Race this follower 2 times. \n [feed][feed][feed][cost03]: Race this follower 3 times. \n On Race: Give this follower [attack]+2/[defense]+1. \n [fanfare] Discard 2 cards: Give this follower Storm. \n Strike: Deal 3 damage to each enemy follower on the field.";
      case "Seiun Sky":
        return "[feed][cost01]: Race this follower. \n Storm. Intimidate. \n Strike: Give this follower [attack]+1.";
      case "Champion's Passion":
        return "[fanfare] If there is another Umamusume card on your field, select an enemy follower on the field and deal it 4 damage. \n At the start of your main phase, select an enemy leader or enemy follower on the field and deal it 4 damage.";
      case "King Halo":
        return "[feed][cost01]: Race this follower. \n [fanfare] Choose one of the following. (1) Put the top card of your deck into your EX area. Do this 3 times. (2) Search your deck for a Kawakami Princess and put it onto your field.";
      case "Tamamo Cross":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Select up to 1 enemy follower on the field and deal it 2 damage.";
      case "Flowers for You":
        return "Select an Umamusume follower on your field. Give it [attack]+1 and draw a card. If the selected follower is a Seiun Sky, give it [attack]+1 / [defense]+1 more.";
      case "Bamboo Memory":
        return "[feed][cost01]: Race this follower. \n [fanfare] Discard a card: Deal 2 damage to each enemy leader.";
      case "Yaeno Muteki":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Select up to 1 other follower on your field and give it [attack]+1 / [defense]+1.";
      case "Grass Wonder":
        return "[feed][cost01]: Race this follower. \n [fanfare] Deal 2 damage to each enemy follower on the field.";
      case "Super Creek":
        return "[feed][cost01]: Race this follower. \n Ward. \n [fanfare] Give your leader [defense]+5.";
      case "Hishi Akebono":
        return "[feed][cost01]: Race this follower. \n [fanfare] Give your leader [defense]+10.";
      case "Maruzensky":
        return "[evolve][cost01]: Evolve this follower. \n [feed][cost01]: Race this follower. \n [fanfare] Necrocharge (10): Select an enemy follower on the field and give it [attack]-4 / [defense]-4.";
      case "Rice Shower":
        return "[feed][cost01]: Race this follower. \n Ward. \n [fanfare] Select an enemy follower on the field. Deal it 3 damage and put the top 2 cards of your deck into your cemetery. \n [lastwords] Select an Umamusume follower with a different name from this card in your cemetery and add it to your hand.";
      case "Nice Nature":
        return "[feed][cost01]: Race this follower. \n [fanfare] Select an enemy follower on the field and give it [attack]-1 / [defense]-1. \n [lastwords] Each opponent discards a card.";
  
      case "7 More Centimeters":
        return "This card can only be played if there are at least 20 Umamusume cards in your cemetery. \n Destroy each enemy follower on the field. Draw 3 cards. Each opponent discards 3 cards.";
      case "Fine Motion":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Give your leader [defense]+2. Put the top 2 cards of your deck into your cemetery.";
      case "Mayano Top Gun":
        return "[feed][cost01]: Race this follower. \n Rush. \n [fanfare] If there are 4 other Umamusume cards on your field, give this follower Storm. \n [fanfare] If there are at least 5 Umamusume cards in your cemetery, give this follower [attack]+2.";
      case "My Solo Drawn to Raindrop Drums":
        return "[quick] \n If there are at least 10 Umamusume cards in your cemetery, this card costs 2 less to play. \n Select an enemy follower on the field and destroy it.";
      case "Curren Chan":
        return "[feed][cost01]: Race this follower. \n [act][cost01], [engage]: Select an enemy follower on the field. Deal it 1 damage and put the top card of your deck into your cemetery.";
      case "Twin Turbo":
        return "[feed][cost01]: Race this follower. \n Assail. \n [fanfare] If there are at least 10 Umamusume cards in your cemetery, give this follower Storm.";
      case "Sakura Chiyono O":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Select up to 1 Umamusume card in your cemetery and add it to your hand.";
      case "Seeking the Pearl":
        return "[feed][cost01]: Race this follower. \n [lastwords] Put the top 2 cards of your deck into your cemetery.";
      case "Matikanetannhauser":
        return "[feed][cost01]: Race this follower. \n [fanfare] Select an enemy amulet on the field and destroy it.";
      case "Mejiro McQueen":
        return "[evolve][cost01]: Evolve this follower. \n [feed][cost01]: Race this follower. \n Ward. \n [fanfare] Put an amulet from your field into its owner's cemetery: Select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Gold Ship":
        return "[feed][cost01]: Race this follower. \n [fanfare] Reveal the top card of your deck. Deal X damage to each enemy leader and give your leader [defense]+X. X equals the revealed card's cost. \n [act][cost10]: Give this follower [attack]+10 / [defense]+10.";
      case "Ikuno Dictus":
        return "[feed][cost01]: Race this follower. \n Ward. \n [fanfare] Look at the top 3 cards of your deck. You may reveal an amulet or Umamusume card from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "The Will to Overtake":
        return "[fanfare] Look at the top 3 cards of your deck. Put any number of cards from among them on the top of your deck in any order. Put any remaining cards on the bottom of your deck in any order. \n [act][cost02], [engage], put this card into its owner's cemetery: Draw a card.";
      case "Meisho Doto":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1 / [defense]+1. Search your deck for an amulet that costs 1 play point and put it onto your field.";
      case "Mejiro Ryan":
        return "[feed][cost01]: Race this follower. \n When an amulet or Mejiro Family follower you control leaves the field, give this follower Storm.";
      case "Fate's Forecast":
        return "[fanfare] Select an enemy follower on the field and destroy it. \n [act][engage], put this card into its owner's cemetery: Look at the top card of your deck. If it costs 7 play points, you may reveal it and add it to your hand.";
      case "Inari One":
        return "[feed][cost01]: Race this follower. \n [fanfare] Discard an amulet: Give this follower [attack]+2 and Rush.";
      case "Mejiro Dober":
        return "[feed][cost01]: Race this follower. \n On Race: Give this follower [attack]+1/[defense]+1. Give your leader [defense]+2.";
      case "Mejiro Ardan":
        return "[feed][cost01]: Race this follower. \n Ward. \n At the start of your main phase, if there are no Mejiro Family followers with a different name from this card on your field, return this card to its owner's hand.";
      case "Mejiro Palmer":
        return "[feed][cost01]: Race this follower. \n [fanfare] Search your deck for a Mejiro Family follower and add it to your hand. \n [fanfare] If there is a Make! Some! NOISE! in your cemetery, give this follower [attack]+1 / [defense]+1 and Rush.";
      case "T.M Opera O":
        return "[feed][cost01]: Race this follower. \n [fanfare] Select an enemy follower on the field. Banish it and draw a card.";
      case "Riko Kashimoto [Planned Perfection]":
        return "Rush. \n Strike: If there are no other followers on your field, select an enemy follower on the field. Destroy it and deal 3 damage to its leader.";
      case "Close Knit Ambitions":
        return "Shuffle your deck, then reveal the top 6 cards. You may put any number of Umamusume followers or Umamusume amulets from among them onto your field. Add the remaining cards to your hand.";
      case "Take a Jab!":
        return "At the start of your main phase, roll a 6-sided die. If you roll a 1, deal 5 damage to your leader. If you roll a 2, 3, 4, or 5, draw a card. If you roll a 6, give your leader [defense]+3 and destroy this card.";
      case "Aoi Kiryuin [Trainers' Teamwork]":
        return "Ward. \n [fanfare] Select a faceup Carrot in your evolve deck. Turn it facedown and draw a card. \n Whenever one of your followers races, give it [attack]+1 / [defense]+1.";
      case "Sasami Anshinzawa":
        return "[fanfare] Reveal the top card of your deck. If it costs an odd number of play points, deal 2 damage to each enemy leader. If it costs an even number of play points, deal 2 damage to your leader.";
      case "Tazuna Hayakawa":
        return "Ward. \n [fanfare] Select an Umamusume follower on your field and give it [attack]+1 / [defense]+2.";
  
      case "Crystalia Tia":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Combo (3): Summon a Crystalia Eve token.";
      case "White Wolf of Eldwood":
        return "Storm. \n [lastwords] Look at the top 4 cards of your deck. You may put a [forestcraft] follower from among them onto your field. Put the remaining cards on the bottom of your deck in any order.";
      case "Elf Girl Liza":
        return "While this card is on your field, your followers take 1 less damage from enemy abilities.";
      case "Elf Knight Cynthia":
        return "Rush. \n Strike, banish a card in your EX area: Select an enemy leader or enemy follower on the field. Deal it 2 damage and summon 2 Fairy tokens.";
      case "Grand Archer Seiwyn":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Combo (4): Select an enemy follower on the field and deal it 5 damage.";
      case "Crystalia Lily":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Look at the top 2 cards of your deck. You may reveal a Crystalian or Pixie follower from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Baalt King of the Elves":
        return "[fanfare] Choose one of the following. (1) Select a Pixie follower on your field and give it [attack]+2 / [defense]+2. (2) Search your deck for a Pixie follower, reveal it, and add it to your hand.";
      case "Elven Archery":
        return "Select up to 2 enemy followers on the field and deal them 1 damage. Combo (3): Deal 2 damage instead.";
      case "Dwarf Perfumer":
        return "Whenever one of your followers evolves, select an enemy follower on the field and deal it 2 damage.";
      case "Elf Healer":
        return "[fanfare] Give your leader [defense]+3.";
      case "Forest Gigas":
        return "[evolve][cost01]: Evolve this follower. \n Ward. \n [fanfare] Give this follower [attack]+X. X equals the number of cards in your EX area.";
      case "Elf Bard":
        return "Whenever one of your followers evolves, put a Fairy Wisp token into your EX area.";
      case "Rose Deer":
        return "Rush. \n [fanfare] Put a Thorn Burst token into your EX area.";
      case "Albert Levin Saber":
        return "[evolve][cost03]: Evolve this follower. \n Storm.";
      case "Alexander":
        return "Rush. Assail. \n During your turn, whenever this follower deals combat damage, refresh it.";
      case "Amelia, Silver Paladin":
        return "[fanfare] Choose one of the following. (1) Select a follower that costs 3 play points or less in your hand and put it onto your field. (2) Select an enemy follower on the field and deal it 4 damage.";
      case "Leonidas":
        return "[evolve][cost01]: Evolve this follower.";
      case "White Paladin":
        return "Ward. \n [act][cost02], [engage]: Summon 2 Shield Guardian tokens.";
      case "Jeno, Levin Vanguard":
        return "[evolve][cost01]: Evolve this follower.";
      case "Yurius, Levin Duke":
        return "[q][act][engage]: Select an enemy follower on the field and deal it 1 damage.";
      case "Whole-Souled Swing":
        return "[quick] \n Select an enemy follower on the field. Deal it 3 damage and put a Knight token into your EX area.";
      case "Swift Infiltrator":
        return "Whenever one of your followers evolves, give this follower [attack]+1 / [defense]+1.";
      case "Samurai":
        return "[act][cost03]: Give this follower Storm and Bane.";
      case "Avant Blader":
        return "[evolve][cost01]: Evolve this follower.";
      case "Flame Soldier":
        return "[fanfare] Select an enemy follower on the field and deal it 1 damage. If any of your followers have been destroyed this turn, deal 4 damage instead.";
      case "Gunner Maid Seria":
        return "[fanfare] Search your deck for a Princess follower, reveal it, and add it to your hand.";
      case "Daria Dimensional Witch":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Discard your hand. Put the top card of your deck into your EX area. Repeat this until your EX area is full. \n While this card is on your field, include both spells and [runecraft] followers in your cemetery when counting your Spellchain.";
      case "Sun Oracle Pascale":
        return "[fanfare] Summon a Magic Sediment token. \n [q][act][engage], Earth Rite: Select an enemy follower on the field and give it [attack]-2 / [defense]-2. \n [q][act][engage], Earth Rite: Select another follower on your field and give it [attack]+2 / [defense]+2.";
      case "Anne, Belle oF Mysteria":
        return "If there is a Grea the Dragonborn on your field, this card costs 2 less to play. \n [evolve][cost01]: Evolve this follower.";
      case "Grea the Dragonborn":
        return "If there is an Anne, Belle of Mysteria on your field, this card costs 2 less to play. \n [act][engage]: Select an enemy follower on the field and deal it 3 damage. If there is an Anne, Belle of Mysteria on your field, deal 6 damage instead.";
      case "Rimewind":
        return "[quick] \n Select an unevolved enemy follower on the field and return it to its owner's hand. Spellchain (10): Put it on top of its owner's deck instead.";
      case "Remi & Rami, Witchy Duo":
        return "[evolve][cost01]: Evolve this follower.";
      case "Shadow Witch":
        return "[fanfare] Earth Rite: Select an enemy follower on the field and banish it.";
      case "Multipart Expirement":
        return "Choose up to 2 of the following. Spellchain (10): Choose up to 3 instead. (1) Select an enemy follower on the field and deal it 3 damage. (2) Summon a Guardform Golem token. (3) Draw a card.";
      case "Craig, Wizard of Mysteria":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Draw a card, then discard a card.";
      case "Grand Gargoyle":
        return "Ward. \n [lastwords] Add 2 to a Stack on your field.";
      case "Witchbolt":
        return "Select an enemy follower on the field. Deal it 5 damage and, if there is an evolved follower on your field, draw a card.";
      case "Magical Strategy":
        return "Summon a Magical Pawn token.";
      case "Red-Hot Ritual":
        return "Stack. \n [fanfare] Select an enemy follower on the field and deal it 3 damage.";
      case "Imperial Dragoon":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Deal X damage to each enemy leader and enemy follower on the field. X equals the number of cards in your hand. Discard your hand.";
      case "Dragonsong Flute":
        return "When this card is discarded, put a Hellflame Dragon token into your EX area. \n ---------- \n [fanfare][cost03]: Summon a Hellflame Dragon token. Draw a card. \n [act][engage], discard a card: Put a Hellflame Dragon token into your EX area. This ability can be activated if Overflow is active for you.";
      case "Neptune":
        return "[evolve][cost02]: Evolve this follower. \n Ward. \n [fanfare] Summon a Megalorca token. \n While this card is on your field, your Megalorca tokens have Rush.";
      case "Draconic Fervor":
        return "Increase your maximum play points by 1. Give your leader [defense]+3. Draw a card.";
      case "Polyphonic Roar":
        return "Once on each of your turns, when a Dragon token is put onto your field, select an enemy leader or enemy follower on the field and deal it 5 damage.";
      case "Siegfried":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and deal it 2 damage.";
      case "Transmogrified Wyrm":
        return "[fanfare] Select a card in an EX area and transform it into a Dragon token.";
      case "Dracomancer's Rites":
        return "[fanfare] Discard a card: Give your leader [defense]+1. \n At the start of your end phase, if you discarded a card this turn, select an enemy leader or enemy follower on the field and deal it 2 damage.";
      case "Wildfang Dragonewt":
        return "If you've discarded a card this turn, this card costs 2 less to play.";
      case "Mushussu":
        return "Whenever one of your followers evolves, give this follower [attack]+2.";
      case "Dragontamer":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Draw a card, then discard a card.";
      case "Twin-Headed Dragon":
        return "[fanfare][cost03]: Summon a Dragon token. \n This follower deals double attack damage to leaders and double combat damage to followers.";
      case "Draconic Armor":
        return "Summon a Draconic Weapon token. If Overflow is active for you, summon 2 instead.";
      case "Vania, Vampire Princess":
        return "[fanfare] Give this follower [attack]+X / [defense]+X. X equals the number of Forest Bat tokens on your field. \n [act][cost01], put a Forest Bat token from your field into its owner's cemetery: Select an enemy follower on the field. Deal 3 damage to it and 1 damage to its leader.";
      case "Soul Dealer":
        return "[evolve][cost02]: Evolve this follower. \n Ward. \n [fanfare] Deal 3 damage to your leader.";
      case "Underworld Watchman Khawy":
        return "Ward. \n [lastwords] Select an enemy follower on the field. Destroy it and give your leader [defense]+X. X equals the selected follower's attack.";
      case "Azazel":
        return "Necrocharge (10): This card costs 3 less to play. \n [evolve][cost01]: Evolve this follower. \n Bane. \n [fanfare] Each opponent discards a random card.";
      case "Vampiric Fortress":
        return "[fanfare] Look at the top 3 cards of your deck. You may reveal a Vampire card from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order. \n [act][cost01], [engage], put this card into its owner's cemetery: Summon a Forest Bat token.";
      case "Veight, Vampire Noble":
        return "[evolve][cost01]: Evolve this follower. \n Strike: Summon a Forest Bat token.";
      case "Trick Dullahan":
        return "[fanfare] Put a Ghost token into your EX area. Necrocharge (10): Put 3 instead.";
      case "Precious Bloodfangs":
        return "Choose one of the following. (1) Summon X Forest Bat tokens. X equals the number of enemy cards on the field. (2) Give each Forest Bat token on your field [attack]+1 / [defense]+1.";
  
      case "Mini Soul Devil":
        return "Whenever one of your followers evolves, deal 2 damage to each enemy leader.";
      case "Moriana the Bejeweled":
        return "[fanfare] If Sanguine is active for you, give your leader [defense]+3 and draw a card.";
      case "Demonic Hedonist":
        return "[evolve][cost01]: Evolve this follower. \n At the start of your end phase, if Sanguine is active for you, draw a card, then discard a card.";
      case "Bone Chimera":
        return "Necrocharge (7): This follower has Rush and Bane. \n [fanfare] Put the top 3 cards of your deck into your cemetery.";
      case "Necrocarnival":
        return "Choose one of the following. Necrocharge (10): Choose up to 2 instead. (1) Select a follower that costs 2 play points or less in your cemetery and put it onto your field. (2) Summon 2 Ghost tokens.";
      case "Heavenly Aegis":
        return "[evolve][cost02]: Evolve this follower. \n [evolve] Discard 3 cards: Evolve this follower. \n Aura. \n This card can't be destroyed by abilities. (It can still be destroyed by ability damage.)";
      case "Enstatued Seraph":
        return "This card can't be destroyed by abilities. \n At the start of your end phase, put a prayer counter on this card. Then, if this card has at least 4 prayer counters, put it into its owner's cemetery, give your leader [defense]+10, and search your deck for up to 2 cards and put them into your EX area. Those cards cost 0 play points to play.";
      case "Kaguya":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Select an amulet that costs 3 play points or less in your hand and put it onto your field. \n Whenever an amulet is put onto your field, select an enemy follower on the field and deal it X damage. X equals the amulet's cost.";
      case "Tribunal of Good and Evil":
        return "[fanfare] Select an enemy follower on the field and destroy it. \n [act][engage], put this card into its owner's cemetery: Draw a card.";
      case "Elana's Prayer":
        return "Once per turn, when your leader gains [defense], give each follower on your field [attack]+1 / [defense]+1.";
  
      case "Radiance Angel":
        return "[evolve][cost01]: Evolve this follower. \n Ward. \n [fanfare] Draw a card.";
      case "Saphire Priestess":
        return "t the start of your end phase, if your followers attacked at least 3 times this turn, draw 3 cards.";
      case "Beastcall Aria":
        return "[fanfare] Summon a Holy Falcon token. \n [act][cost02], [engage], put this card into its owner's cemetery: Summon a Holy Tiger token.";
      case "Frog Cleric":
        return "[fanfare] Give your leader [defense]+2. \n [act][cost02]: Give your leader [defense]+1.";
      case "Sky Sprite":
        return "[fanfare] Select another follower on your field that was put onto the field this turn and give it [attack]+2 / [defense]+2.";
      case "Soul Collector":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Select an enemy follower that costs 4 play points or less on the field and banish it.";
      case "Sledgehammer Exorcist":
        return "[fanfare][cost02]: Select an enemy follower on the field and deal it 4 damage.";
      case "Emerald Maiden":
        return "Ward. \n [fanfare] Give this follower [defense]+X. X equals the number of other followers with Ward on your field.";
      case "Dark Angel Olivia":
        return "[fanfare] Choose up to 2 of the following. (1) Gain 1 Evolution Point. (2) Give your leader [defense]+3. (3) Draw a card. (4) Each opponent discards a card.";
      case "Bahamut":
        return "[evolve][cost00]: Evolve this follower. \n [fanfare] Destroy each other follower on the field. \n If there are at least 2 enemy followers on the field, this follower can't attack enemy leaders.";
      case "Demonic Simulacrum":
        return "[fanfare] Deal 3 damage to your leader. Discard a random card.";
      case "Archangel Reina":
        return "[evolve][cost01]: Evolve this follower. \n Ward.";
      case "Surefire Bullet":
        return "[quick] \n Select an enemy follower on the field and deal it 3 damage. If it's an evolved follower, deal 4 damage instead.";
      case "Unicorn Dancer Unicorn":
        return "[evolve][cost01]: Evolve this follower. \n Strike: Give your leader [defense]+2.";
      case "Gourmet Emperor Khaiza":
        return "[fanfare] Select an enemy follower that costs 2 play points or less on the field. Destroy it and give its leader [defense]+3.";
      case "Call of Cocytus":
        return "[quick] \n Select an enemy follower on the field. Destroy it, then search your deck for a [neutral] follower, reveal it, and add it to your hand.";
      case "Hamsa":
        return "[fanfare] Reveal the top card of your deck. Give this follower [attack]+X. X equals the revealed card's cost.";
      case "Sektor":
        return "[evolve][cost03]: Evolve this follower.";
      case "Dance of Death":
        return "Select an enemy follower on the field. Deal 5 damage to it and 2 damage to its leader.";
      
      case "Skullfane":
        return "[fanfare] Look at the top 4 cards of your deck. You may reveal an amulet from among them and put it onto your field. Put the remaining cards into your cemetery. \n Whenever an amulet you control leaves the field, deal 2 damage to each enemy leader and enemy follower on the field.";
      case "Hare of Illusions":
        return "[act][engage], put this card into its owner's cemetery: Select an enemy follower on the field and engage it. \n [act][cost10], [engage], put this card into its owner's cemetery: Banish each follower on the field.";
      case "Priest of the Cudgel":
        return "[evolve][cost01]: Evolve this follower.";
      case "Acolyte's Light":
        return "[quick] \n Select an enemy follower on the field. Banish it and give your leader [defense]+2.";
      case "Dual Flames":
        return "[fanfare] Summon a Holy Tiger token. \n [act][cost02], [engage], put this card into its owner's cemetery: Summon a Holy Tiger token.";
      case "Ardent Nun":
        return "[evolve][cost01]: Evolve this follower. \n Ward. \n During each opponent's turn, this follower deals 1 more damage.";
      case "Guardian Nun":
        return "[evolve][cost01]: Evolve this follower. \n Ward. \n [fanfare] If there is an amulet on your field, give this follower [defense]+1.";
      case "Pinion Prayer":
        return "[act][cost01], [engage], put this card into its owner's cemetery: Summon a Holy Falcon token.";
      case "Beastly Vow":
        return "This card is put onto the field engaged. \n [act][cost01], [engage], put this card into its owner's cemetery: Summon a Holy Tiger token.";
      case "Queen Vampire":
        return "[fanfare] Summon 2 Forest Bat tokens. \n [act][engage], give your leader [defense]-1: Summon 2 Forest Bat tokens. \n Whenever a Forest Bat token is put onto your field, give it [attack]+1 and Ward.";
      case "Alucard":
        return "Storm. \n [fanfare] Necrocharge (10): Give this follower [attack]+2. \n Strike: Select an enemy follower on the field. Deal it 4 damage and give your leader [defense]+4.";
      case "Playful Necomancer":
        return "[evolve][cost01]: Evolve this follower.";
      case "Midnight Vampire":
        return "[fanfare] Summon a Forest Bat token. \n While this card is on your field, your Forest Bat tokens have Drain. ";
      case "Night Horde":
        return "Summon 2 Forest Bat tokens. \n Select an enemy follower on the field and deal it X damage. X equals the number of Forest Bat tokens on your field.";
      case "Lesser Mummy":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Necrocharge (10): Give this follower Storm.";
      case "Lilith":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Put a Forest Bat token into your EX area.";
      case "Undying Resentment":
        return "[quick] \n Select an enemy follower on the field. Deal it 3 damage and put the top card of your deck into your cemetery.";
      case "Summon Bloodkin":
        return "Summon a Forest Bat token. \n Put a Forest Bat token into your EX area.";
      case "Fafnir":
        return "[fanfare] Deal 5 damage to each enemy follower on the field.";
      case "Dragon Oracle":
        return "Choose one of the following effects. (1) Increase your maximum play points by 1. (2) Draw a card.";
      case "Dragon Warrior":
        return "[evolve][cost01]: Evolve this follower.";
      case "Dragonewt Princess":
        return "[fanfare] If Overflow is active for you, select an enemy follower on the field and deal it 4 damage.";
      case "Dragonguard":
        return "Ward. \n [fanfare] If Overflow is active for you, give this follower [attack]+2 / [defense]+2.";
      case "Roc":
        return "[evolve][cost00]: Evolve this follower. \n Strike: Give this follower [attack]+1.";
      case "Glint Dragon":
        return "[fanfare] Select an enemy follower on the field and deal it 3 damage.";
      case "Dragonrider":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] If Overflow is active for you, put a Dragon token into your EX area.";
      case "Seabrand Dragon":
        return "[fanfare] If Overflow is active for you, give this follower Storm.";
      case "Mythril Golem":
        return "[fanfare] Deal 3 damage to each enemy follower on the field. Spellchain (7): Deal 5 damage instead. SC (15): Deal 5 damage to each enemy leader.";
      case "Rune Blade Summoner":
        return "[fanfare] Spellchain (5): Give this follower [attack]+4/[defense]+4. SC (10): Give this follower Storm.";
      case "Demonflame Mage":
        return "[evolve][cost01]: Evolve this follower.";
      case "Insight":
        return "[quick] \n Draw a card.";
      case "Fire Chain":
        return "[quick] \n Select up to 2 enemy followers on the field and deal 3 damage divided between them.";
      case "Penguin Wizard":
        return "[evolve][cost01]: Evolve this follower. \n [act][engage], discard a spell: Draw a card.";
      case "Sammy Wizard's Apprentice":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Look at the top card of your deck. You may put it into your cemetery.";
      case "Magic Missle":
        return "[quick] \n Select an enemy follower on the field. Deal it 2 damage and draw a card.";
      case "Conjure Golem":
        return "[quick] \n Put a Guardform Golem or Strikeform Golem token into your EX area.";
      case "Tsubasa":
        return "[fanfare] Choose one of the following effects. (1) Select an enemy follower on the field and destroy it. (2) Give this follower Storm.";
      case "Latham, Vanguard Captain":
        return "";
      case "Floral Fencer":
        return "[evolve][cost01]: Evolve this follower.";
      case "Moonlight Assassin":
        return "[act][cost01]: Give this follower Bane.";
      case "White General":
        return "Rush.";
      case "Fencer":
        return "[fanfare] Select another follower on your field and give it [attack]+1 / [defense]+1.";
      case "Oathless Knight":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Summon a Knight token.";
      case "Quickblader":
        return "[evolve][cost03]: Evolve this follower. \n Storm.";
      case "Unbridled Fury":
        return "[quick] \n Select an enemy follower on the field and deal it X damage. X equals the number of followers on your field.";
      case "Aria, Fairy Princess":
        return "Ward. \n [fanfare] Put up to 9 Fairy tokens onto your field or into your EX area. \n While this card is on your field, your other Pixie followers have Rush.";
      case "Titania's Sanctuary":
        return "[fanfare] Give each Pixie token on your field [attack]+1 / [defense]+1.\n While this card is on your field, your Pixie tokens have Assail. Whenever a Pixie token is put onto your field, give it [attack]+1 / [defense]+1.";
      case "Rose Gardener":
        return "[evolve][cost01]: Evolve this follower.";
      case "Waltzing Fairy":
        return "[fanfare][lastwords] Put a Fairy token into your EX area.";
      case "Fairy Caster":
        return "[fanfare] Summon 3 Fairy tokens. If your field becomes full from this effect, put any remaining tokens into your EX area.";
      case "Treant":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Combo (3): Change this card's [evolve] cost to 0.";
      case "Water Fairy":
        return "[evolve][cost02]: Evolve this follower. \n [lastwords] Put a Fairy token into your EX area.";
      case "Elf Wanderer":
        return "Assail.";
      case "Sylvan Justice":
        return "[quick] \n Select an enemy follower on the field. Deal it 3 damage and put a Fairy token into your EX area.";
      case "Rose Queen":
        return "[fanfare] Select any number of Pixie followers in your EX area and transform them into Thorn Burst tokens. \n [act][engage]: Recover X play points. X equals the number of Thorn Burst tokens in your EX area.";
      case "Ancient Elf":
        return "[evolve][cost01]: Evolve this follower. \n Ward. \n [fanfare] Return another card on your field to its owner's hand: Give this follower [attack]+1 / [defense]+1.";
      case "Rhinoceroach":
        return "[evolve][cost00]: Evolve this follower. \n Rush. \n [fanfare] Give this follower [attack]+X. X equals the number of cards you've played this turn, excluding this card.";
      case "Robin Hood":
        return "[fanfare] Select an enemy follower on the field and deal it 4 damage. \n [act][cost01], [engage]: Select an enemy follower on the field and deal it 4 damage.";
      case "Silver Bolt":
        return "[quick] \n Select an enemy leader or enemy follower on the field. Draw a card and then deal X damage to the selected enemy. X equals the number of cards in your hand.";
      case "Homecoming":
        return "Select an enemy follower on the field. Its controller puts it on the top or bottom of its owner's deck. Combo (5): Each opponent puts each follower from their field on the top or bottom of its owner's deck instead. (The controllers determine the placement. Tokens put into a player's deck are removed from the game.)";
      case "Elven Princess Mage":
        return "[evolve][cost01]: Evolve this follower.";
      case "Blessed Fairy Dancer":
        return "[fanfare] Give [attack]+1 / [defense]+1 to each other Pixie follower on your field and in your EX area.";
      case "Elf Child May":
        return "[fanfare] Select an enemy follower on the field and deal it 1 damage. \n When this card is returned to hand from your field, select an enemy follower on the field and deal it 1 damage.";
      case "Fairy Beast":
        return "[act] Banish a Pixie follower in your EX area: Give your leader [defense]+3 and draw a card. This ability can be activated once per turn.";
      case "Noble Fairy":
        return "Ward. \n [fanfare] Combo (3): Select an enemy follower on the field. Destroy it and summon a Fairy token on that follower's field.";
      case "Nature's Guidance":
        return "Select a card on your field. Return it to its owner's hand and draw a card";
      case "Harvest Festival":
        return "[act][cost01], [engage], put this card into its owner's cemetery: Give your leader [defense]+1. \n When this card leaves the field, draw a card.";
      case "Elf Metallurgist":
        return "[fanfare] Select an enemy follower on the field and deal it 1 damage. Combo (3): Deal 3 damage instead.";
      case "Archer":
        return "[evolve][cost01]: Evolve this follower. \n Whenever another follower is put onto your field, select an enemy follower on the field and deal it 1 damage.";
      case "Fairy Whisperer":
        return "[fanfare] Summon a Fairy token. Put a Fairy token into your EX area.";
      case "Okami":
        return "Whenever another follower is put onto your field, give this follower [attack]+1 / [defense]+1.";
      case "Mana Elk":
        return "Whenever one of your Pixie followers attacks, select an enemy leader or enemy follower on the field and deal it 1 damage.";
      case "Fairy Circle":
        return "Put 3 Fairy tokens into your EX area.";
      case "Woodkin Curse":
        return "[quick] \n Select an enemy follower on the field. It cannot deal damage this turn.";
      case "Woodland Refuge":
        return "[fanfare] Select a Pixie follower on your field and give it [attack]+1. \n [act][cost01], [engage]: Return this card to its owner's hand.";
      case "Sea Queen Otohime":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Summon an Otohime's Bodyguard token.";
      case "Aurelia, Regal Saber":
        return "Rush. Assail. Ward. \n [fanfare] Select an enemy leader. If there are at least 3 cards on their field, give this follower [attack]+2 / [defense]+2 and Aura.";
      case "Shadowed Assassin":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and engage it.";
      case "Frontguard General":
        return "Ward. \n [lastwords] Summon 2 Steelclad Knight tokens and give them Ward. You may engage any number of them.";
      case "Alwida's Command":
        return "Summon a Viking, Steelclad Knight, and Knight token.";
      case "Royal Banner":
        return "[fanfare] Give each [swordcraft] follower on your field [attack]+1 / [defense]+1. \n Whenever a [swordcraft] follower is put onto your field, give it [attack]+1 / [defense]+1.";
      case "Maid Leader":
        return "[evolve][cost02]: Evolve this follower.";
      case "Gemstaff Commander":
        return "[fanfare] Search your deck for a [swordcraft] follower, reveal it, and add it to your hand.";
      case "Sage Commander":
        return "[fanfare] Give each other follower on your field [attack]+1 / [defense]+1.";
      case "Swordsman":
        return "[fanfare] Select an enemy follower on the field and engage it. \n [act][engage]: Select an enemy follower on the field and engage it.";
      case "Pompous Princess":
        return "[fanfare] Look at the top 5 cards of your deck. You may put a follower that costs 1 play point from among them onto your field. Put the remaining cards on the bottom of your deck in any order.";
      case "Ninja Master":
        return "[fanfare] Search your deck for a Ninja card, reveal it, and add it to your hand.";
      case "Arthurian Light":
        return "[act][cost01], [engage]: Summon a Knight token and give it Storm. \n [act][cost02], [engage]: Select an enemy follower on the field and engage it. \n [act][cost03], [engage]: Draw a card.";
      case "Ninja Trainee":
        return "";
      case "Fervid Soldier":
        return "[evolve][cost02]: Evolve this follower. \n Whenever another follower is put onto your field, give this follower [attack]+1.";
      case "Luminous Knight":
        return "[fanfare] Select another follower on your field and give it [attack]+1. \n [lastwords] Select a follower on your field and give it [attack]+1.";
      case "Veteran Lancer":
        return "Ward.";
      case "Navy Lieutenant":
        return "[fanfare] Select another follower on your field and give it Assail.";
      case "Novice Trooper":
        return "Storm.";
      case "Forge Weaponry":
        return "[quick] \n Select a follower on your field. Give it [attack]+1 / [defense]+1 and draw a card.";
      case "Onslaught":
        return "Select an enemy follower on the field. Deal it 5 damage and put a Knight token into your EX area.";
      case "Arch Summoner Erasmus":
        return "[fanfare] Earth Rite: Select an enemy follower on the field. Deal 6 damage to it and 2 damage to its leader. \n [act][engage], Earth Rite: Select an enemy follower on the field. Deal 6 damage to it and 2 damage to its leader.";
      case "Merlin":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Search your deck for a spell, reveal it, and add it to your hand.";
      case "Ancient Alchemist":
        return "[evolve][cost03]: Evolve this follower. \n [fanfare] Earth Rite: Put 2 Guardform Golem tokens into your EX area.";
      case "Arcane Enlightenment":
        return "[quick] \n Put the top card of your deck into your EX area. Repeat until your EX area is full. \n At the start of your next end phase, banish each card in your EX area.";
      case "Dimension Shift":
        return "When playing this card, banish 10 spells in your cemetery: This card costs 7 play points to play. \n Take another turn after this one.";
      case "Juno's Secret Laboratory":
        return "[fanfare] Summon a Guardform Golem or Strikeform Golem token. \n [act][engage]: Summon a Magic Sediment token. \n [act][engage], Earth Rite: Summon a Guardform Golem or Strikeform Golem token.";
      case "Spectral Wizard":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Look at the top card of your deck. If it's a spell, you may reveal it and add it to your hand.";
      case "Flame Destroyer":
        return "Spellchain (5): This card costs 3 less to play. SC (10): It costs 6 less instead. SC (15): It costs 9 less instead. \n Rush.";
      case "Dragonbond Mage":
        return "Whenever you play a spell, place 1 spell counter on this card. \n [act] Remove 3 spell counters from this card: Select an enemy follower on the field and deal it 5 damage.";
      case "Golem Protection":
        return "Summon 2 Guardform Golem tokens. \n Earth Rite: Give each Golem follower on your field [attack]+1 / [defense]+1.";
      case "Alchemical Lore":
        return "Deal 4 damage to each enemy follower on the field.";
      case "Fate's Hand":
        return "[quick] \n Draw 2 cards. Spellchain (10): Recover 1 play point.";
      case "Price of Magic":
        return "Stack. \n [fanfare] Select an enemy follower with 4 defense or less on the field and banish it.";
      case "Runic Guardian":
        return "Ward. \n [fanfare] Choose one of the following effects. (1) Earth Rite: Give this follower [attack]+1/[defense]+2. (2) Summon a Magic Sediment token.";
      case "Crafty Warlock":
        return "[evolve][cost01]: Evolve this follower. \n [lastwords] Summon a Magic Sediment token.";
      case "Lightning Shooter":
        return "[fanfare] Select an enemy follower on the field and deal it 2 damage. Spellchain (5): Deal 4 damage instead. SC (10): Deal 2 damage to that follower's leader.";
      case "Wind Blast":
        return "Select an enemy follower on the field and deal it 2 damage. Spellchain (10): Deal 4 damage instead.";
      case "Sorcery Cache":
        return "[quick] \n Look at the top 4 cards of your deck. You may reveal a spell from among them and add it to your hand. You may also put a spell into your cemetery. Put the remaining cards on the bottom of your deck in any order.";
      case "Fiery Embrace":
        return "[quick] \n Select an enemy follower on the field and destroy it. Spellchain (10): Deal 3 damage to that follower's leader.";
      case "Alchemist's Workshop":
        return "Stack. \n [fanfare] Summon a Strikeform Golem token.";
  
      case "Teachings of Creation":
        return "Stack. \n [fanfare] Draw a card.";
      case "Dark Dragoon Forte":
        return "[evolve][cost02]: Evolve this follower. \n Storm.";
      case "Aiela, Dragon Knight":
        return "Assail. \n [lastwords] Increase your maximum play points by 1.";
      case "Zirnitra":
        return "[fanfare] Put a Dragon token into your EX area. \n [act][cost02], [engage]: Select a Dragon token in your EX area. Put it onto your field and give it Rush. If Overflow is active for you, recover 2 play points.";
      case "Genesis Dragon":
        return "Storm.";
      case "Shapeshifting Mage":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] If Overflow is active for you, give this follower [attack]+3 / [defense]+3.";
      case "Phoenix Roost":
        return "At the start of each player's main phase, that player looks at the top card of their deck. If it's a follower, they may put it onto their field.";
      case "Wyvern Cavalier":
        return "[fanfare] Put the top card of your deck into your EX area. It costs 2 less to play.";
      case "Dragonewt Scholar":
        return "Intimidate. \n Strike: Draw a card, then discard a card.";
      case "Shenlong":
        return "[evolve][cost02]: Evolve this follower. \n Ward. \n [fanfare] Draw 2 cards, then discard a card.";
      case "Imprisoned Dragon":
        return "Ward. \n This follower can't attack enemies.";
      case "Conflagration":
        return "Deal 5 damage to each follower on the field.";
      case "Serpent's Wrath":
        return "[quick] \n Select an enemy follower on the field. Deal it 5 damage and, if Overflow is active for you, draw a card.";
      case "Wyrm Spire":
        return "While this card is on your field, your Dragon tokens have Rush. \n [act][engage]: Select a follower on the field and destroy it. Its controller summons a Dragon token. ";
  
      case "Ivory Dragon":
        return "[evolve][cost00]: Evolve this follower.";
      case "Fire Lizard":
        return "[fanfare] Select an enemy leader or enemy follower on the field and deal it 1 damage.";
      case "Ace Dragoon":
        return "Rush. \n [fanfare] Select another follower on the field and give this follower [attack]+X. X equals the selected follower's attack.";
      case "Mist Dragon":
        return "Intimidate.";
      case "Dread Dragon":
        return "[fanfare] Select an enemy follower on the field and deal it 7 damage.";
      case "Blazing Breath":
        return "[quick] \n Select an enemy follower on the field and deal it 2 damage. If Overflow is active for you, deal 4 damage instead.";
      case "Dragon Wings":
        return "Deal 2 damage to each follower on the field. If Overflow is active for you, deal 3 damage instead.";
      case "Dragon Emissary":
        return "Look at the top 5 cards of your deck. You may reveal a [dragoncraft] card that costs at least 5 play points from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Cerberus":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Put a Mimi or Coco token into your EX area. Necrocharge (10): Put both into your EX area instead.";
      case "Lord Atomy":
        return "When playing this card, put 4 reserved [abysscraft] cards from your field into their owners' cemeteries, or banish 4 [abysscraft] cards in your EX area: This card costs 9 less to play.";
      case "Medusa":
        return "If Sanguine is active for you, this card costs 1 less to play. \n Necrocharge (10): This card costs 1 less to play. \n Bane. \n [act][engage]: Select an enemy follower on the field and destroy it.";
  
      case "Righteous Devil":
        return "[evolve] Give your leader [defense]-3: Evolve this follower. \n Bane.";
      case "Mordecai the Duelist":
        return "[lastwords] Give your leader [defense]-3: Put this follower onto its owner's field.";
      case "Dire Bond":
        return "[fanfare] Deal 1 damage to your leader. Draw a card. \n [act][cost02], [engage], put this card into its owner's cemetery: Deal 1 damage to your leader. Draw a card.";
      case "Hell's Unleasher":
        return "[act][engage], put this card into its owner's cemetery: Select a follower that costs at least 3 play points in your cemetery and add it to your hand.";
      case "Crazed Executioner":
        return "[evolve][cost01]: Evolve this follower.";
      case "Dark Summoner":
        return "[fanfare] If Sanguine is active for you, give this follower [attack]+1 / [defense]+1 and Rush.";
      case "Dark General":
        return "[fanfare] If Sanguine is active for you, give this follower Storm.";
      case "Phantom Howl":
        return "Summon 4 Ghost tokens.";
      case "Death's Breath":
        return "Select a follower that costs 8 play points or less in your cemetery. Put it onto your field and give it Ward.";
      case "Soul Conversion":
        return "[quick] \n Select a follower on your field. Destroy it and draw 2 cards.";
      case "Skeleton Fighter":
        return "[fanfare] If Sanguine is active for you, give this follower [attack]+1 / [defense]+1.";
      case "Ambling Wraith":
        return "[fanfare] Deal 1 damage to each leader.";
      case "Spectre":
        return "Bane. \n [fanfare] Give your leader [defense]-2: Give this follower Rush. Put the top card of your deck into your cemetery.";
      case "Spartoi Sergeant":
        return "[fanfare] Put the top 2 cards of your deck into your cemetery.";
      case "Rabbit Necromancer":
        return "[lastwords] Deal 2 damage to each leader.";
      case "Wardrobe Raider":
        return "[evolve][cost00]: Evolve this follower.";
      case "Undead King":
        return "[fanfare] Select up to 2 followers in your cemetery and add them to your hand.";
      case "Razory Claw":
        return "[quick] \n Deal 2 damage to your leader. \n Select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Moon Al-mi'raj":
        return "Storm. \n Follower Strike: Give this follower [attack]+2. \n At the start of your end phase, give this follower [defense]+2.";
      case "Jeanne d'Arc":
        return "[evolve][cost02]: Evolve this follower. \n [fanfare] Deal 2 damage to each enemy follower on the field.";
      case "Arch Priestess Laelia":
        return "[evolve][cost01]: Evolve this follower. \n While this card is on your field, your followers deal damage equal to their defense.";
      case "Themis's Decree":
        return "Destroy each follower on the field.";
      case "Chorus of Prayer":
        return "Select up to 3 amulets that cost 5 play points or less in your cemetery and put them onto your field.";
      case "Sacred Plea":
        return "[act][engage], put this card into its owner's cemetery: Draw a card. \n [act][cost02], [engage], put this card into its owner's cemetery: Draw 2 cards.";
      case "Temple Defender":
        return "Ward. \n Reduce damage dealt to this follower by 1.";
      case "Prism Priestess":
        return "[evolve][cost02]: Evolve this follower.";
      case "Cleric Lancer":
        return "Ward. \n During each opponent's turn, this follower deals 4 more damage.";
      case "Shrine Knight Maiden":
        return "Ward. Aura.";
      case "Blackened Scripture":
        return "[quick] \n Select an enemy follower with 3 defense or less on the field and banish it.";
      case "Dark Offering":
        return "[quick] \n Select a card on your field. Destroy it, give your leader [defense]+3, and draw a card. ";
      case "Holy Sentinel":
        return "Once on each of your turns, when another amulet you control leaves the field, summon a Holy Tiger token and give it Ward.";
      case "Cruel Priestess":
        return "[fanfare] Select an amulet that costs 5 play points or less in your cemetery and put it onto your field.";
      case "Sister Initiate":
        return "[fanfare] If there is an amulet on your field, give your leader [defense]+2.";
      case "Mainyu":
        return "[evolve][cost01]: Evolve this follower. \n Aura.";
      case "Snake Priestess":
        return "Ward.";
      case "Curate":
        return "[fanfare] Give your leader [defense]+5. Draw a card.";
      case "Hallowed Dogma":
        return "[quick] \n Look at the top 5 cards of your deck. You may reveal an amulet from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Guardian Sun":
        return "[fanfare] Select a follower on your field and give it Ward. \n [act][cost02], [engage], put this card into its owner's cemetery: Select a follower with Ward on your field and give it [attack]+2 / [defense]+2.";
      case "Death Sentence":
        return "This card is put onto the field engaged. \n [act][engage], put this card into its owner's cemetery: Select an enemy follower on the field and destroy it.";
      case "Gabriel":
        return "Ward. \n [fanfare] Select another follower on your field. Give it [attack]+4 / [defense]+3 and Assail.";
      case "Lucifer":
        return "[evolve][cost00]: Evolve this follower. \n Ward. \n At the start of your end phase, give your leader [defense]+4.";
      case "Flame and Glass":
        return "Storm. \n Strike: Deal 3 damage to each enemy follower on the field. If there is a Harnessed Flame and Harnessed Glass in your cemetery, deal 7 damage instead.";
  
      case "Urd":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Select an enemy follower on the field and put it into its owner's EX area. (Evolved followers put into the EX area are removed from the game.)";
      case "Wind God":
        return "[fanfare] Select a follower on your field and give it [attack]+1. \n At the start of your end phase, give each follower on your field [attack]+1.";
      case "Gilgamesh":
        return "Storm.";
      case "Bellringer Angel":
        return "[evolve][cost02]: Evolve this follower. \n Ward. \n [lastwords] Draw a card.";
      case "Altered Fate":
        return "Each player returns their hand to their deck, shuffles it, and draws X cards. X equals the number of cards they returned to their deck. You draw 1 more card.";
      case "Path to Purgatory":
        return "[fanfare] Draw 3 cards. Deal 3 damage to your leader. \n At the start of your end phase, if your leader's [defense] is 6 or less, [engage], put this card into its owner's cemetery: Deal 6 damage to each enemy follower on the field.";
      case "Lizardman":
        return "Assail.";
      case "Goblinmount Demon":
        return "[evolve][cost00]: Evolve this follower. \n Ward. \n [fanfare] Deal 2 damage to each other follower on your field.";
      case "Harnessed Flame":
        return "[act][cost01], put this card and a Harnessed Glass from your field into their owners' cemeteries: Search your deck for a Flame and Glass and put it onto your field.";
      case "Harnessed Glass":
        return "[fanfare] Draw a card. Put a card from your hand on the bottom of your deck.";
      case "Demonic Strike":
        return "Select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Execution":
        return "[quick] \n Select an enemy card on the field and destroy it.";
      case "Trail of Light":
        return "When this card is discarded, draw a card. \n ---------- \n Draw a card.";
      case "Goblin":
        return "[evolve][cost04]: Evolve this follower.";
      case "Fighter":
        return "";
      case "Goliath":
        return "[evolve][cost02]: Evolve this follower.";
      case "Angelic Sword Maiden":
        return "Ward.";
      case "Healing Angel":
        return "[evolve][cost01]: Evolve this follower. \n [fanfare] Give your leader [defense]+1.";
      case "Angelic Snipe":
        return "[quick] \n Select an enemy follower on the field and deal it 2 damage.";
      case "Angelic Barrage":
        return "[quick] \n Deal 1 damage to each enemy follower on the field.";
  
      case "Ladica, the Stoneclaw Evolved":
        return "Storm. \n Whenever a Naterran Great Tree is put onto your field, recover 1 play point.";
      case "Setus, the Beastblade Evolved":
        return "Ward. \n On Evolve - Select a follower that costs 3 or less in your cemetery and summon it. \n At the start of your end phase, give your leader [defense]+4 and, if a follower was put from your field into the cemetery this turn, give this follower [attack]+2/[defense]+2.";
      case "Blossom Spirit Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 3 cards in your EX area, deal 4 damage instead.";
      case "Forest Hermit Evolved":
        return "On Evolve - Select a Natura card in your cemetery and add it to your hand.";
  
      case "Bayleon, Sovereign Light Evolved":
        return "Ward. \n On Evolve - Look at the top 4 cards of your deck. You may put up to 2 Natura cards from among them into your EX area. Put the rest on the bottom of your deck in any order. \n [act] Banish 2 cards named Naterran Great Tree from your field: Select a Natura follower on your field and give it [attack]+2.";
      case "Leod, the Crescent Blade Evolved":
        return "On Evolve - Select an enemy leader or enemy follower on the field and deal it 2 damage. \n While this card is reserved on your field, it has Intimidate and Aura. \n At the start of your end phase, select an enemy follower on the field and deal it 1 damage.";
      case "Troya, Thunder of Hagelberg Evolved":
        return "Bane.\n On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 2 Assassin followers in your cemetery, destroy it instead.";
      case "Dauntless Commander Evolved":
        return "[lastwords] Put this card into its owner's EX area unevolved.";
  
      case "Tetra, Sapphire Rebel Evolved":
        return "While this card is on your field, any Machina card you play from the EX area costs 1 less. \n 4 times per turn, when you play a Machina card, select an enemy follower on the field and deal it 1 damage.";
      case "Eleanor, Cosmic Flower Evolved":
        return "On Evolve - Search your deck for a Splendid Conjury, put it into your EX area, then shuffle your deck. Spellchain (10) - It costs 2 less to play this turn.";
      case "Displacer Bot Evolved":
        return "Ward.\n On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of Machina cards in your EX area.";
      case "Magiblade Witch Evolved":
        return "On Evolve - Choose one of the following. (1) Summon a Magic Sediment token. (2) Earth Rite: Select up to 2 enemy followers on the field and deal 4 damage divided between them.";
  
      case "Valdain, Cursed Shadow Evolved":
        return "On Evolve - Choose one of the following. (1) Select an enemy follower on the field. Deal it 4 damage, search your deck for a Shadow's Corrosion and put it into your EX area, then shuffle your deck. (2) Select a Shadow's Corrosion in your cemetery and play it for 0 play points.";
      case "Marion, Elegant Dragonewt Evolved":
        return "On Evolve - Select another [dragoncraft] follower on your field or in your EX area and give it [attack]+1 / [defense]+1.";
      case "Hoarfrost Triceratops Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 3 damage. [lastwords] Summon a Naterran Great Tree token.";
      case "Doting Dragoneer Evolved":
        return "On Evolve - Select a [dragoncraft] follower that costs 3 or less in your cemetery and summon it.";
  
      case "Mono, Garnet Rebel Evolved":
        return "Storm. \n [act] [cost02], banish an Alpha Drive from your cemetery: Give each Machina follower on your field [attack]+2 / [defense]+2 and Rush. Activate only once per turn.";
      case "Doublame, Duke and Dame Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 2 damage. Necrocharge (10) - Deal 4 damage instead.";
      case "Nicola, Forbidden Strength Evolved":
        return "On Evolve - Select a Machina card that costs 2 or less in your cemetery and put it into your EX area. It costs 2 less to play this turn.";
      case "Berserk Demon Evolved":
        return "On Evolve - Select up to 2 enemy followers on the field and destroy them.";
  
      case "Limonia, Flawed Saint Evolved":
        return "On Evolve - Destroy each enemy follower on the field. \n [act] [cost00]: Select a Machina follower that costs 2 or less in your cemetery and summon it. Activate only once per turn.";
      case "Marione, Light of Balance Evolved":
        return "On Evolve - Select an enemy follower that costs X or less on the field and destroy it. X equals the number of cards in your EX area.";
      case "Robofalcon Evolved":
        return "Storm. \n On Evolve - Put a Repair Mode token into your EX area. \n Strike - Put a Repair Mode token into your EX area. Then, if there are at least 3 cards named Repair Mode in your EX area, give this follower [attack]+1.";
      case "Dark Bishop Evolved":
        return "On Evolve - Look at the top 5 cards of your deck. From among them, you may summon a Fable follower that costs 5 or less or Fable amulet that costs 5 or less. Put the rest on the bottom of your deck in any order.";
  
      case "Viridia Magna Evolved":
        return "Ward. \n [lastwords] Give your leader [defense]+2.";
      case "Maisha, Hero of Purgation Evolved":
        return "On Evolve - [cost05]: Bury the top 5 cards of your deck. Give this follower Storm. \n Strike - Select a [neutral] spell that costs 3 or less in your cemetery and play it for 0 play points.";
      case "Robogoblin Evolved":
        return "On Evolve - Summon an Assembly Droid token. \n [lastwords] Put a Repair Mode token into your EX area.";
      case "Aldis, Trendsetting Seraph Evolved":
        return "[lastwords] Deal 3 damage to each enemy leader.";
  
      case "Momoka Sakurai Evolved":
        return "On Evolve - Look at the top 3 cards of your deck. You may reveal a Cute card from among them and add it to your hand. Put the rest on the bottom of your deck in any order.";
      case "Akiha Ikebukuro Evolved":
        return "On Evolve - Discard a Cute card: Select an enemy follower on the field. Deal it 3 damage and draw a card.";
      case "Nene Kurihara Evolved":
        return "Ward. \n On Evolve - [cost03]: Select a Cute follower in your cemetery and summon it.";
  
      case "Yukimi Sajo Evolved":
        return "On Evolve - Select another Cool follower on your field. Give it [attack]+1, Rush, and Assail.";
      case "Kako Takafuji Evolved":
        return "On Evolve - [cost03]: Select an enemy leader and deal it 3 damage.";
      case "Seira Mizuki Evolved":
        return "Storm. \n On Evolve - Select an enemy follower on the field and deal it 5 damage.";
  
      case "Suzuho Ueda Evolved":
        return "On Evolve - Select an enemy follower on the field. Reveal the top card of your deck and deal damage equal to its cost to the selected follower.";
      case "Miria Akagi Evolved":
        return "On Evolve - Discard a Passion card: Draw 2 cards.";
      case "Kumiko Matsuyama Evolved":
        return "On Evolve - Select a Passion follower that costs 3 or less in your cemetery and summon it.";
  
      case "Aiko Takamori Evolved":
        return "On Evolve - You may summon a Passion follower that costs 3 or less from your hand.";
      case "Yuzu Kitami Evolved":
        return "Ward. \n On Evolve - Select an enemy follower that costs 2 or less on the field and return it to its owner's hand. \n [act] Lesson (1): Select another card that costs 1 or less on your field and return it to its owner's hand. For the rest of this turn, this card's [act] abilities can't be activated.";
      case "Yumi Aiba Evolved":
        return "On Evolve - Select an enemy follower with 3 defense or less on the field and put it on the bottom of its owner's deck.";
      case "Kana Imai Evolved":
        return "On Evolve - Look at the top card of your deck. You may reveal it and add it to your hand. If you revealed a Cute card, give your leader [defense]+2.";
  
      case "Kyoko Igarashi Evolved":
        return "Ward. \n On Evolve - Select up to 1 enemy follower on the field and engage or refresh it. \n During your turn, this follower doesn't take damage.";
      case "Uzuki Shimamura Evolved":
        return "On Evolve - Search your deck for a follower with \"Rin Shibuya\" or \"Mio Honda\" in its name, put it into your EX area, then shuffle your deck. It costs 2 less to play this turn.";
      case "Karen Hojo Evolved":
        return "On Evolve - Select an enemy follower on the field. Deal it and this follower 3 damage.";
      case "Miho Kohinata Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 2 damage. If there are at least 5 Cute cards in your cemetery, deal 3 damage instead.";
  
      case "Shiki Ichinose Evolved":
        return "On Evolve - Select up to 1 card in your EX area and deal damage equal to its cost to your leader. It costs 0 play points to play this turn. \n [act] [engage], discard a card: Select an enemy follower on the field and deal it 5 damage.";
      case "Kanade Hayami Evolved":
        return "On Evolve - Lesson (2): Select an enemy follower on the field and deal it 4 damage.";
      case "Hina Araki Evolved":
        return "On Evolve - Select an iM@S CG spell that costs 2 or less in your cemetery and play it for 0 play points.";
      case "Rika Jougasaki Evolved":
        return "On Evolve - Search your deck for a spell that costs 3 or less, reveal it, add it to your hand, then shuffle your deck.";
  
      case "Yui Ohtsuki Evolved":
        return "On Evolve - Search your deck for a spell that costs 3 or less or amulet that costs 3 or less, put it into your EX area, then shuffle your deck. It costs 3 less to play this turn.";
      case "Tsukasa Kiryu Evolved":
        return "On Evolve - Select an enemy follower on the field and destroy it. If you have 10 max play points, deal 3 damage to its leader.";
      case "Yuka Nakano Evolved":
        return "On Evolve - Deal 1 damage to each enemy follower on the field. If you have 10 max play points, deal 4 damage instead.";
      case "Noa Takamine Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it damage equal to your max play points.";
  
      case "Ranko Kanzaki Evolved":
        return "On Evolve - Look at the top 4 cards of your deck. You may put one of them into your EX area. Bury the rest. \n [act] [cost01], Lesson (2): Select up to 2 enemy followers on the field and deal them 2 damage.";
      case "Takumi Mukai Evolved":
        return "On Evolve - Select an enemy follower on the field. Destroy it and deal 3 damage to your leader.";
      case "Aki Yamato Evolved":
        return "On Evolve - Select up to 2 enemy followers on the field and deal them 5 damage.";
      case "Syoko Hoshi Evolved":
        return "At the start of your end phase, deal 1 damage to each enemy leader. \n [lastwords] Deal 1 damage to each enemy leader.";
  
      case "Shin Sato Evolved":
        return "On Evolve - Select a follower that costs 8 or less in your cemetery and summon it.";
      case "Nana Abe Evolved":
        return "On Evolve - You may summon an amulet that costs 3 or less from your hand.";
      case "Haru Yuuki Evolved":
        return "On Evolve - Give your leader [defense]+2.";
      case "Layla Evolved":
        return "On Evolve - Search your deck for a Cool follower and Passion follower, reveal them, add them to your hand, then shuffle your deck.";
  
      case "Lymaga, Forest Champion Evolved":
        return "Storm. Bane. \n On Evolve - Look at the top 4 cards of your deck. You may summon a Hunter follower that costs 4 or less from among them. Put the rest on the bottom of your deck in any order.";
      case "Wildwood Matriarch Evolved":
        return "On Evolve - Select up to 2 Hunter followers that cost 2 or less in your cemetery and summon them.";
      case "Woodland Cleaver Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 2 damage.";
      case "Mallet Monkey Evolved":
        return "Storm.";

      case "Ralmia, Sonic Racer Evolved":
        return "Storm. \n On Evolve - [cost03]: Give this follower [attack]+1 / [defense]+1 for every other follower on your field.";
      case "Hero of Antiquity Evolved":
        return "Aura. \n This card can't be destroyed or banished by abilities. \n On Evolve - Select an enemy follower on the field and destroy it. If it costs 6 or more, banish it instead.";
      case "Quickdraw Maven Evolved":
        return "On Evolve - Discard a card: Select an enemy follower on the field and deal it 5 damage.";
      case "Samurai Outlaw Evolved":
        return "";
      
      case "Mysteria, Magic Founder Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 3 damage. \n While this card is on your field, any Academic follower you play costs 1 less.";
      case "Curse Crafter Evolved":
        return "[evolve] [cost01]: Evolve this follower. \n [fanfare] Summon a Paper Shikigami token. \n [act] Bury a Shikigami follower: Select an enemy follower on the field and deal it 4 damage. For the rest of this turn, this card's [act] abilities except [evolve] can't be activated.";
      case "Demoncaller Evolved":
        return "On Evolve - Summon a Paper Shikigami token. \n Whenever a Shikigami follower is put onto your field, give it [attack]+1 and Rush.";
      case "Charming Gentlemouse Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it damage equal to 2 times the number of cards named Charming Gentlemouse on your field.";

      case "Garyu, Surpreme Dragonkin Evolved":
        return "On Evolve - You may summon a [dragoncraft] follower that costs 5 or less from your hand. \n While this card is on your field, each other [dragoncraft] follower on your field has Ward.";
      case "Wyrm God of the Skies Evolved":
        return "On Evolve - Give your leader [defense]+3. \n [lastwords] Put this card into its owner's EX area.";
      case "Ice Dancing Dragonewt Evolved":
        return "This follower ignores Ward.";
      case "Dragonblader Evolved":
        return "On Evolve - Select a card in an EX area and banish it.";

      case "Ginsetsu, Great Fox Evolved":
        return "While this card is on your field, any Yokai follower you play costs 2 less. Also, if a Yokai follower on your field would deal damage, it deals that much plus 1 instead. \n Whenever a Yokai follower you control leaves the field, give this follower [attack]+1.";
      case "Shuten-Doji Evolved":
        return "Storm. Bane. \n On Evolve - Select another Yokai follower on your field and give it Storm.";
      case "Cougar Pelt Warrior Evolved":
        return "On Evolve - Search your deck for a Cougar Pelt Warrior, put it onto your field engaged, then shuffle your deck.";
      case "Zashiki-Warashi Evolved":
        return "On Evolve - Discard a Yokai card: Give your leader [defense]+1. Draw 2 cards.";

      case "Karula, Arts Master Evolved":
        return "At the start of your end phase, recover 2 play points. Then, if you have at least 2 play points, deal 2 damage to each enemy leader. If you have at least 4, draw a card. If you have at least 6, select up to 1 enemy follower on the field and destroy it.";
      case "Phantom Blade Wielder Evolved":
        return "On Evolve - Select an enemy follower on the field and deal it 2 damage. \n At the start of your end phase, if you have at least 2 play points, select an enemy follower on the field and deal it 2 damage.";
      case "Holy Lancer Evolved":
        return "Ward. \n On Evolve - Select an enemy follower on the field and deal it 4 damage.";
      case "Barrage Brawler Evolved":
        return "On Evolve - Recover 2 play points. \n At the start of your end phase, if you have at least 2 play points, select an enemy leader and deal it 1 damage.";

      case "Badb Catha Evolved":
        return "On Evolve - Choose one of the following. (1) Engage each enemy follower on the field. (2) Deal 2 damage to each enemy leader. (3) Put the top card of your deck into your EX area.";
      case "Mithra, Daybreak Diety Evolved":
        return "On Evolve - Declare any number from 1 to 6, then roll a 6-sided die. If you roll the declared number, give your leader [defense]+5, search your deck for any card, put it into your EX area, shuffle your deck, then recover all your play points.";
      case "Chaht, Ringside Announcer Evolved":
        return "On Evolve - Search your deck for an Arena card, reveal it, add it to your hand, then shuffle your deck.";
      case "Bazooka Goblins Evolved":
        return "On Evolve - Select an enemy card that costs 2 or less on the field and destroy it.";
  
      case "Izudia, Omen of Unkilling Evolved":
        return "[act] [engage]: Deal 6 damage to each enemy leader with at least 10 defense.";
      case "Apostle of Unkilling Evolved":
        return "On Evolve: Search your deck for a Hunter follower that costs 2 play points or less, put it onto your field, then shuffle your deck.";
      case "Noah, Vengeful Puppeteer Evolved":
        return "While this card is on your field, any Puppet you play costs 1 less. \n Whenever a Puppet is put onto your field, give it [attack]+1 and Storm.";
      case "Flower Doll Evolved":
        return "[lastwords] Select up to 1 Puppetry follower in your cemetery (including this one) and add it to your hand.";

      case "Octrice, Omen of Usurpation Evolved":
        return "On Evolve: Select a card in an opponent's cemetery and put it into your EX area. \n [act] [cost08]: Select a card in an opponent's cemetery and play it for 0 play points. \n If there are at least 10 cards in opponents' cemeteries, any card you play from the EX area costs 2 less.";
      case "Apostle of Usurpation Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it 4 damage.";
      case "Geno, Machine Artisan Evolved":
        return "On Evolve: Search your deck for an amulet, reveal it, add it to your hand, then shuffle your deck. \n Whenever you play an amulet, select a follower on your field and give it [defense]+1.";
      case "Captain Meteo Evolved":
        return "On Evolve: Select an enemy follower on the field and destroy it.";

      case "Raio, Omen of Truth Evolved":
        return "On Evolve: Look at the top 9 cards of your deck. You may put up to 3 cards that cost 3 play points or less from among them into your EX area. They cost 3 less to play this turn. Put the remaining cards on the bottom of your deck in any order.";
      case "Apostle of Truth Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it X damage. X equals 2 times the number of Mage followers on your field.";
      case "Iron Staff Mechanic Evolved":
        return "On Evolve: Search your deck for a card that costs 1 play point, put it into your EX area, then shuffle your deck. It costs 1 less to play this turn.";
      case "Servant of Destruction Evolved":
        return "On Evolve: Select an enemy follower on the field. Deal 2 damage to it and its leader.";

      case "Galmieux, Omen of Disdain Evolved":
        return "On Evolve: Select an Omen card that costs 2 play points or less in your cemetery and play it for 0 play points. \n During your turn, whenever this follower takes ability damage, select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Apostle of Disdain Evolved":
        return "On Evolve, discard a card: Look at the top 5 cards of your deck. From among them, you may reveal up to 2 Omen cards and add them to your hand. Put the remaining cards on the bottom of your deck in any order. \n During your turn, whenever this follower takes ability damage, give it [attack]+1 and Storm.";
      case "Cursed Stone Evolved":
        return "Ward. \n On Evolve: Select an enemy follower on the field. For the rest of this turn and during each opponent's next turn, it loses all abilities and can't attack enemies.";
      case "Airship Whale Evolved":
        return "../textures/BP05-066EN.png";
      case "On Evolve: Look at the top 5 cards of your deck. You may put a follower that costs 3 play points or less from among them onto your field. Put the remaining cards on the bottom of your deck in any order.":
        return "../textures/BP05-071EN.png";
      
      case "Apostle of Silence Evolved":
        return "On Evolve: Each opponent discards a random card. \n While this card is on your field, any spell an opponent plays costs 1 more.";
      case "Masked Puppet Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it 3 damage. If there are 3 cards or less in its controller's hand, destroy it instead. \n At the start of your end phase, select an enemy leader. If there are 3 cards or less in its controller's hand, deal it 3 damage.";
      case "Servant of Lust Evolved":
        return "On Evolve: Summon 2 Puppet tokens. \n During your turn, whenever a follower is put from your field into the cemetery, give this follower [attack]+1.";
      
      case "Marwynn, Omen of Repose Evolved":
        return "Ward. Aura. \n On Evolve: Increase your maximum play points by 1. Give your leader [defense]+3. Draw a card.";
      case "Apostle of Repose Evolved":
        return "On Evolve: Select a reserved enemy follower on the field and banish it. \n At the start of each opponent's main phase, recover 2 play points.";
      case "Unidentified Subject Evolved":
        return "On Evolve: Draw 2 cards. \n Whenever you draw a card outside of your start phase, give this follower [attack]+1 / [defense]+1.";
      case "Demon's Epitaph Evolved":
        return "Bane. \n [lastwords] Deal 2 damage to each enemy leader.";

      case "Mjerrabaine, Omen of One Evolved":
        return "At the start of your end phase, refresh this card and, if there are 2 cards or less in your hand, deal 5 damage to each enemy leader. If there are 0 cards in your hand, deal 5 damage to each enemy follower on the field.";
      case "Apostle of Craving Evolved":
        return "On Evolve: Select another follower on the field. Deal it 3 damage and give it [attack]+3.";
      case "Rosa, Mech Wing Maiden Evolved":
        return "Ward. \n On Evolve: Draw a card.";
      case "Cat Cannoneer Evolved":
        return "On Evolve: Summon an Ancient Artifact token.";
  
      case "Deepwood Anomaly Evolved":
        return "On Evolve: Select an enemy follower on the field and put it on the bottom of its owner's deck. \n When this follower deals attack damage to an enemy leader, you win the game.";
      case "King Elephant Evolved":
        return "Storm. \n On Evolve: Give this follower [attack]+X / [defense]+X. X equals the number of cards in your hand. \n This follower ignores Ward.";
      case "Sukuna, Brave and Small Evolved":
        return "Storm. \n On Evolve: Combo (3) - Give this follower [attack]+1 / [defense]+1. Combo (5) - Give [attack]+3 / [defense]+3 instead.";
      case "Fita the Gentle Elf Evolved":
        return "On Evolve: Give your leader [defense]+1. Draw a card.";
      case "Mars, Silent Flame General Evolved":
        return "On Evolve, [cost0X]: Search your deck for an Officer follower that costs X play points or less and put it onto your field. X equals a number of your choice. \n Whenever an Officer follower is put onto your field, give it [attack]+1.";
      case "Barbarossa Evolved":
        return "Assail. \n [lastwords] Put this card into its owner's EX area.";
      case "Shrouded Assassin Evolved":
        return "Assail. Bane.";
      case "Tristan of the Round Table Evolved":
        return "Ward. \n On Evolve: Select an Arthurian card in your cemetery and add it to your hand.";
      case "Wordwielder Ginger Evolved":
        return "On Evolve: You may put any number of followers from your hand onto your field. Their [fanfare] abilities can't be performed. For the rest of this turn, they can't attack enemies.";
      case "Europa Evolved":
        return "Storm. Bane. Ward.";
      case "Magic Illusionist Evolved":
        return "[lastwords] Earth Rite: Put this follower onto its owner's field.";
      case "Dazzling Healer Evolved":
        return "On Evolve: Spellchain (5) - Give your leader [defense]+2.";
      case "Python Evolved":
        return "On Evolve: Search your deck for up to 10 cards and banish them.";
      case "Lævateinn Dragon, Defense Form Evolved":
        return "Ward. \n Reduce damage dealt to this follower by 1. \n At the start of your end phase, give your leader [defense]+3. \n This follower's name is also Lævateinn Dragon.";
      case "Lævateinn Dragon, Blast Form Evolved":
        return "Intimidate. \n On Evolve: Deal X damage to each enemy follower on the field. X equals 2 times the number of Armed followers on your field. \n This follower's name is also Lævateinn Dragon.";
      case "Star Phoenix Evolved":
        return "Strike: Select an enemy follower on the field and deal it 2 damage.";
      case "Cetus Evolved":
        return "On Evolve: Destroy each of the lowest-cost enemy followers on the field.";
      case "Hippocampus Evolved":
        return "";
      case "Howling Demon Evolved":
        return "Storm. \n On Evolve: If Sanguine is active for you, give your leader [defense]+5.";
      case "Stheno Evolved":
        return "On Evolve: Summon a Serpent token. \n Whenever a Serpent is put onto your field, select an enemy follower on the field and deal it 2 damage.";
      case "Fenrir Evolved":
        return "During your turn, whenever this follower takes damage, select an enemy follower on the field and deal it 3 damage.";
      case "Frogbat Evolved":
        return "At the start of your end phase, give this follower and your leader [defense]+1.";
      case "Dark Jeanne Evolved":
        return "On Evolve: If your leader's [defense] is at least 5, select an enemy follower on the field. Deal 4 damage to it and each leader.";
      case "Zoe, Princess of Goldenia Evolved":
        return "On Evolve: Select an enemy follower on the field and banish it.";
      case "Star Priestess Evolved":
        return "On Evolve: Select an amulet in your cemetery and put it onto your field.";
      case "Mist Shaman Evolved":
        return "On Evolve: Select another follower on your field and give it Aura.";
      case "Israfil Evolved":
        return "Strike: Deal 5 damage to each enemy follower on the field.";
      case "Grimnir, War Cyclone Evolved":
        return "Ward. \n On Evolve, [cost04]: Deal 4 damage to each enemy leader and enemy follower on the field.";
      case "Goblin Princess Evolved":
        return "On Evolve: Put a Goblin King token into your EX area.";
      case "Owlcat Evolved":
        return "On Evolve: Select an enemy follower with 1 attack or less or 1 defense on the field and banish it.";
  
      case "Cosmos Fang Evolved":
        return "On Evolve: Select an enemy follower on the field and return it to its owner's hand. If it's an evolved follower, destroy it instead.";
      case "Slade Blossoming Wolf Evolved":
        return "On Evolve: Draw a card. \n When this card is returned to hand from your field, you may put a [forestcraft] follower that costs 2 play points or less from your hand onto your field.";
      case "Gerbera Bear Evolved":
        return "On Evolve: Search your deck for a Floral Breeze, reveal it, and add it to your hand. \n Whenever a card on your field is returned to hand, give your leader [defense]+1.";
      case "Tweedle Dum, Tweedle Dee Evolved":
        return "On Evolve: Look at the top 4 cards of your deck. You may reveal a card that costs 1 play point from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Valiant Fencer Evolved":
        return "On Evolve: Select a Heroic follower with [evolve] on your field and evolve it.";
      case "Amerro, Spear Knight Evolved":
        return "On Evolve: Select a Heroic card in your cemetery and play it for 0 play points. \n Strike: If there is another Heroic follower on your field, give this follower [attack]+1 / [defense]+1.";
      case "Mach Knight Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it 2 damage. If there are at least 2 Heroic cards in your cemetery, deal 4 damage instead.";
      case "Bladed Hedgehog Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it 2 damage. \n During your turn, whenever an enemy follower is destroyed, give this follower [attack]+1.";
      case "Mystic King Evolved":
        return "On Evolve: Select up to 4 Chess followers with different names that cost 4 play points or less in your cemetery and put them onto your field. \n [act] Put another Chess follower from your field into its owner's cemetery: Select an enemy follower on the field and deal it 5 damage. For the rest of this turn, this card's [act] abilities can't be activated.";
      case "Milady, Mystic Queen Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it X damage. X equals the number of Chess followers on your field.";
      case "Magical Knight Evolved":
        return "On Evolve: Summon a Magical Pawn token. \n Whenever another Chess follower is put onto your field, give it [attack]+1.";
      case "Witch of Sweets Evolved":
        return "On Evolve: Draw a card.";
      case "Lævateinn Dragon Evolved":
        return "Assail. \n On Evolve: Summon a Draconic Weapon token. Recover 2 play points.";
      case "Lævateinn Dragon Attack Form Evolved":
        return "Strike: Select an enemy follower on the field. Deal 4 damage to it and 3 damage to its leader. \n This follower's name is also Lævateinn Dragon.";
      case "Draconir, Knuckle Dragon Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it 2 damage. If there is another Armed follower on your field, deal 4 damage instead.";
      case "Hammer Dragonewt Evolved":
        return "On Evolve: Deal 2 damage to each enemy leader.";
      case "Dragon Summoner Evolved":
        return "On Evolve: Look at the top 3 cards of your deck. You may reveal a [dragoncraft] follower from among them and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Masquerade Ghost Evolved":
        return "Whenever a Ghost is put onto your field, give it [attack]+1. \n Whenever a Ghost you control leaves the field, summon a Gargantuan Ghost token. \n [lastwords] Put this card into its owner's EX area.";
      case "Baccherus, Peppy Ghostie Evolved":
        return "This follower's name is also Ghost. \n [lastwords] Put this card into its owner's EX area.";
      case "Trombone Devil Evolved":
        return "On Evolve: Deal 1 damage to each leader. \n At the start of your end phase, if Sanguine is active for you, select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Mischievous Zombie Evolved":
        return "On Evolve: Select a Ghost on your field and give it Bane.";
      case "Diamond Master Evolved":
        return "On Evolve: Select a follower with Storm or Ward that costs 3 play points or less in your cemetery and put it onto your field. \n Whenever an opponent is selecting cards for an ability, if they can select this card, they must select it.";
      case "Wingy Chirpy Gemstone Evolved":
        return "Ward. \n On Evolve: Search your deck for a follower with 2 attack or less, reveal it, and add it to your hand.";
      case "Ruby Falcon Evolved":
        return "Ward. \n On Evolve: Select an enemy follower on the field and deal it 2 damage. \n [act][cost02]: Give this follower Storm. \n Whenever another follower you control with Storm or Ward attacks, deal 1 damage to each enemy leader.";
      case "Pinion Prince Evolved":
        return "Assail.";
      case "Alice, Wonderland Explorer Evolved":
        return "On Evolve: Look at the top 4 cards of your deck. You may put up to 2 Fable cards from among them into your EX area. Put the remaining cards on the bottom of your deck in any order. \n [act] Remove a Fable counter from this card: Select a Fable follower on your field or in your EX area and put a Fable counter on it.";
      case "Garuel, Seraphic Leo Evolved":
        return "On Evolve: Select another [neutral] follower on your field and return it to its owner's hand.";
      case "Humpty Dumpty Evolved":
        return "On Evolve: Deal 5 damage to each follower on the field. Deal 3 damage to each enemy leader. Discard your hand.";
      case "Harbringer of the Night Evolved":
        return "On Evolve: Deal 1 damage to each enemy leader.";
  
      case "Silence Suzuka Evolved":
        return "Storm. \n On Evolve: Select an enemy follower on the field and put it on top of its owner's deck.";
      case "Tokai Teio Evolved":
        return "Storm.";
      case "Agnes Tachyon Evolved":
        return "On Evolve: Select a spell in your cemetery and add it to your hand. \n Whenever you play a spell, select an enemy follower on the field and give it [attack]-1 / [defense]-1.";
      case "Special Week Evolved":
        return "On Evolve: If Overflow is active for you, give each other Umamusume follower on your field [attack]+1 / [defense]+1.";
      case "Maruzensky Evolved":
        return "On Evolve: Select an enemy follower on the field and give it [attack]-2 / [defense]-2.";
      case "Mejiro McQueen Evolved":
        return "Ward. \n On Evolve: Select an amulet in your cemetery and add it to your hand.";
      case "Carrot":
        return "You can serve a Carrot to an Umamusume follower to race it. (Racing followers have Rush.) \n ---------- \n You can put up to 10 of this card into your evolve deck.";
  
      case "Crystalia Tia Evolved":
        return "On Evolve: Select a Crystalia Eve token on your field. Give it [attack]+1 / [defense]+1 and Rush.";
      case "Grand Archer Seiwyn Evolved":
        return "On Evolve: Select an enemy card that costs 3 play points or less on the field and destroy it.";
      case "Crystalia Lily Evolved":
        return "On Evolve: Select an enemy follower on the field and put it on the bottom of its owner's deck.";
      case "Forest Gigas Evolved":
        return "Ward. \n On Evolve: Select an enemy follower on the field and deal it X damage. X equals this follower's attack.";
      case "Albert Levin Saber Evolved":
        return "Storm. \n On Evolve: For the rest of this turn, this follower doesn't take combat damage. \n Strike: Refresh this follower. Perform this ability only once per turn.";
      case "Leonidas Evolved":
        return "On Evolve: Select an enemy follower on the field. Deal 5 damage to it and this follower. \n [lastwords] Summon a Leonidas's Resolve token.";
      case "Jeno, Levin Vanguard Evolved":
        return "Assail. \n On Evolve: Look at the top 4 cards of your deck. From among them, you may reveal a Levin follower with a different name from this card and add it to your hand. Put the remaining cards on the bottom of your deck in any order.";
      case "Avant Blader Evolved":
        return "On Evolve: Search your deck for up to 2 Officer followers, reveal them, and add them to your hand.";
      case "Daria Dimensional Witch Evolved":
        return "On Evolve: Select a follower in your EX area. For the rest of this turn, it costs 5 less to play. \n On Evolve: Select a spell in your EX area. For the rest of this turn, it costs 5 less to play. \n While this card is on your field, include both spells and [runecraft] followers in your cemetery when counting your Spellchain.";
      case "Anne, Belle oF Mysteria Evolved":
        return "On Evolve: Search your deck for an Academic follower with a different name from this card, reveal it, and add it to your hand.";
      case "Remi & Rami, Witchy Duo Evolved":
        return "On Evolve: Summon a Strikeform Golem token. Earth Rite: Give it [attack]+2.";
      case "Craig, Wizard of Mysteria Evolved":
        return "On Evolve: Draw a card, then discard a card.";
      case "Imperial Dragoon Evolved":
        return "On Evolve: Draw 3 cards.";
      case "Neptune Evolved":
        return "Ward. \n On Evolve: Summon a Megalorca token. \n While this card is on your field, your Megalorca tokens have Storm.";
      case "Siegfried Evolved":
        return "On Evolve: Select an enemy follower with 3 defense or less on the field and destroy it.";
      case "Dragontamer Evolved":
        return "On Evolve, discard a card: Select a Wyrmkin follower in your cemetery and add it to your hand.";
      case "Soul Dealer Evolved":
        return "Ward. \n On Evolve: Select an enemy follower on the field. Destroy it and give your leader [defense]+X. X equals the selected follower's attack.";
      case "Azazel Evolved":
        return "Bane. \n On Evolve: Change each enemy leader's [defense] to 10.";
      case "Veight, Vampire Noble Evolved":
        return "On Evolve: Put a Forest Bat token into your EX area. \n Strike: Summon a Forest Bat token.";
      case "Demonic Hedonist Evolved":
        return "Strike: Deal 1 damage to each leader. \n At the start of your end phase, if Sanguine is active for you, draw a card, then discard a card.";
      case "Heavenly Aegis Evolved":
        return "Aura. \n On Evolve: For the rest of this turn and during each opponent's next turn, this follower doesn't take damage. \n This card can't be destroyed by abilities.";
      case "Kaguya Evolved":
        return "On Evolve: Summon an Ephemeral Moon token. Give your leader [defense]+3. \n Whenever an amulet is put onto your field, select an enemy follower on the field and deal it X damage. X equals the amulet's cost.";
      case "Radiance Angel Evolved":
        return "Ward. \n On Evolve: Give your leader [defense]+2.";
      case "Soul Collector Evolved":
        return "On Evolve: Select a [havencraft] follower in your cemetery and add it to your hand.";
      case "Bahamut Evolved":
        return "On Evolve: Destroy each amulet on the field. \n If there are at least 2 enemy followers on the field, this follower can't attack enemy leaders.";
      case "Archangel Reina Evolved":
        return "Ward. \n On Evolve: Recover X play points. X equals the number of faceup followers in your evolve deck. Turn them facedown.";
      case "Unicorn Dancer Unicorn Evolved":
        return "Strike: Give your leader [defense]+2.";
      case "Sektor Evolved":
        return "Ward.";
  
      case "Priest of the Cudgel Evolved":
        return "On Evolve: Select an enemy follower with 3 defense or less on the field and banish it.";
      case "Ardent Nun Evolved":
        return "Ward. \n During each opponent's turn, this follower deals 2 more damage.";
      case "Guardian Nun Evolved":
        return "Ward. \n On Evolve: Give your leader [defense]+2.";
      case "Playful Necomancer Evolved":
        return "On Evolve: Summon 3 Ghost tokens.";
      case "Lesser Mummy Evolved":
        return "Strike: Summon a Ghost token.";
      case "Lilith Evolved":
        return "Strike: Give your leader [defense]+2.";
      case "Dragon Warrior Evolved":
        return "On Evolve: Select an enemy follower on the field and deal it 3 damage.";
      case "Roc Evolved":
        return "Strike: Give this follower [attack]+1 / [defense]+1.";
      case "Dragonrider Evolved":
        return "On Evolve: If Overflow is active for you, give this follower [attack]+2.";
      case "Demonflame Mage Evolved":
        return "On Evolve: Deal 2 damage to each enemy follower on the field.";
      case "Penguin Wizard Evolved":
        return "On Evolve: Refresh this card. \n [act][engage], discard a spell: Draw a card.";
      case "Sammy Wizard's Apprentice Evolved":
        return "On Evolve: Each player draws a card.";
      case "Floral Fencer Evolved":
        return "On Evolve: Summon a Steelclad Knight and Knight token.";
      case "Oathless Knight Evolved":
        return "Assail.";
      case "Quickblader Evolved":
        return "Storm.";
      case "Rose Gardener Evolved":
        return "On Evolve: Select an enemy follower on the field and return it to its owner's hand. Combo (3): Draw a card. (Tokens returned to a player's hand are removed from the game.)";
      case "Treant Evolved":
        return "";
      case "Water Fairy Evolved":
        return "On Evolve: Summon a Fairy token. \n [lastwords] Put a Fairy token into your EX area.";
      case "Ancient Elf Evolved":
        return "Ward. \n On Evolve, return another card on your field to its owner's hand: Give this follower [attack]+1/[defense]+1.";
  
      case "Rhinoceroach Evolved":
        return "On Evolve: Choose one of the following effects. (1) Give this follower Storm. (2) Select an enemy follower on the field and deal it X damage. X equals this follower's attack.";
      case "Elven Princess Mage Evolved":
        return "On Evolve: Put 2 Fairy Wisp tokens into your EX area.";
      case "Archer Evolved":
        return "Whenever another follower is put onto your field, select up to 2 enemy followers on the field and deal them 1 damage.";
      case "Sea Queen Otohime Evolved":
        return "On Evolve: Summon 3 Otohime's Bodyguard tokens. If your field becomes full from this effect, put any remaining tokens into your EX area.";
      case "Shadowed Assassin Evolved":
        return "On Evolve: Select an engaged enemy follower and destroy it.";
      case "Maid Leader Evolved":
        return "On Evolve: Search your deck for a follower with [evolve], reveal it, and add it to your hand.";
      case "Fervid Soldier Evolved":
        return "Whenever another follower is put onto your field, give this follower [attack]+1.";
      case "Merlin Evolved":
        return "On Evolve: Select a spell that costs 3 play points or less in your cemetery and play it for 0 play points.";
      case "Ancient Alchemist Evolved":
        return "While this card is on your field, your Golem followers cost 1 less to play. \n Whenever a Golem follower is put onto your field, select an enemy leader or enemy follower on the field and deal it 3 damage.";
      case "Spectral Wizard Evolved":
        return "On Evolve, discard a spell: Select an enemy follower on the field and deal it 4 damage.";
      case "Crafty Warlock Evolved":
        return "[lastwords] Summon a Magic Sediment token. Add 1 to a Stack on your field.";
      case "Dark Dragoon Forte Evolved U":
        return "Storm. Aura.";
      case "Shapeshifting Mage Evolved":
        return "Assail. Bane.";
      case "Shenlong Evolved":
        return "Ward. \n On Evolve: Give your leader [defense]+5.";
      case "Ivory Dragon Evolved":
        return "On Evolve: If Overflow is active for you, draw a card.";
      case "Cerberus Evolved":
        return "On Evolve: Put a Mimi and Coco token into your EX area.";
      case "Righteous Devil Evolved":
        return "Assail. Bane. \n Whenever an enemy follower is destroyed, deal 1 damage to its leader and give your leader [defense]+1.";
      case "Crazed Executioner Evolved":
        return "On Evolve: Deal 2 damage to your leader. Select an opponent. They reveal their hand. Select a card in their hand. The opponent discards that card.";
      case "Wardrobe Raider Evolved":
        return "On Evolve, put a follower from your field into its owner's cemetery: Select an enemy follower on the field and destroy it.";
      case "Jeanne d'Arc Evolved":
        return "On Evolve: Deal 2 damage to each enemy follower on the field. Give each other follower on your field [defense]+2.";
      case "Arch Priestess Laelia Evolved":
        return "While this card is on your field, your followers deal damage equal to their defense. \n At the start of your end phase, give this follower [defense]+2.";
      case "Prism Priestess Evolved":
        return "On Evolve: Search your deck for an amulet, reveal it, and add it to your hand.";
      case "Mainyu Evolved":
        return "Aura.";
      case "Lucifer Evolved":
        return "Bane. \n At the start of your end phase, deal 4 damage to each enemy leader.";
      case "Urd Evolved":
        return "On Evolve: Select a card in an opponent's EX area and banish it.";
      case "Bellringer Angel Evolved":
        return "Ward. \n On Evolve: Select an enemy follower on the field and deal it 2 damage. \n [lastwords] Draw a card.";
      case "Goblinmount Demon Evolved":
        return "Ward.";
      case "Goblin Evolved":
        return "";
      case "Goliath Evolved":
        return "";
      case "Healing Angel Evolved":
        return "On Evolve: Give your leader [defense]+2.";
  
      case "Assembly Droid TOKEN":
        return "[act] [engage], bury 3 Machina followers: Select an enemy follower on the field and deal it 5 damage.";
      case "Repair Mode TOKEN":
        return "[quick] \n Give your leader [defense]+1.";
      case "Naterran Great Tree TOKEN":
        return "When this card leaves the field, draw a card, then discard a card. \n [act] [cost01]: Bury this card.";
      case "Enchanted Slippers TOKEN":
        return "Give your leader [defense]+1. Draw a card. \n ---------- \n (At the start of the game, if your deck is based on the THE IDOLM@STER CINDERELLA GIRLS universe, put 5 Magical Item tokens into your EX area.)";
      case "Enchanted Dress TOKEN":
        return "Give your leader [defense]+1. Draw a card. \n ---------- \n  (At the start of the game, if your deck is based on the THE IDOLM@STER CINDERELLA GIRLS universe, put 5 Magical Item tokens into your EX area.)";
      case "Cute Earrings TOKEN":
        return "Give your leader [defense]+1. Draw a card. \n ---------- \n (At the start of the game, if your deck is based on the THE IDOLM@STER CINDERELLA GIRLS universe, put 5 Magical Item tokens into your EX area.)";
      case "Cool Earrings TOKEN":
        return "Give your leader [defense]+1. Draw a card. \n ---------- \n (At the start of the game, if your deck is based on the THE IDOLM@STER CINDERELLA GIRLS universe, put 5 Magical Item tokens into your EX area.)";
      case "Passion Earrings TOKEN":
        return "Give your leader [defense]+1. Draw a card. \n ---------- \n (At the start of the game, if your deck is based on the THE IDOLM@STER CINDERELLA GIRLS universe, put 5 Magical Item tokens into your EX area.)";
      case "Celestial Shikigami TOKEN":
        return "Aura.";
      case "Paper Shikigami TOKEN":
        return "[lastwords] Draw a card. Discard a card.";
      case "One-Tailed Fox TOKEN":
        return "Rush. Ward.";
      case "Destruction in White TOKEN":
        return "At the start of your main phase, give your leader [defense]+2.";
      case "Destruction in Black TOKEN":
        return "At the start of your main phase, deal 2 damage to each enemy leader.";
      case "Puppet TOKEN":
        return "Rush.";
      case "Ancient Artifact TOKEN":
        return "Rush.";
      case "Mystic Artifact TOKEN":
        return "Ward. \n [fanfare] Draw a card.";
      case "Serpent TOKEN":
        return "Bane.";
      case "Goblin King TOKEN":
        return "Ward. \n [fanfare] Give each other Goblinoid follower on your field [attack]+1/[defense]+1.";
      case "Gargantuan Ghost TOKEN":
        return "Ward. \n At the start of your main phase, banish this card.";
      case "Crystalia Eve TOKEN":
        return "";
      case "Shield Guardian TOKEN":
        return "Ward.";
      case "Leonidas's Resolve TOKEN":
        return "Whenever a [swordcraft] follower is put onto your field, give it [attack]+3/[defense]+3 and Rush.";
      case "Magical Pawn TOKEN":
        return "";
      case "Megalorca TOKEN":
        return "";
      case "Hellflame Dragon TOKEN":
        return "Rush,";
      case "Draconic Weapon TOKEN":
        return "[act][engage], put this card into its owner's cemetery: Select a [dragoncraft] follower on your field. Give it [defense]+1 and the Armed trait.";
      case "Ephemeral Moon TOKEN":
        return "While this card is on your field, during your turn, your followers named Kaguya don't take damage. \n At the start of your main phase, banish this card.";
      case "Thorn Burst TOKEN":
        return "Select an enemy leader or enemy follower on the field. Deal it 3 damage and draw a card.";
      case "Fairy Wisp TOKEN":
        return "";
      case "Fairy TOKEN":
        return "";
      case "Otohime's Bodyguard TOKEN":
        return "Ward.";
      case "Knight TOKEN":
        return "";
      case "Viking TOKEN":
        return "Storm.";
      case "Steelclad Knight TOKEN":
        return "";
      case "Strikeform Golem TOKEN":
        return "Rush.";
      case "Guardform Golem TOKEN":
        return "Ward.";
      case "Magic Sediment TOKEN":
        return "Stack";
      case "Dragon TOKEN":
        return "";
      case "Mimi TOKEN":
        return "Select an enemy follower on the field and deal it 2 damage.";
      case "Coco TOKEN":
        return "Select a follower on your field and give it [attack]+2.";
      case "Ghost TOKEN":
        return "Storm.";
      case "Forest Bat TOKEN":
        return "";
      case "Holy Falcon TOKEN":
        return "Storm.";
      case "Holy Tiger TOKEN":
        return "Rush.";
      default:
        return "";
    }
  };
  