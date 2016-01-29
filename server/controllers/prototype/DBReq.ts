import ExpCreator = require('./ExpCreator');
import ExpGetter = require('./ExpGetter');
import ExpIdChecker = require('./ExpIdChecker');
import Info = require('./Info');
import LastExpGetter = require('./LastExpGetter');
import TutorialCreator = require('./TutorialCreator');
import UserCreator = require('./UserCreator');
import UserGetter = require('./UserGetter');
import UserIdChecker = require('./UserIdChecker');
import UserNameChecker = require('./UserNameChecker');
import UserVerifier = require('./UserVerifier');

/**
 * Try to get a user by id, and creates it if it doesn't exists
 * @param id {Number} id to test
 * @param callback {function} callback to call on the id
 * @memberof DBReq
 */
export function tryUser(id : number, callback : Function) {
    if (id !== undefined && id !== null) {
        new UserIdChecker(id, function(clear : boolean) {
            if (clear) {
                callback(id);
            } else {
                throw new Error('Couldn\'t create user');
            }
        });
    } else {
        throw new Error('Invalid parameters');
    }
}

// Helper for the rest
// http://stackoverflow.com/questions/9830359/apply-an-array-to-a-constructor-function-in-javascript
function construct(constr : any, args : IArguments) {
    var instance = Object.create(constr.prototype);
    var result = constr.apply(instance, args);
    return typeof result === 'object' ? result : instance;  // yes, this is what 'new' does
}

/**
 * Loads every information from an experiment
 * (wraps the {@link Info} constructor)
 * @param id {Number} id of the experiment to load
 * @param finishAction {function} callback on the result when loading is
 * finished
 * @memberof DBReq
 */
export function getInfo(id : number, finishAction : (a:any) => void) {
    new Info(id, finishAction);
}

/**
 * Creates an user
 * (wraps the {@link UserCreator} constructor)
 * @param workerId {string} the name of the person doing the experiment
 * @param age {string} a string representing an age range
 * @param male {boolean} indicates if the user is a man or a woman
 * @param rating {Number} between 1 and 5, describes the level of the user
 * @param lastTime {Number} between 0 and 3 such that
 * <ol start="0">
 *  <li>never played</li>
 *  <li>this year</li>
 *  <li>this month</li>
 *  <li>this week</li>
 * </ol>
 * @param finishAction {function} callback that has as a parameter the id of
 * the new user
 * @memberof DBReq
 */
export function createUser(workerId : string, age : string, male : boolean, rating : number, lastTime : number, finishAction : (a:any) => void ) {
    new UserCreator(workerId, age, male, rating, lastTime, finishAction);
}

/**
 * Creates an experiment
 * (wraps the {@link ExpCreator} constructor)
 * @param userId {Number} id of the user that does the experiment
 * @param experiments {Object[]} array of objects representing the experiments
 * that the user has already done <code>{sceneId: Number, recommendationStyle: string, coins Number[]}</code>
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the coin combination (Number)</li>
 *  <li>the id of the scene (Number)</li>
 *  <li>the recommendation style (string)</li>
 *  <li>the coins (Number[])</li>
 * </ol>
 * @memberof DBReq
 */
export function createExp(userId : number, experiments : any[], finishAction : (a:any) => void) {
    new ExpCreator(userId, experiments, finishAction);
}

/**
 * Creates a tutorial
 * (wraps the {@link TurorialCreator} constructor)
 * @param id {Number} id of the user doing the tutorial
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the generated coins (Number[])</li>
 * </ol>
 * @memberof DBReq
 */
export function createTutorial(id : number, finishAction : (expId : number, coins : number[]) => void) {
    new TutorialCreator(id, finishAction);
}

/**
 * Checks if an user id exists
 * (wraps the {@link UserIdChecker} constructor)
 * @param id {Number} id of the user to check
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 */
export function checkUserId(id : number, finishAction : (a:any) => void) {
    new UserIdChecker(id, finishAction);
}

/**
 * Checks if a workerId exists
 * (wraps the {@link UserNameChecker} constructor)
 * @param id {string} workerId of to test
 * @param finishAction {function} callback that has as a parameter which is a
 * boolean indicating wether the user id exists or not
 * @memberof DBReq
 */
export function checkUserName(name : string, finishAction : (a:any) => void) {
    new UserNameChecker(name, finishAction);
}

/**
 * Checks if an experiment exists
 * (wraps the {@link ExpIdChecker} constructor)
 * @param id {Number} id of the experiment to check
 * @param finishAction {function} callback that has as a parameter which is the
 * id of the scene if the experiment exists, or null otherwise
 * @memberof DBReq
 */
export function checkExpId(id : number, finishAction : (a:any) => void) {
    new ExpIdChecker(id, finishAction);
}

/**
 * Gets the info from all experiment
 * (wraps the {@link ExpGetter} constructor)
 * @param finishAction {function} callback that has as a parameter which is an
 * array of objects containing the id, the username, the name of the scene and
 * the id of the user.
 * @memberof DBReq
 */
export function getAllExps(finishAction : (a:any) => void) {
    new ExpGetter(finishAction);
}

/**
 * Gives access to the last not finished experiment
 * (wraps the {@link LastExpGetter} constructor)
 * @param id {Number} id of the user of who you want the last experiment
 * @param finishAction {function} callback that has as parameters
 * <ol>
 *  <li>the id of the experiment (Number)</li>
 *  <li>the id of the coin combination (Number)</li>
 *  <li>the id of the scene (Number)</li>
 *  <li>the recommendation style (string)</li>
 *  <li>the coins (Number[])</li>
 * </ol>xperiment exists, or null otherwise
 * @memberof DBReq
 */
export function getLastExp(userId : number, finishAction : (expId : number, coinCombinationId : number, sceneId : number, recommendationStyle : string, coins : number[]) => void) {
    new LastExpGetter(userId, finishAction);
}

/**
 * Verifies that a user has correctly done all the experiments
 * (wraps the {@link UserVerifier} constructor)
 * @param userId {Number} id of the user to verify
 * @param finishAction {function} callback that has as parameter a boolean
 * which is true is the verification was a success
 * @memberof DBReq
 */
export function verifyUser(id : number, finishAction : (a:boolean) => void) {
    new UserVerifier(id, finishAction);
}

/**
 * Gets the "valid" attribute of a user in the databse
 * (wraps the {@link UserGetter} constructor)
 * @param userId {Number} id of the user
 * @param finishAction {function} callback that has as parameters :
 * <ol>
 *  <li>the workerId of the user (string)</li>
 *  <li>the "valid" attribute of the database (boolean)</li>
 * </ol>
 * @memberof DBReq
 */
export function getUser(userId : number, finishAction : (workerId : string, valid : boolean) => void) {
    new UserGetter(userId, finishAction);
}
