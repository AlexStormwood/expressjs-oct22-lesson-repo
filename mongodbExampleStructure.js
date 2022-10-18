let AmazingHero = {
    name: "Some Guy",
    level: 99
}

let AmazingWizard = {
    name: "Some Wizard",
    level: 99,
    spells: [
        {spellName: "fireball", damage:"a lot"},
        {spellName: "cone of cold", damage:" also a lot"}
    ]
}


let characterDB = {};
characterDB.characters = [];
characterDB.characters.push(AmazingHero, AmazingWizard);

console.log(JSON.stringify(characterDB))










// let database = {};

// let firstTable = {};

// let firstRecord = {};

// database.firstTable = firstTable;

// database.firstTable.firstRecord = firstRecord;

// let firstCollection = firstTable;

// let firstDocument = firstRecord;

// database.firstCollection = firstCollection;

// database.firstCollection.firstDocument = firstDocument;
