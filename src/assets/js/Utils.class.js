/** class Utils */
class UtcUtils {

  /** constructor() */
  constructor() {
    // hola class!
  }

  /**
   * Create report text
   * @param {array} checkedItems - Create report text
   * @return {string} Report text
   */
  static createSimpleReport(checkedItems) {
    if(0 === checkedItems.length) {
      return false;
    } else {
      return checkedItems.join(', ');      
    }
  }

  /**
   * Get cards of a list
   * @param {string} cardId - 
   * @param {number} lastNDays - 
   * @return {Promise} Promise object
   */
  static getCardsOfList(cardId, lastNDays) {
    let now = Date.now(),
        endDate = new Date(now).toISOString(),
        startDate = new Date(now - 7*24*60*60*1000).toISOString(); // defaults to last week
    if(!isNaN(lastNDays)) {
      startDate = new Date(now - lastNDays*24*60*60*1000).toISOString();
    }
    return new Promise((resolve, reject) => {
      Trello.get(`lists/${cardId}/cards`, {
        since: startDate,
        before: endDate
      }, resolve, reject);
    });
  }  

  /**
   * Get current user data
   * @return {Promise} Promise object
   */
  static getMe() {
    return new Promise((resolve, reject) => {
      Trello.members.get('me', {}, resolve, reject);
    });
  }

  /**
   * Authorizes application with Trello object
   */
  static authorizeUserToApp() {
    return new Promise((resolve, reject) => {
      Trello.authorize({
        type: 'popup',
        name: 'untitled trello api client',
        scope: {
          read: true
        },
        interactive: arguments.length !== 0, // true means user clicked
        expiration: '30days',
        success: resolve,
        error: reject
      });      
    });
  }

  /**
   * de-authorizes application with Trello object
   */
  static deAuthorizeUserFromApp() {
    Trello.deauthorize();
  }

  /**
   * Renders a cards table
   * @param {array} cards - List of cards
   * @return {string} HTML markup data table
   */
  static renderCardsTable(cards) {
    return `
      <table id="utc-data-table" class="u-full-width">
        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>#</th>
            <th>Card Name</th>
            <th>Card Short ID</th>
          </tr>
        </thead>
        <tbody>
          ${cards.map((card, index) => this.renderCardsTableRow(card, index)).join('')}
        </tbody>
        <tfoot>
          <tr>
            <th>&nbsp;</th>
            <th>#</th>
            <th>Card Name</th>
            <th>Card Short ID</th>
          </tr>
        </tfoot>
      </table>`;
  }

  /**
   * Renders a single cards table row
   * @param {object} card - A single card object
   * @param {number} index - Card index
   * @return {string} HTML markup for single table row
   */
  static renderCardsTableRow(card, index) {
    return `
      <tr>
        <td><input type="checkbox" data-report-string="${card.name} (#${card.idShort})"></td>
        <td>${index+1}</td>
        <td>${card.name}</td>
        <td>#${card.idShort}</td>
      </tr>`;
  }

  /**
   * Filter cards user
   * @param {array} cardsToBeFiltered - Cards to be filtered
   * @param {string} userId - Cards to be filtered
   * @return {array} Fitered cards (cards of current user)
   */
  static filterCardsOfuser(cardsToBeFiltered, userId) {
    return cardsToBeFiltered.filter((card) => {
      let isUserAssignedToThisCard = card.idMembers.find((member) => {
        return member === userId
      });
      return 'undefined' !== typeof isUserAssignedToThisCard;
    });
  }

  /**
   * Sort cards
   * @param {array} cardsToBeSorted - Cards to be sorted
   */
  static sortCardsByIdShort(cardsToBeSorted) {
    cardsToBeSorted.sort((first, second) => second.idShort - first.idShort);
  }

}
