class SaveManager {
    constructor() {
        this.checkLocalStorage()
        //if ls supported, get ls data. Otherwise, check for cookie data.
    }
    get savedData() {
        //compile all the localSave tokens into an object, parsing as we go, and return that
    }
    set savedData(davedData) {
        //Stringify everything, and save all the tokens as necessary.
    }
    checkLocalStorage() {
        //See if localStorage is supported; return true or false
    }
    getSave(key) {
        //get the saved data; parse it if necessary
        //cookie support
    }
    setSave(key,data) {
        //set the data, stringify if necisary
        //cookie support
    }
    checkSave(key) {
        //check if data for a given key is stored, return true or false
    }
    deleteSave(key) {
        //delete save "key"
    }
}