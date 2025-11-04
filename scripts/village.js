Hooks.once('ready', () => {

    if (!game.mainVillage) game.mainVillage = {};

    game.mainVillage = {
        farms: [],
        totalWorkshops: [],
        houses: [],
        villagers: [],
        events: {
            runCycle: function () {
                console.log('Running village cycle...');
            }
        },
        methods: {
            addAllVillager: function () {
                const startsWith = "adult:";
                const typeNPC = "npc";

                const allVillageActors = game.actors.filter(p => p.type === typeNPC
                    && p.name.toLowerCase().startsWith(startsWith));

                game.mainVillage.villagers = [];
                allVillageActors.forEach(v => {
                    const villager = {
                        id: v.id,
                        name: v.name,
                    };

                    game.mainVillage.villagers.push(villager);
                });
            },
            addAllHouses: function () {
                const startWith = "house";
                const typeActor = "container";

                const allHousesActors = game.actors.filter(p => p.type === typeActor
                    && p.name.toLowerCase().startsWith(startWith));

                game.mainVillage.houses = [];
                allHousesActors.forEach(h => {
                    const house = {
                        id: h.id,
                        name: h.name,
                    };

                    game.mainVillage.houses.push(house);
                });
            },
            addAllFarms: function () {
                const startWith = "farm";
                const typeActor = "container";

                const allFarms = game.actors.filter(p => p.type === typeActor
                    && p.name.toLowerCase().startsWith(startWith));

                game.mainVillage.farms = [];
                allFarms.forEach(h => {
                    const farm = {
                        id: h.id,
                        name: h.name,
                    };

                    game.mainVillage.farms.push(farm);
                });
            },
            addAllWorkshops: function () {
                const startWith = "workshop";
                const typeActor = "container";

                const allWorkshops = game.actors.filter(p => p.type === typeActor
                    && p.name.toLowerCase().startsWith(startWith));

                game.mainVillage.workshops = [];
                allWorkshops.forEach(h => {
                    const workshop = {
                        id: h.id,
                        name: h.name,
                    };

                    game.mainVillage.workshops.push(workshop);
                });
            },
            addAllBuildings: function () {
                game.mainVillage.methods.addAllHouses();
                game.mainVillage.methods.addAllFarms();
                game.mainVillage.methods.addAllWorkshops();
            }
        }
    }
});