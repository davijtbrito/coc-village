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
                const startsWithAdult = "adult:";
                const startsWithChild = "child:";
                const typeNPC = "npc";

                // first add adults
                const allAdults = game.actors.filter(p => p.type === typeNPC
                    && p.name.toLowerCase().startsWith(startsWithAdult));

                game.mainVillage.villagers = [];
                allAdults.forEach(v => {
                    const villager = {
                        id: v.id,
                        name: v.name,
                        isAdult: true
                    };

                    game.mainVillage.villagers.push(villager);
                });

                // now add childs
                const allChilds = game.actors.filter(p => p.type === typeNPC
                    && p.name.toLowerCase().startsWith(startsWithChild));

                allChilds.forEach(v => {
                    const villager = {
                        id: v.id,
                        name: v.name,
                        isAdult: false
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
        },
        summary: {
            printInDrawing: async function (sceneId, drawingId, content) {
                const scene = game.scenes.find(s => s.id === sceneId);
                if (!scene) {
                    ui.notifications.error("No active scene is currently viewed.");
                    return;
                }

                const drawing = scene.drawings.get(drawingId);
                if (!drawing) {
                    ui.notifications.error(`Drawing with ID "${drawingId}" not found in scene "${scene.name}".`);
                    return;
                }                

                // === Update the drawing text ===
                await scene.updateEmbeddedDocuments("Drawing", [{
                    _id: drawing.id,
                    text: content
                }]);
            },
            printTotalAdults: async function (sceneId, drawingId) {                
                const total = game.mainVillage.villagers.filter(v => v.isAdult).length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Total Adults:   ${total}`);
            },
            printTotalChilds: async function (sceneId, drawingId) {                
                const total = game.mainVillage.villagers.filter(v => !v.isAdult).length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Total Childs:   ${total}`);
            },
            printTotalFarms: async function (sceneId, drawingId) {                
                const total = game.mainVillage.farms.length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Total Farms:   ${total}`);
            },
            printTotalWorkshops: async function (sceneId, drawingId) {                
                const total = game.mainVillage.workshops.length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Total Workshops:   ${total}`);
            },
            printTotalHouses: async function (sceneId, drawingId) {                
                const total = game.mainVillage.houses.length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Total Houses:   ${total}`);
            }
        }
    }
});