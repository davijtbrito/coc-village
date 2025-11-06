Hooks.once('ready', () => {

    if (!game.mainVillage) game.mainVillage = {};

    game.mainVillage = {
        constants: {
            foodSuppliesAddPerWorker: 1,//food supplies produce X per worker
            foodSuppliesDeducePerVillager: 1,//food supplies produce X per villager            
            firewoodsAddPerWorker: 1,//firewoods produce X per worker
            firewoodsDeducePerHouse: 1,//firewoods deduce per house            
            logsAddPerWorker: 1,//logs produce X per worker
            farmsHarvestProduction: 1,//farms produce X each harvest
            farmsHarvestProductionPeriodDays: 1//farms produce X each Y days
        },
        farms: [],        
        workshops: [],
        houses: [],
        villagers: [],
        warehouse: null,        
        calendar:{            
            addDays: async function(sceneId, drawingId, days = 1) {

                if (!game.mainVillage.methods.validateSceneAndDrawing(sceneId, drawingId)) {
                    return;
                }   

                const scene = game.scenes.find(s => s.id === sceneId);                
                const drawing = scene.drawings.get(drawingId);                                

                const fullDate = drawing.text;
                let date = new Date(fullDate);
                date.setDate(date.getDate() + days);
                const strDate = date.toISOString().split("T")[0];
                
                await scene.updateEmbeddedDocuments("Drawing", [{
                    _id: drawingId,
                    text: `Current Date: ${strDate} (${game.mainVillage.calendar.getSeason(date)})`
                }]);
            },
            getSeason(date){
                if (!(date instanceof Date)) {
                    console.error("Invalid date object provided.");
                    return null;
                }

                const month = date.getMonth() + 1; // getMonth() returns 0-11

                if ([12, 1, 2].includes(month)) {
                    return "Winter";
                } else if ([3, 4, 5].includes(month)) {
                    return "Spring";
                } else if ([6, 7, 8].includes(month)) {
                    return "Summer";
                } else if ([9, 10, 11].includes(month)) {
                    return "Autumn";
                }
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
            addWarehouse: function () {
                const startWith = "warehouse";
                const typeActor = "container";

                const warehouse = game.actors.find(p => p.type === typeActor
                    && p.name.toLowerCase().startsWith(startWith));
                
                if (!warehouse) {
                    ui.notifications.error(`No warehouse actor found.`);
                    return;
                }    

                game.mainVillage.warehouse = warehouse;                
            },
            clearAll: function () {
                game.mainVillage.farms = [];        
                game.mainVillage.workshops = [];
                game.mainVillage.houses = [];
                game.mainVillage.villagers = [];
                game.mainVillage.warehouse = null;

                console.log("Village data cleared.");
            },
            setAll: function () {
                game.mainVillage.methods.clearAll();
                game.mainVillage.methods.addAllVillager();
                game.mainVillage.methods.addAllHouses();
                game.mainVillage.methods.addAllFarms();
                game.mainVillage.methods.addAllWorkshops();
                game.mainVillage.methods.addWarehouse();

                console.log("Village data initialized:");
            },
            validateWarehouse: function () {
                if (!game.mainVillage.warehouse) {
                    console.error(`No warehouse actor found.`);
                    return false;
                }

                return true;
            },
            validateSceneAndDrawing: function (sceneId, drawingId) {
                const scene = game.scenes.find(s => s.id === sceneId);
                if (!scene) {
                    ui.notifications.error("No active scene is currently viewed.");
                    return false;
                }

                const drawing = scene.drawings.get(drawingId);
                if (!drawing) {
                    ui.notifications.error(`Drawing with ID "${drawingId}" not found in scene "${scene.name}".`);
                    return false;
                }

                return true;
            }
        },
        cycle:{            
            /**
             * This method updates the food supplies in the warehouse based on the number of workers and villagers.
             * @param {*} sceneId scene id where the workers drawing is located
             * @param {*} workersDrawingId drawing id that contains the total number of workers
             * @param {*} itemId item id of the food supplies in the warehouse
             */
            foodSupplies: async function(sceneId, workersDrawingId, itemId) {                 

                if (!game.mainVillage.methods.validateWarehouse()) {                
                    return;
                }

                const scene = game.scenes.find(s => s.id === sceneId);   

                //getting workers drawing with total workers
                const workersDrawing = scene.drawings.get(workersDrawingId);                

                //getting warehouse actor
                const warehouse = game.mainVillage.warehouse;                
                
                const food = warehouse.items.find(i => i.id === itemId);
                
                //calculating the total to add and deduce from the food supplies
                const add = (Number(workersDrawing.text) * game.mainVillage.constants.foodSuppliesAddPerWorker);
                const deduce = game.mainVillage.villagers.length * game.mainVillage.constants.foodSuppliesDeducePerVillager;

                //updating food quantity
                const newQuantity = food.system.quantity + (add - deduce);
                await food.update({ "system.quantity": newQuantity });

                console.log(`Food supplies. New Quantity: ${newQuantity}`);
            },
            /**
             * This method updates the firewoods in the warehouse based on the number of workers and houses.
             * @param {*} sceneId scene id where the workers drawing is located
             * @param {*} workersDrawingId working drawing id that contains the total number of workers
             * @param {*} itemId item id of the firewoods in the warehouse
             */
            firewoods: async function(sceneId, workersDrawingId, itemId) {        
                
                if (!game.mainVillage.methods.validateWarehouse()) {                
                    return;
                }
                
                const scene = game.scenes.find(s => s.id === sceneId);                   
                const workersDrawing = scene.drawings.get(workersDrawingId);                                
                const warehouse = game.mainVillage.warehouse;                
                const firewoods = warehouse.items.find(i => i.id === itemId);                
                
                const add = (Number(workersDrawing.text) * game.mainVillage.constants.firewoodsAddPerWorker);
                const deduce = game.mainVillage.houses.length * game.mainVillage.constants.firewoodsDeducePerHouse;
                
                const newQuantity = firewoods.system.quantity + (add - deduce);
                await firewoods.update({ "system.quantity": newQuantity });

                console.log(`Firewoods. New Quantity: ${newQuantity}`);
            },
            /**
             * This method updates the logs in the warehouse based on the number of workers.
             * @param {*} sceneId scene id where the workers drawing is located
             * @param {*} workersDrawingId working drawing id that contains the total number of workers
             * @param {*} itemId item id of the logs in the warehouse             
             */
            logs: async function(sceneId, workersDrawingId, itemId) {    
                
                if (!game.mainVillage.methods.validateWarehouse()) {                
                    return;
                }

                const scene = game.scenes.find(s => s.id === sceneId);                   
                const workersDrawing = scene.drawings.get(workersDrawingId);                                
                const warehouse = game.mainVillage.warehouse;                
                const logs = warehouse.items.find(i => i.id === itemId);
                
                //calculating the total to add and deduce from the food supplies
                const add = (Number(workersDrawing.text) * game.mainVillage.constants.logsAddPerWorker);                

                //updating food quantity
                const newQuantity = logs.system.quantity + add;
                await logs.update({ "system.quantity": newQuantity });

                console.log(`Logs. New Quantity: ${newQuantity}`);
            }
        },
        summary: {
            /**
             * Print a text inside a drawing in a scene.
             * @param {*} sceneId id of the scene
             * @param {*} drawingId id of the drawing
             * @param {*} content content to print
             * @returns 
             */
            printInDrawing: async function (sceneId, drawingId, content) {

                if (!game.mainVillage.methods.validateSceneAndDrawing(sceneId, drawingId)) {
                    return;
                }

                const scene = game.scenes.find(s => s.id === sceneId);                
                const drawing = scene.drawings.get(drawingId);                                

                // === Update the drawing text ===
                await scene.updateEmbeddedDocuments("Drawing", [{
                    _id: drawing.id,
                    text: content
                }]);
                
                console.log(`Content printed: ${content}`);
            },
            /**
             * This method prints the demand for food supplies based on the number of villagers.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the food supplies demand
             */
            printDemandForFoodSupplies: async function (sceneId, drawingId) {                                
                const demand = game.mainVillage.constants.foodSuppliesDeducePerVillager;
                const villagers = game.mainVillage.villagers.length;
                const total = villagers * demand;

                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Demand Food Supplies (daily):   ${total}`);

                console.log(`Demand for food supplies printed: ${total}`);
            },
            /**
             * This method prints the demand for firewoods based on the number of houses.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the firewoods demand
             */
            printDemandForFirewoods: async function (sceneId, drawingId) {                                
                const demand = game.mainVillage.constants.firewoodsDeducePerHouse;
                const houses = game.mainVillage.houses.length;
                const total = houses * demand;

                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Demand Firewoods (daily):   ${total}`);

                console.log(`Demand for firewoods printed: ${total}`);
            },
            /**
             * This method prints the total number of adult villagers.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the total adults
             */
            printTotalAdults: async function (sceneId, drawingId) {                
                const total = game.mainVillage.villagers.filter(v => v.isAdult).length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Adults:   ${total}`);

                console.log(`Total adults printed: ${total}`);
            },
            /**
             * This method prints the total number of child villagers.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the total childs
             */
            printTotalChilds: async function (sceneId, drawingId) {                
                const total = game.mainVillage.villagers.filter(v => !v.isAdult).length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Childs:   ${total}`);

                console.log(`Total childs printed: ${total}`);
            },
            /**
             * This method prints the total number of farms.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the total farms
             */
            printTotalFarms: async function (sceneId, drawingId) {                
                const total = game.mainVillage.farms.length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Farms:   ${total}`);

                console.log(`Total farms printed: ${total}`);
            },
            /**
             * This method prints the total number of workshops.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the total workshops
             */
            printTotalWorkshops: async function (sceneId, drawingId) {                
                const total = game.mainVillage.workshops.length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Workshops:   ${total}`);

                console.log(`Total workshops printed: ${total}`);
            },
            /**
             * This method prints the total number of houses.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the total houses
             */
            printTotalHouses: async function (sceneId, drawingId) {                
                const total = game.mainVillage.houses.length;
                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Houses:   ${total}`);

                console.log(`Total houses printed: ${total}`);
            },
            /**
             * This method prints the harvest production based on the number of farms.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} infoId info drawing id to print the production info
             * @param {*} totalId total drawing id to print the total production             
             */
            printHarvestProduction: async function (sceneId, infoId, totalId) {          
                const productionPerFarm = game.mainVillage.constants.farmsHarvestProduction;
                const periodDays = game.mainVillage.constants.farmsHarvestProductionPeriodDays;

                game.mainVillage.summary.printInDrawing(sceneId, infoId, `Farm produce ${productionPerFarm} each ${periodDays} days`);

                const totalProduction = game.mainVillage.farms.length * productionPerFarm;
                game.mainVillage.summary.printInDrawing(sceneId, totalId, `( ${totalProduction} / Harverst )`);                
            },
            /**
             * This method prints the quantity of a specific resource stored in the warehouse.
             * @param {*} sceneId scene id where the drawing is located
             * @param {*} drawingId drawing id to print the resource quantity
             * @param {*} itemId 
             */
            printResourcesFromWarehouse: async function (sceneId, drawingId, itemId) {  
                if (!game.mainVillage.methods.validateWarehouse()) {                
                    return;
                }
                
                const warehouse = game.mainVillage.warehouse;
                const item = warehouse.items.find(i => i.id === itemId);                
                const quantity = item ? item.system.quantity : 0;

                game.mainVillage.summary.printInDrawing(sceneId, drawingId, `Total ${item.name}:   ${quantity}`);                   
                console.log(`Resource from warehouse printed: ${quantity}`);
            }
        }
    }
});